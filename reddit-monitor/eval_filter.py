#!/usr/bin/env python3
"""
Etapa 2: linea base. Mide el filtro ACTUAL (reglas y capa semantica) contra
las etiquetas humanas, antes de entrenar nada — es el numero a superar.

Que mide, y por que cada pieza depende de datos distintos:
  - Precision de las reglas: de los matches que dejaron pasar y que Carlos
    etiqueto, cuantos eran accionables. Solo necesita etiquetas sobre matches.
  - Falsos negativos: de los descartes automaticos etiquetados, cuantos eran
    accionables. Solo se mide con etiquetas sobre `discarded` (/revision las
    muestrea); sin ellas el recall es DESCONOCIDO, no bueno.
  - AUC de ml_confidence: si el score semantico ordena mejor que el azar
    (0,5 = azar). Necesita ejemplos de ambas clases.

Con pocos ejemplos los porcentajes enganan, asi que cada cifra lleva su n y
un intervalo de Wilson al 95 %; por debajo de MIN_N se marca "no concluyente".

Uso: python3 eval_filter.py <directorio_de_trabajo> [--solo-explicitas]
"""
import argparse
import math
from pathlib import Path

import dataset

MIN_N = 30


def wilson(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Intervalo de Wilson para una proporcion k/n (estable con n chico)."""
    if n == 0:
        return (0.0, 1.0)
    p = k / n
    denom = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / denom
    half = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denom
    return (max(0.0, centre - half), min(1.0, centre + half))


def auc(scored: list[tuple[float, int]]) -> float | None:
    """AUC por rangos (Mann-Whitney) con empates a medio punto. None si falta
    alguna de las dos clases."""
    pos = [s for s, y in scored if y == 1]
    neg = [s for s, y in scored if y == 0]
    if not pos or not neg:
        return None
    wins = sum((p > q) + 0.5 * (p == q) for p in pos for q in neg)
    return wins / (len(pos) * len(neg))


def proportion_line(label: str, k: int, n: int) -> str:
    if n == 0:
        return f"{label}: sin datos"
    lo, hi = wilson(k, n)
    flag = "" if n >= MIN_N else "  [no concluyente: n < %d]" % MIN_N
    return f"{label}: {k}/{n} = {k / n:.0%}  (IC95 {lo:.0%}-{hi:.0%}){flag}"


def evaluate(examples: list[dataset.Example]) -> list[str]:
    lines = [f"Ejemplos etiquetados: {len(examples)} "
             f"({sum(e.explicit for e in examples)} explicitos, "
             f"{sum(not e.explicit for e in examples)} implicitos)", ""]
    matches = [e for e in examples if e.source == "match"]
    discarded = [e for e in examples if e.source == "discarded"]

    lines.append("Reglas — precision sobre matches (que tan bien acepta):")
    lines.append("  " + proportion_line("global", sum(e.label for e in matches), len(matches)))
    for tier in ("Alta", "Media", "Baja"):
        sub = [e for e in matches if e.rule_confidence == tier]
        if sub:
            lines.append("  " + proportion_line(f"confianza {tier}", sum(e.label for e in sub), len(sub)))
    lines.append("")
    lines.append("Reglas — falsos negativos sobre descartes automaticos (que tanto pierde):")
    if discarded:
        lines.append("  " + proportion_line("descartes que eran accionables",
                                             sum(e.label for e in discarded), len(discarded)))
    else:
        lines.append("  SIN DATOS: ningun descarte automatico etiquetado — el recall es "
                     "desconocido. Etiqueta descartes en /revision.")
    lines.append("")
    scored = [(e.ml_confidence, e.label) for e in examples if e.ml_confidence is not None]
    a = auc(scored)
    lines.append("Capa semantica — AUC de ml_confidence (0,5 = azar):")
    if a is None:
        lines.append(f"  no calculable (n={len(scored)}; faltan ejemplos de una de las clases)")
    else:
        flag = "" if len(scored) >= MIN_N else "  [no concluyente: n < %d]" % MIN_N
        lines.append(f"  AUC = {a:.2f}  (n={len(scored)}){flag}")
    lines.append("")
    by_sub: dict[str, list[dataset.Example]] = {}
    for e in examples:
        by_sub.setdefault(e.subreddit, []).append(e)
    lines.append("Por subreddit (accionables / etiquetados):")
    for sub, exs in sorted(by_sub.items(), key=lambda kv: -len(kv[1])):
        lines.append(f"  r/{sub}: {sum(e.label for e in exs)}/{len(exs)}")
    return lines


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("workdir", type=Path)
    parser.add_argument("--solo-explicitas", action="store_true",
                        help="ignora las etiquetas implicitas (mas ruidosas)")
    args = parser.parse_args()
    conn = dataset.open_readonly(args.workdir / "reddit_monitor.db")
    try:
        examples = dataset.load_examples(conn)
    finally:
        conn.close()
    if args.solo_explicitas:
        examples = [e for e in examples if e.explicit]
    print("\n".join(evaluate(examples)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
