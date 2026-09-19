#!/usr/bin/env python3
"""
Limpieza unica/reutilizable: borra de la DB los matches escritos por las
cuentas propias (`own_authors` en config.json), con sus etiquetas, acciones y
keywords. Sirve para los que entraron antes de existir el descarte temprano de
monitor.py, o si se agrega otra cuenta propia mas tarde.

Por que borrar y no marcar como descartado: una etiqueta humana sobre un
comentario propio contamina el entrenamiento del filtro (Etapa 2), y un match
sin etiqueta reaparece en la muestra de /revision. `discarded` no guarda
autor, asi que esa tabla no se toca.

Por defecto es un dry-run: solo cuenta. Con --apply borra (haz backup antes:
`bash backup_db.sh`).

Uso: python3 purge_own_authors.py <directorio_de_trabajo> [--apply]
"""
import argparse
import sys
from pathlib import Path

import db as dbmod
import monitor


def find_own_matches(conn, own: set[str]) -> list[int]:
    ids = []
    for r in conn.execute("SELECT id, author FROM matches WHERE author IS NOT NULL"):
        if monitor.normalize_author(r["author"]) in own:
            ids.append(r["id"])
    return ids


def count_children(conn, ids: list[int]) -> dict[str, int]:
    marks = ",".join("?" * len(ids))
    return {
        table: conn.execute(f"SELECT COUNT(*) FROM {table} WHERE match_id IN ({marks})", ids).fetchone()[0]
        for table in ("human_reviews", "actions", "match_keywords")
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("workdir", type=Path)
    parser.add_argument("--apply", action="store_true", help="borra de verdad (sin esto solo cuenta)")
    args = parser.parse_args()

    cfg = monitor.load_config(args.workdir)
    own = monitor.own_author_set(cfg)
    if not own:
        print("own_authors esta vacio en config.json: nada que limpiar.", file=sys.stderr)
        return 1

    conn = dbmod.connect(args.workdir / "reddit_monitor.db")
    try:
        ids = find_own_matches(conn, own)
        if not ids:
            print(f"Sin matches de {sorted(own)}: nada que borrar.")
            return 0
        children = count_children(conn, ids)
        resumen = ", ".join(f"{n} {t}" for t, n in children.items())
        if not args.apply:
            print(f"[dry-run] {len(ids)} matches de {sorted(own)} (+ {resumen}). Usa --apply para borrar.")
            return 0
        marks = ",".join("?" * len(ids))
        with conn:
            # human_reviews/actions/match_keywords caen por ON DELETE CASCADE
            # (db.connect activa foreign_keys), pero se borran explicitos por
            # si alguien abre la DB sin ese PRAGMA.
            for table in ("human_reviews", "actions", "match_keywords"):
                conn.execute(f"DELETE FROM {table} WHERE match_id IN ({marks})", ids)
            conn.execute(f"DELETE FROM matches WHERE id IN ({marks})", ids)
        print(f"Borrados {len(ids)} matches de {sorted(own)} (+ {resumen}).")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
