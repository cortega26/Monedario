#!/usr/bin/env python3
"""
RM-021 — Calibracion mensual del filtro contra etiquetas humanas.

Recalcula los umbrales de intent-score (cortes Alta/Media de
monitor.confidence_label) y evalua los ml_prototypes_* contra las etiquetas
de human_reviews, y emite un REPORTE de drift de precision/recall.

- SOLO LECTURA sobre reddit_monitor.db (via dataset.open_readonly: no corre
  schema.sql ni exige version, sirve sobre una copia).
- NUNCA reescribe config.json solo: los cortes sugeridos se imprimen para
  que un humano los aplique (cambiar semántica de alertas sin ADR es STOP).
- Sin etiquetas (human_reviews vacia) imprime "insufficient labels" y sale 0
  — nunca fabrica numeros.
- Salida: reporte a stdout + UNA linea jsonl a calibration_history.jsonl en
  el workdir (para comparar drift contra la corrida anterior).
- Sin cron/timer: es un script manual mensual (fuera de alcance RM-021
  agregar superficie programada).

Uso: python3 calibrate.py <directorio_de_trabajo> [--solo-explicitas]
"""
import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import dataset  # noqa: E402
import eval_filter  # noqa: E402
import monitor  # noqa: E402 (cortes vigentes de confidence_label)

CHILE_TZ = timezone(timedelta(hours=-3))
HISTORY_FILE = "calibration_history.jsonl"


def current_cutoffs() -> tuple[int, int]:
    """Cortes vigentes (Alta>=A, Media>=M) derivados del codigo real, no de
    numeros copiados a mano: el menor score que da cada etiqueta."""
    alta = min(s for s in range(0, 20) if monitor.confidence_label(s) == "Alta")
    media = min(s for s in range(0, 20) if monitor.confidence_label(s) == "Media")
    return alta, media


def threshold_sweep(matches: list[dataset.Example]) -> list[dict]:
    """Barrido del corte t sobre intent_score (predice relevante si
    score >= t): precision/recall/F1 por t. Solo matches con score conocido
    (los descartes no guardan intent_score)."""
    scored = [(e.intent_score, e.label) for e in matches if e.intent_score is not None]
    n_pos = sum(y for _, y in scored)
    rows = []
    for t in range(0, 7):
        pred = [s >= t for s, _ in scored]
        tp = sum(1 for (s, y), p in zip(scored, pred) if p and y == 1)
        fp = sum(1 for (s, y), p in zip(scored, pred) if p and y == 0)
        prec = tp / (tp + fp) if (tp + fp) else 0.0
        rec = tp / n_pos if n_pos else 0.0
        f1 = 2 * prec * rec / (prec + rec) if (prec + rec) else 0.0
        rows.append({"t": t, "n_pred": tp + fp, "precision": prec, "recall": rec, "f1": f1})
    return rows


def tier_precision(matches: list[dataset.Example], tier: str) -> tuple[int, int]:
    sub = [e for e in matches if e.rule_confidence == tier]
    return sum(e.label for e in sub), len(sub)


def load_last_history(workdir: Path) -> dict | None:
    path = workdir / HISTORY_FILE
    if not path.exists():
        return None
    last = None
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            try:
                last = json.loads(line)
            except ValueError:
                continue
    return last


def prototype_inventory(workdir: Path) -> str:
    """Inventario de prototipos ML vigentes (conteo + version de modelo).
    Los textos NO se reescriben aqui: re-entrenarlos exige recalcular
    embeddings contra las etiquetas, fuera del alcance de este reporte."""
    cfg_path = workdir / "config.json"
    if not cfg_path.exists():
        return "config.json ausente en el workdir: no se pudo inventariar prototipos."
    try:
        cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    except ValueError as exc:
        return f"config.json ilegible ({exc}): no se pudo inventariar prototipos."
    n_int = len(cfg.get("ml_prototypes_intent", []))
    n_noi = len(cfg.get("ml_prototypes_noise", []))
    try:
        import semantic  # noqa: PLC0415 (solo MODEL_VERSION, sin cargar torch)
        ver = semantic.MODEL_VERSION
    except ImportError:
        ver = "(semantic.py no importable)"
    return (f"{n_int} intent + {n_noi} noise, modelo {ver} — "
            "SIN CAMBIOS en este reporte (re-tuning manual con n>=30).")


def build_report(examples: list[dataset.Example], workdir: Path) -> tuple[list[str], dict]:
    matches = [e for e in examples if e.source == "match"]
    alta_cut, media_cut = current_cutoffs()
    k_alta, n_alta = tier_precision(matches, "Alta")
    scored_ml = [(e.ml_confidence, e.label) for e in examples if e.ml_confidence is not None]
    auc_ml = eval_filter.auc(scored_ml)
    sweep = threshold_sweep(matches)
    best = max(sweep[1:], key=lambda r: (r["f1"], -r["t"]))  # t>=1: t=0 es trivial

    lines = [
        f"Calibracion mensual — {datetime.now(tz=CHILE_TZ).strftime('%Y-%m-%d')}",
        f"Ejemplos: {len(examples)} "
        f"({sum(e.explicit for e in examples)} explicitos; "
        f"{sum(e.label for e in examples)} relevante / "
        f"{sum(not e.label for e in examples)} ruido)",
        f"Cortes vigentes (monitor.confidence_label): Alta>= {alta_cut}, Media>= {media_cut}",
        "",
        "Precision por nivel (linea base, ver eval_filter.py):",
    ]
    lines.extend("  " + ln for ln in eval_filter.evaluate(examples))
    lines.append("")
    lines.append("Barrido de corte sobre intent_score (predice relevante si score>=t):")
    lines.append("  t | n_pred | precision | recall | F1")
    for r in sweep:
        mark = "  <-- candidato" if r["t"] == best["t"] else ""
        lines.append(f"  {r['t']} | {r['n_pred']} | {r['precision']:.0%} | "
                     f"{r['recall']:.0%} | {r['f1']:.2f}{mark}")
    if len(matches) < eval_filter.MIN_N:
        lines.append(f"  [no concluyente: n_matches={len(matches)} < {eval_filter.MIN_N}; "
                     "el candidato es orientativo, no orden de cambio]")
    else:
        lines.append(f"  Candidato a corte Alta: score>= {best['t']} "
                     f"(F1={best['f1']:.2f}); aplicar a mano en config/codigo + ADR si "
                     "cambia semantica de alertas.")
    lines.append("")
    lines.append("Capa semantica (ml_prototypes_* + ml_confidence guardado):")
    if auc_ml is None:
        lines.append(f"  AUC no calculable (n={len(scored_ml)}; falta una clase o no hay scores).")
    else:
        flag = "" if len(scored_ml) >= eval_filter.MIN_N else (
            f"  [no concluyente: n < {eval_filter.MIN_N}]")
        lines.append(f"  AUC = {auc_ml:.2f} (n={len(scored_ml)}){flag}")
    lines.append(f"  Prototipos: {prototype_inventory(workdir)}")
    lines.append("")

    prev = load_last_history(workdir)
    entry = {
        "ts": datetime.now(tz=CHILE_TZ).isoformat(),
        "n": len(examples),
        "n_relevante": sum(e.label for e in examples),
        "precision_alta": round(k_alta / n_alta, 4) if n_alta else None,
        "n_alta": n_alta,
        "auc_ml": round(auc_ml, 4) if auc_ml is not None else None,
        "corte_alta_vigente": alta_cut,
        "corte_media_vigente": media_cut,
        "corte_alta_candidato": best["t"],
        "f1_candidato": round(best["f1"], 4),
    }
    lines.append("Drift vs corrida anterior:")
    if prev is None:
        lines.append("  Sin baseline previa: esta corrida ES la baseline "
                     f"({HISTORY_FILE} se crea ahora).")
    else:
        bits = [f"baseline {prev.get('ts', '?')} (n={prev.get('n', '?')})"]
        if prev.get("precision_alta") is not None and entry["precision_alta"] is not None:
            d = entry["precision_alta"] - prev["precision_alta"]
            bits.append(f"precision Alta {prev['precision_alta']:.0%} -> "
                        f"{entry['precision_alta']:.0%} (Δ{d:+.0%})")
        if prev.get("auc_ml") is not None and entry["auc_ml"] is not None:
            d = entry["auc_ml"] - prev["auc_ml"]
            bits.append(f"AUC ml {prev['auc_ml']:.2f} -> {entry['auc_ml']:.2f} (Δ{d:+.2f})")
        if len(bits) == 1:
            bits.append("sin metricas comparables en la baseline (nulos).")
        lines.extend(f"  {b}" for b in bits)
    return lines, entry


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Calibracion mensual (reporte, solo lectura).")
    parser.add_argument("workdir", type=Path)
    parser.add_argument("--solo-explicitas", action="store_true",
                        help="ignora las etiquetas implicitas (mas ruidosas)")
    args = parser.parse_args(argv)

    db_path = args.workdir / "reddit_monitor.db"
    if not db_path.exists():
        print(f"ERROR: no existe {db_path}", file=sys.stderr)
        return 1
    conn = dataset.open_readonly(db_path)
    try:
        examples = dataset.load_examples(conn)
    finally:
        conn.close()
    if args.solo_explicitas:
        examples = [e for e in examples if e.explicit]

    if not examples:
        print("insufficient labels: human_reviews esta vacia — no hay nada que "
              "calibrar. Etiqueta matches/descartes en /revision y vuelve el "
              "proximo mes. (Sin etiquetas no se ajusta ningun umbral.)")
        return 0

    lines, entry = build_report(examples, args.workdir)
    print("\n".join(lines))
    with (args.workdir / HISTORY_FILE).open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
    print(f"(linea agregada a {HISTORY_FILE})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
