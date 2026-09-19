#!/usr/bin/env python3
"""
Migracion a schema v3 (Etapa 1 del ciclo de feedback): agrega reason,
on_topic y source a human_reviews e importa como etiquetas IMPLICITAS las
decisiones que Carlos ya tomo en la UI antes de que existieran los motivos:

  - matches 'atendido'   -> label relevante, on_topic=1, reason='accionable'
  - matches 'descartado' -> label ruido, on_topic=NULL, reason='descarte_previo'
    (no sabemos si era "no es finanzas" o "es del tema pero sin accion";
    /revision permite asignarles el motivo real despues)

Idempotente: chequea PRAGMA table_info antes de cada ALTER y solo importa
matches que aun no tienen ninguna fila en human_reviews.

Requiere que migrate_fase06_schema.py ya se haya corrido (schema v2).

Uso: python3 migrate_v3_reviews.py <directorio_de_trabajo>
"""
import sys
from pathlib import Path

import db as dbmod

SCHEMA_VERSION = "3"
NEW_COLUMNS = [
    ("reason", "TEXT"),
    ("on_topic", "INTEGER"),
    ("source", "TEXT NOT NULL DEFAULT 'explicita'"),
]

IMPORT_SQL = """
INSERT INTO human_reviews (match_id, reviewer, label, reviewed_at, reason, on_topic, source)
SELECT m.id, 'carlos',
       CASE m.status WHEN 'atendido' THEN 'relevante' ELSE 'ruido' END,
       COALESCE(m.status_changed_at, m.detected_at),
       CASE m.status WHEN 'atendido' THEN 'accionable' ELSE ? END,
       CASE m.status WHEN 'atendido' THEN 1 ELSE NULL END,
       'implicita'
FROM matches m
WHERE m.status IN ('atendido', 'descartado')
  AND NOT EXISTS (SELECT 1 FROM human_reviews hr WHERE hr.match_id = m.id)
"""


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: migrate_v3_reviews.py <directorio_de_trabajo>", file=sys.stderr)
        return 2
    db_path = Path(sys.argv[1]) / "reddit_monitor.db"
    if not db_path.exists():
        print(f"No existe {db_path}.", file=sys.stderr)
        return 1

    conn = dbmod.connect(db_path, check_version=False)
    try:
        version = dbmod.get_schema_version(conn)
        # schema.sql ya intento sellar '3' en una DB nueva; una DB vieja
        # conserva su version. Exigimos >= 2 (columnas ML presentes).
        if version is not None and version not in ("2", SCHEMA_VERSION):
            print(f"schema_version={version!r}: corre migrate_fase06_schema.py primero.",
                  file=sys.stderr)
            return 1
        existing = {r["name"] for r in conn.execute("PRAGMA table_info(human_reviews)")}
        added = []
        with conn:
            for name, ddl in NEW_COLUMNS:
                if name not in existing:
                    conn.execute(f"ALTER TABLE human_reviews ADD COLUMN {name} {ddl}")
                    added.append(name)
            imported = conn.execute(IMPORT_SQL, ("descarte_previo",)).rowcount
            conn.execute(
                "INSERT INTO schema_meta (key, value) VALUES ('schema_version', ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (SCHEMA_VERSION,),
            )
        print(f"Columnas agregadas: {', '.join(added) or 'ninguna (ya estaban)'}; "
              f"etiquetas implicitas importadas: {imported} (schema_version -> {SCHEMA_VERSION}).")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
