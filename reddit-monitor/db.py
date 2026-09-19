"""
Capa de acceso a datos para reddit-monitor. Sin dependencias externas
(sqlite3 es stdlib) — mantiene la filosofía del proyecto original.

Centraliza la configuración de SQLite (WAL + busy_timeout) en un solo
lugar: todo proceso que abra la DB (monitor.py, la web app, scripts de
mantenimiento) pasa por aquí, así no hay riesgo de que alguno se olvide
y produzca "database is locked" cuando el timer y la web app coinciden.
"""
import sqlite3
from pathlib import Path

SCHEMA_PATH = Path(__file__).parent / "schema.sql"

# RM-016: disciplina de version de esquema. v2 = Fase 0.6 (columnas ML en
# matches/discarded), v3 = etiquetas humanas (reason/on_topic/source en
# human_reviews). Sube aqui cada vez que schema.sql agregue columnas; el
# ULTIMO script de migracion deja schema_meta en este valor.
EXPECTED_SCHEMA_VERSION = "3"


def get_schema_version(conn: sqlite3.Connection) -> str | None:
    """Version declarada en schema_meta, o None si la DB no trae esa tabla
    (DBs legacy construidas a mano / pre-schema_meta: no hay nada que
    exigirles, se toleran)."""
    has_meta = conn.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'schema_meta'"
    ).fetchone()
    if not has_meta:
        return None
    row = conn.execute(
        "SELECT value FROM schema_meta WHERE key = 'schema_version'"
    ).fetchone()
    return row["value"] if row else None


def assert_schema_version(conn: sqlite3.Connection, db_path: Path) -> None:
    """Fail-fast: si la DB declara una version distinta a la esperada, no se
    sigue (los INSERTs fallarian igual, pero con un OperationalError
    críptico). El mensaje dice que correr."""
    version = get_schema_version(conn)
    if version is None or version == EXPECTED_SCHEMA_VERSION:
        return
    raise RuntimeError(
        f"{db_path}: schema_version={version!r} != esperada {EXPECTED_SCHEMA_VERSION!r} — "
        "corre las migraciones primero: python3 migrate_fase06_schema.py <dir> && python3 migrate_v3_reviews.py <dir>"
    )


def connect(db_path: Path, check_version: bool = True) -> sqlite3.Connection:
    """Abre (o crea) la base de datos con la configuración correcta de
    concurrencia. Aplica el esquema si es la primera vez (CREATE TABLE
    IF NOT EXISTS, así que es seguro llamarlo siempre) y exige la version
    de esquema esperada (fail-fast RM-016). Los scripts de migracion usan
    check_version=False porque su trabajo es justamente subir una DB vieja."""
    conn = sqlite3.connect(str(db_path), timeout=5.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA busy_timeout = 5000")
    conn.execute("PRAGMA foreign_keys = ON")
    if SCHEMA_PATH.exists():
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    if check_version:
        try:
            assert_schema_version(conn, db_path)
        except Exception:
            conn.close()
            raise
    return conn


def compute_priority_score(created_utc: float, now_ts: float, score: int | None,
                            num_comments: int | None, subreddit_subscribers: int | None) -> float:
    """Score de priorización de la cola (propuesta del growth hacker):
    prioridad = (1 / edad_horas) x (1 / (comentarios+1)) x peso_subreddit

    - Más reciente = más prioridad (una respuesta a los 20 min captura más
      tráfico que una a las 6 horas).
    - Menos comentarios existentes = terreno más virgen (tu respuesta puede
      ser la "top answer"; con muchos comentarios ya hay consenso).
    - Subreddit más grande = más ojos verán tu respuesta.

    Todos los inputs pueden faltar (comentarios no siempre traen
    num_comments, por ejemplo) — se degradan a valores neutros en vez de
    reventar, para que un dato faltante no tire el match al fondo de la
    cola silenciosamente.
    """
    age_hours = max((now_ts - created_utc) / 3600.0, 1 / 60)  # piso de 1 minuto
    comments = num_comments if num_comments is not None else 0
    subscribers = subreddit_subscribers if subreddit_subscribers else 10_000  # neutro si falta

    recency_factor = 1.0 / age_hours
    virgin_factor = 1.0 / (comments + 1)
    # log10 del tamaño del subreddit, normalizado — evita que un subreddit
    # gigante (r/chile) aplaste por completo a uno chico pero de intención
    # más alta (r/BolsaChile), solo le da una ventaja moderada.
    import math
    size_factor = max(math.log10(max(subscribers, 10)), 1.0)

    return round(recency_factor * virgin_factor * size_factor, 6)
