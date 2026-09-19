#!/usr/bin/env python3
"""
Migracion de esquema para la Fase 0.6: agrega las columnas nuevas
(keyword_match_methods, ml_semantic_margin, ml_confidence, ml_model_version)
a una reddit_monitor.db que ya existe de la Fase 0 (creada con
CREATE TABLE IF NOT EXISTS, que no agrega columnas a tablas existentes).

Idempotente: si la columna ya existe, no hace nada (chequea PRAGMA
table_info antes de cada ALTER TABLE).

Uso: python3 migrate_fase06_schema.py <directorio_de_trabajo>
"""
import sys
from pathlib import Path

import db as dbmod

# Cada migracion sella SU version, no la esperada por el codigo actual: si
# sellara EXPECTED_SCHEMA_VERSION, correrla sola marcaria la DB como v3 sin
# haber agregado las columnas v3.
PHASE06_SCHEMA_VERSION = "2"

NEW_COLUMNS = {
    "matches": [
        ("keyword_match_methods", "TEXT"),
        ("ml_semantic_margin", "REAL"),
        ("ml_confidence", "REAL"),
        ("ml_model_version", "TEXT"),
    ],
    "discarded": [
        ("keyword_match_methods", "TEXT"),
        ("ml_semantic_margin", "REAL"),
        ("ml_confidence", "REAL"),
        ("ml_model_version", "TEXT"),
    ],
}


def existing_columns(conn, table: str) -> set[str]:
    return {r["name"] for r in conn.execute(f"PRAGMA table_info({table})")}


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: migrate_fase06_schema.py <directorio_de_trabajo>", file=sys.stderr)
        return 2
    workdir = Path(sys.argv[1])
    db_path = workdir / "reddit_monitor.db"
    if not db_path.exists():
        print(f"No existe {db_path} — corre migrate_history.py primero (Fase 0).", file=sys.stderr)
        return 1

    # check_version=False: esta DB puede estar en v1 — migrarla es el
    # trabajo de este script, no un error (RM-016).
    conn = dbmod.connect(db_path, check_version=False)
    try:
        added = []
        for table, columns in NEW_COLUMNS.items():
            existing = existing_columns(conn, table)
            for col_name, col_type in columns:
                if col_name not in existing:
                    conn.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}")
                    added.append(f"{table}.{col_name}")
        # Disciplina de version (RM-016): dejar schema_meta en el valor que
        # db.connect() exige, aunque las columnas ya existieran.
        conn.execute(
            "INSERT INTO schema_meta (key, value) VALUES ('schema_version', ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (PHASE06_SCHEMA_VERSION,),
        )
        conn.commit()
        if added:
            print(f"Columnas agregadas: {', '.join(added)} "
                  f"(schema_version -> {PHASE06_SCHEMA_VERSION})")
        else:
            print(f"Esquema ya estaba al dia (Fase 0.6) — nada que hacer "
                  f"(schema_version -> {PHASE06_SCHEMA_VERSION}).")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
