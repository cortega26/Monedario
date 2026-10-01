# /// script
# requires-python = ">=3.13"
# dependencies = ["matplotlib==3.10.6"]
# ///
"""Render review-only charts from documented checkpoints, never a fabricated series.

Run: uv run --python 3.13 --script scripts/render_compound_interest_charts.py
Matplotlib is isolated by uv; the project's Python/Node manifests stay unchanged.
The renderer does not audit or publish. It always labels output as pending review.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import platform
from datetime import date
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "scripts/hero-images/data/compound-interest-checkpoints.json"
DEFAULT_OUTPUT = ROOT / "output/hero-images/compound-review"
PENDING = "PENDING_INDEPENDENT_AUDIT"
BG = "#f7f4ed"
INK = "#17334a"
TEAL = "#167b7e"
MUTED = "#59666d"
GRID = "#dddcd5"


def load_data(path: Path = DATA_PATH) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("schemaVersion") != 1 or data.get("status") != PENDING:
        raise ValueError("Expected the v1, pending-review checkpoint dataset")
    if data.get("currency") != "USD" or data.get("interpolation") != "none":
        raise ValueError("Chart requires USD checkpoints with no interpolation")
    if data.get("grain") != "documented_checkpoints_only":
        raise ValueError("Monthly or synthetic series are outside this renderer")
    cutoff = date.fromisoformat(data["cutoffDate"])
    sources = {source["id"] for source in data["sources"]}
    checkpoints = data["checkpoints"]
    if not checkpoints:
        raise ValueError("At least one documented checkpoint is required")
    previous = None
    for row in checkpoints:
        current = date.fromisoformat(row["date"])
        if current > cutoff or (previous is not None and current <= previous):
            raise ValueError("Checkpoint dates must be unique, increasing and within cutoff")
        if type(row["usd"]) is not int or row["usd"] < 0:
            raise ValueError("USD checkpoint must be a nonnegative integer")
        if row["sourceRef"] not in sources:
            raise ValueError("Every checkpoint requires source provenance")
        previous = current
    if previous != cutoff:
        raise ValueError("The final checkpoint must coincide with the closing FX cutoff")
    fx = data["closingFx"]
    rate = Decimal(fx["clpPerUsd"])
    if not rate.is_finite() or rate <= 0:
        raise ValueError("Closing FX must be finite and positive")
    if date.fromisoformat(fx["observedAt"]) > cutoff or fx["sourceRef"] not in sources:
        raise ValueError("Closing FX must have an in-period date and source")
    return data


def closing_conversion(data: dict) -> dict[str, str]:
    """Convert the declared endpoint; this does not validate its financial origin."""
    usd = Decimal(data["checkpoints"][-1]["usd"])
    rate = Decimal(data["closingFx"]["clpPerUsd"])
    exact = usd * rate
    return {
        "usd": str(usd),
        "clpPerUsd": str(rate),
        "clpExact": format(exact, ".2f"),
        "clpRounded": str(exact.quantize(Decimal("1"), rounding=ROUND_HALF_UP)),
        "clpMillions": str((exact / 1_000_000).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)),
        "rounding": "ROUND_HALF_UP",
        "scope": "conversion_of_declared_checkpoint_only",
    }


def es_number(value: int | Decimal, decimals: int = 0) -> str:
    return f"{value:,.{decimals}f}".translate(str.maketrans({",": ".", ".": ","}))


def checked_output_directory(path: Path) -> Path:
    resolved = path.resolve()
    for forbidden in (ROOT / "public", ROOT / "src"):
        if resolved == forbidden or forbidden in resolved.parents:
            raise ValueError("Review candidates cannot be written under public/ or src/")
    return resolved


def build_figure(data: dict, variant: str):
    # Deferred import lets data/Decimal tests run without the optional plot dependency.
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib import font_manager
    from matplotlib.ticker import FuncFormatter

    if variant not in {"hero", "inline"}:
        raise ValueError("Unknown figure variant")
    for font in ("inter-latin-400.ttf", "inter-latin-900.ttf"):
        font_manager.fontManager.addfont(str(ROOT / "public/fonts" / font))
    plt.rcParams.update(
        {"font.family": ["Inter", "DejaVu Sans"], "svg.hashsalt": "monedario-compound-v1"}
    )
    hero = variant == "hero"
    fig = plt.figure(figsize=(12, 6.3 if hero else 8.4), dpi=100, facecolor=BG)
    fig.text(0.055, 0.94, "MONEDARIO  /  INTERÉS COMPUESTO", size=12, color=MUTED)
    fig.text(0.945, 0.94, "BORRADOR · AUDITORÍA PENDIENTE", ha="right", size=11, color=MUTED)
    fig.text(0.055, 0.85, "Hitos de una simulación", size=30, weight="bold", color=INK)
    fig.text(
        0.055,
        0.793,
        "Valor nominal de la cartera en USD · Hitos al cierre de diciembre",
        size=13,
        color=MUTED,
    )
    rows = data["checkpoints"]
    labels = [row["date"][:4] for row in rows]
    values = [row["usd"] for row in rows]
    colors = [INK] * (len(rows) - 1) + [TEAL]
    ax = fig.add_axes(
        [0.085, 0.28 if hero else 0.285, 0.845, 0.41 if hero else 0.425], facecolor=BG
    )
    ax.set_axisbelow(True)
    if hero:
        ax.bar(labels, values, width=0.53, color=colors)
        ax.set_ylim(0, 160_000)
        ax.set_yticks([0, 50_000, 100_000, 150_000])
        ax.yaxis.set_major_formatter(FuncFormatter(lambda value, _: es_number(int(value))))
        ax.grid(axis="y", color=GRID, linewidth=0.8)
        for index, value in enumerate(values):
            ax.annotate(
                es_number(value),
                (index, value),
                xytext=(0, 7),
                textcoords="offset points",
                ha="center",
                size=12,
                color=INK,
            )
    else:
        ax.barh(labels, values, height=0.5, color=colors)
        ax.invert_yaxis()
        ax.set_xlim(0, 160_000)
        ax.set_xticks([0, 50_000, 100_000, 150_000])
        ax.xaxis.set_major_formatter(FuncFormatter(lambda value, _: es_number(int(value))))
        ax.grid(axis="x", color=GRID, linewidth=0.8)
        for index, value in enumerate(values):
            ax.annotate(
                es_number(value),
                (value, index),
                xytext=(7, 0),
                textcoords="offset points",
                va="center",
                size=13,
                color=INK,
            )
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(GRID)
    ax.tick_params(axis="both", colors=MUTED, length=0, labelsize=11, pad=9)
    conversion = closing_conversion(data)
    converted = conversion["clpMillions"].replace(".", ",")
    fig.text(
        0.055,
        0.155 if hero else 0.20,
        f"Cierre declarado: USD {es_number(values[-1])} ≈ CLP {converted} millones",
        size=16 if hero else 19,
        weight="bold",
        color=INK,
    )
    fig.text(
        0.055,
        0.106 if hero else 0.155,
        f"Conversión: {es_number(Decimal(conversion['clpPerUsd']), 2)} CLP/USD · SII {data['closingFx']['observedAt']} · Corte {data['cutoffDate']}",
        size=11,
        color=MUTED,
    )
    fig.text(
        0.055,
        0.061 if hero else 0.103,
        "Hitos transcritos del artículo; no representan una serie mensual ni sus caídas intermedias.",
        size=10.5,
        color=MUTED,
    )
    fig.text(
        0.055,
        0.023 if hero else 0.062,
        "Ejercicio educativo sin costos ni impuestos. No garantiza rentabilidad futura.",
        size=10.5,
        color=MUTED,
    )
    return fig


def accessible_text(data: dict) -> str:
    rows = "\n".join(
        f"- Diciembre {row['date'][:4]}: USD {es_number(row['usd'])}."
        for row in data["checkpoints"]
    )
    conversion = closing_conversion(data)
    return (
        "BORRADOR — pendiente de auditoría independiente.\n\n"
        "Hitos de una simulación. Valores nominales de la cartera en USD, "
        "transcritos de la tabla del artículo. Barras con escala lineal desde cero.\n\n"
        f"{rows}\n\n"
        f"Conversión del último hito: USD {conversion['usd']} x "
        f"{conversion['clpPerUsd']} CLP/USD = CLP {conversion['clpExact']}.\n"
        f"Tipo de cambio SII observado el {data['closingFx']['observedAt']}; corte del ejercicio {data['cutoffDate']}.\n\n"
        + "\n".join(data["limitations"])
        + "\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    out = checked_output_directory(args.out)
    data = load_data()
    out.mkdir(parents=True, exist_ok=True)
    import matplotlib
    import matplotlib.pyplot as plt

    artifacts = []
    for variant in ("hero", "inline"):
        figure = build_figure(data, variant)
        for extension in ("png", "svg"):
            target = out / f"compound-interest-{variant}-review.{extension}"
            metadata = (
                {"Date": None} if extension == "svg" else {"Software": "monedario-compound-v1"}
            )
            figure.savefig(target, dpi=100, facecolor=BG, metadata=metadata)
            artifacts.append(
                {"file": target.name, "sha256": hashlib.sha256(target.read_bytes()).hexdigest()}
            )
        plt.close(figure)
    with (out / "checkpoints.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["date", "usd", "sourceRef"])
        writer.writeheader()
        writer.writerows(data["checkpoints"])
    (out / "accessible-description.txt").write_text(accessible_text(data), encoding="utf-8")
    manifest = {
        "status": PENDING,
        "python": platform.python_version(),
        "matplotlib": matplotlib.__version__,
        "dataSha256": hashlib.sha256(DATA_PATH.read_bytes()).hexdigest(),
        "rendererSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "conversion": closing_conversion(data),
        "artifacts": artifacts,
        "publicFilesChanged": False,
    }
    text = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    (out / "render-manifest.json").write_text(text, encoding="utf-8")
    print(text, end="")


if __name__ == "__main__":
    main()
