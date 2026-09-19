#!/usr/bin/env python3
"""
Herramienta de revisión para llenar human_reviews (Fase 0.6/2).

Estrategia de muestreo — active learning, no al azar ni "de vez en
cuando": prioriza los casos donde el heurístico de reglas y la capa
semántica ESTÁN EN DESACUERDO. Son los más informativos: donde ambos
concuerdan, etiquetarlos no enseña nada que el sistema no supiera ya.

  - De 'matches' (la regla los ACEPTÓ): desacuerdo = ml_confidence baja
    (<0.4) → posible falso positivo de las reglas.
  - De 'discarded' (la regla los DESCARTÓ): desacuerdo = ml_confidence
    alta (>0.6) → posible falso negativo de las reglas (justo lo que el
    Playbook pedía auditar "de vez en cuando" en descartados.jsonl, ahora
    de forma sistemática).

Además incluye una pequeña muestra de calibración (casos donde SÍ están
de acuerdo) para poder medir la precisión real del heurístico, no solo
cazar sus errores.

Pensado para sesiones cortas (por defecto 12 ítems — unos 5-8 minutos):
uso interactivo, r=relevante, n=ruido, s=saltar, q=terminar.

Uso: python3 review_sampling.py <directorio_de_trabajo> [--limit N]
"""
import argparse
import random
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import db as dbmod
import reviews

CHILE_TZ = timezone(timedelta(hours=-3))

DISAGREEMENT_MATCHES_SQL = """
SELECT m.id, m.permalink, m.subreddit, m.snippet, m.confidence, m.ml_confidence,
       'match' AS source
FROM matches m
LEFT JOIN human_reviews hr ON hr.match_id = m.id
WHERE hr.id IS NULL
  AND m.ml_confidence IS NOT NULL
  AND m.ml_confidence < 0.4
ORDER BY m.ml_confidence ASC
LIMIT ?
"""

DISAGREEMENT_DISCARDED_SQL = """
SELECT d.id, d.permalink, d.subreddit, d.snippet, d.confidence, d.ml_confidence,
       'discarded' AS source
FROM discarded d
LEFT JOIN human_reviews hr ON hr.discarded_id = d.id
WHERE hr.id IS NULL
  AND d.ml_confidence IS NOT NULL
  AND d.ml_confidence > 0.6
ORDER BY d.ml_confidence DESC
LIMIT ?
"""

CALIBRATION_SQL = """
SELECT m.id, m.permalink, m.subreddit, m.snippet, m.confidence, m.ml_confidence,
       'match' AS source
FROM matches m
LEFT JOIN human_reviews hr ON hr.match_id = m.id
WHERE hr.id IS NULL AND m.ml_confidence IS NOT NULL AND m.ml_confidence >= 0.4
ORDER BY RANDOM()
LIMIT ?
"""

# RM-019: misma poblacion que CALIBRATION_SQL pero en orden estable, para
# poder muestrear de forma determinista con seed (SQLite RANDOM() no se
# puede sembrar).
CALIBRATION_CANDIDATES_SQL = """
SELECT m.id, m.permalink, m.subreddit, m.snippet, m.confidence, m.ml_confidence,
       'match' AS source
FROM matches m
LEFT JOIN human_reviews hr ON hr.match_id = m.id
WHERE hr.id IS NULL AND m.ml_confidence IS NOT NULL AND m.ml_confidence >= 0.4
ORDER BY m.id
"""


def build_queue(conn, limit: int, seed: int | None = None) -> list[dict]:
    n_disagree_each = max(1, int(limit * 0.4))
    n_calibration = max(1, limit - 2 * n_disagree_each)

    rows = []
    rows += [dict(r) for r in conn.execute(DISAGREEMENT_MATCHES_SQL, (n_disagree_each,))]
    rows += [dict(r) for r in conn.execute(DISAGREEMENT_DISCARDED_SQL, (n_disagree_each,))]
    if seed is None:
        rows += [dict(r) for r in conn.execute(CALIBRATION_SQL, (n_calibration,))]
    else:
        rng = random.Random(seed)
        candidates = [dict(r) for r in conn.execute(CALIBRATION_CANDIDATES_SQL)]
        rng.shuffle(candidates)
        rows += candidates[:n_calibration]
    return rows[:limit]


def save_review(conn, row: dict, label: str) -> None:
    """r/n del CLI -> motivos 'accionable'/'ruido' (ver reviews.MOTIVOS)."""
    motivo = "accionable" if label == "relevante" else "ruido"
    kwargs = {"match_id": row["id"]} if row["source"] == "match" else {"discarded_id": row["id"]}
    reviews.record_review(conn, motivo, **kwargs)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("workdir", type=Path)
    parser.add_argument("--limit", type=int, default=12)
    # RM-019: seed opcional para una cola de calibracion reproducible
    # (auditorias repetibles); sin seed el muestreo sigue aleatorio.
    parser.add_argument("--seed", type=int, default=None)
    args = parser.parse_args()

    conn = dbmod.connect(args.workdir / "reddit_monitor.db")
    try:
        queue = build_queue(conn, args.limit, seed=args.seed)

        if not queue:
            print("No hay nada pendiente de revisar por ahora (o ya revisaste todo lo disponible).")
            return 0

        print(f"Sesión de revisión: {len(queue)} ítems. r=relevante, n=ruido, s=saltar, q=terminar.\n")
        n_done = 0
        for row in queue:
            rule_says = "MANTENIDO por reglas" if row["source"] == "match" else "DESCARTADO por reglas"
            ml_conf = row["ml_confidence"]
            print("─" * 70)
            print(f"[{rule_says}, confianza regla={row['confidence']}, ml_confidence={ml_conf:.2f}]")
            print(f"r/{row['subreddit']}  https://reddit.com{row['permalink']}")
            print(f"  {row['snippet'][:200]}")
            ans = input("¿Relevante, ruido, saltar o salir? [r/n/s/q] ").strip().lower()
            if ans == "q":
                break
            if ans not in ("r", "n"):
                continue
            label = "relevante" if ans == "r" else "ruido"
            save_review(conn, row, label)
            n_done += 1

        print(f"\nListo — {n_done} revisiones guardadas en human_reviews.")
        return 0
    finally:
        # RM-019: la conexion se cierra siempre (antes se perdia en el
        # return temprano de cola vacia y ante Ctrl-C/excepciones).
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
