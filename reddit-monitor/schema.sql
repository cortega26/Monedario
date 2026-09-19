-- reddit-monitor — esquema SQLite (Fase 0)
--
-- Diseñado para responder, sin rediseñar nada después:
--   - ¿Qué keyword genera ruido vs señal? (match_keywords + human_reviews)
--   - ¿"Confianza Alta" realmente convierte más que "Media"? (matches + actions)
--   - ¿Qué hilo priorizar primero, más allá de Alta/Media/Baja? (priority_score,
--     calculado con datos que la API de Reddit ya entrega gratis: edad,
--     score, num_comments, tamaño del subreddit)
--   - ¿El heurístico mejoró al ajustar config.json? (filter_version en matches,
--     nunca se sobreescribe un match viejo con la versión nueva del filtro)
--
-- Convención: todos los timestamps se guardan como TEXT ISO-8601 (igual que
-- runs.log hoy) salvo created_utc, que se guarda como REAL (epoch UTC, tal
-- cual lo entrega la API de Reddit) porque así se calculan edades sin
-- reparsear fechas.

PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;

-- Una fila por corrida de monitor.py (reemplaza runs.log como fuente
-- primaria; runs.log se sigue escribiendo en paralelo por ahora, es gratis
-- y sirve de respaldo legible sin abrir la DB).
CREATE TABLE IF NOT EXISTS scan_runs (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at          TEXT NOT NULL,          -- ISO-8601, hora Chile
    -- RM-008: 'degraded' = Markdown/JSONL escritos pero fallo la escritura a
    -- SQLite (divergencia marcada, nunca silenciosa). DBs creadas con un
    -- schema anterior rechazan el valor por CHECK: write_degraded_run cae a
    -- 'error' con prefijo en ese caso (ver monitor.py).
    status              TEXT NOT NULL CHECK (status IN ('ok', 'error', 'degraded')),
    lookback_seconds    INTEGER NOT NULL,
    gap_extended_hours  REAL,                    -- NULL si fue la ventana normal
    n_new               INTEGER NOT NULL DEFAULT 0,
    n_discarded         INTEGER NOT NULL DEFAULT 0,
    error_detail        TEXT,
    filter_version      TEXT NOT NULL
);

-- Cuánto se escaneó por subreddit en cada corrida (reemplaza scan_stats.jsonl).
CREATE TABLE IF NOT EXISTS scan_stats (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    -- nullable: la importacion del historico (migrate_history.py) no
    -- siempre puede emparejar una fila de scan_stats.jsonl con su
    -- scan_run exacto (los timestamps se generaban con llamadas
    -- datetime.now() separadas en el codigo viejo, no son identicos al
    -- milisegundo). Las corridas nuevas de monitor.py SIEMPRE insertan
    -- con run_id real, dentro de la misma transaccion.
    run_id              INTEGER REFERENCES scan_runs(id) ON DELETE CASCADE,
    subreddit           TEXT NOT NULL,
    posts_scanned       INTEGER NOT NULL DEFAULT 0,
    comments_scanned    INTEGER NOT NULL DEFAULT 0,
    posts_en_ventana    INTEGER NOT NULL DEFAULT 0,
    comments_en_ventana INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_scan_stats_run ON scan_stats(run_id);

-- Cada coincidencia que SÍ pasó el filtro de intención (lo que hoy es una
-- entrada del digest). Un match_id estable es el permalink de Reddit — ya
-- es único globalmente, no hace falta inventar otro id.
CREATE TABLE IF NOT EXISTS matches (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id                  INTEGER REFERENCES scan_runs(id) ON DELETE SET NULL,
    permalink               TEXT NOT NULL UNIQUE,
    type                    TEXT NOT NULL CHECK (type IN ('post', 'comment')),
    subreddit               TEXT NOT NULL,
    created_utc             REAL NOT NULL,        -- epoch UTC del post/comentario
    detected_at             TEXT NOT NULL,         -- ISO-8601, cuándo lo detectó el script
    title                   TEXT,                  -- solo posts
    snippet                 TEXT NOT NULL,
    -- señales de engagement, capturadas gratis desde la misma respuesta de la API
    score                   INTEGER,               -- upvotes netos
    num_comments            INTEGER,               -- solo posts
    subreddit_subscribers   INTEGER,
    author                  TEXT,
    -- resultado del heurístico
    confidence              TEXT NOT NULL CHECK (confidence IN ('Alta', 'Media', 'Baja')),
    intent_score            INTEGER NOT NULL,
    intent_signals          TEXT,                  -- JSON array de strings
    filter_version          TEXT NOT NULL,          -- para poder comparar antes/después de ajustar config.json
    -- [Fase 0.6, schema v2] trazabilidad del matching expandido + capa
    -- semantica en observacion. Van en el CREATE (no solo en la migracion)
    -- para que una DB fresca nunca nazca sin estas columnas (RM-016).
    keyword_match_methods   TEXT,                  -- JSON {keyword: regex|lemma|stem|related_term}
    ml_semantic_margin      REAL,
    ml_confidence           REAL,
    ml_model_version        TEXT,
    -- score de priorización para ordenar la cola (recalculable, no es el dato crudo)
    priority_score          REAL,
    -- estado de triage (reemplaza mover líneas entre "Pendiente"/"Atendido" a mano)
    status                  TEXT NOT NULL DEFAULT 'pendiente'
                            CHECK (status IN ('pendiente', 'atendido', 'descartado')),
    status_note             TEXT,
    status_changed_at       TEXT
);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_subreddit ON matches(subreddit);
CREATE INDEX IF NOT EXISTS idx_matches_created ON matches(created_utc);

-- Todas las keywords que matchearon cada entrada (no solo la primera, a
-- diferencia del digest en Markdown) — es lo que permite calcular tasa de
-- ruido por keyword individual más adelante.
CREATE TABLE IF NOT EXISTS match_keywords (
    match_id    INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    keyword     TEXT NOT NULL,
    PRIMARY KEY (match_id, keyword)
);

-- Matches por keyword que el filtro de intención descartó (reemplaza
-- descartados.jsonl). Se guardan igual, sin mostrarse en la cola de
-- pendientes, para poder auditar falsos negativos.
CREATE TABLE IF NOT EXISTS discarded (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id              INTEGER REFERENCES scan_runs(id) ON DELETE SET NULL,
    permalink           TEXT,
    type                TEXT NOT NULL CHECK (type IN ('post', 'comment')),
    subreddit           TEXT NOT NULL,
    created_utc         REAL,
    detected_at         TEXT NOT NULL,
    keyword             TEXT,
    confidence          TEXT,
    reason              TEXT,      -- 'ambiguedad de sentido' | señales insuficientes
    snippet             TEXT,
    filter_version      TEXT NOT NULL,
    -- [Fase 0.6, schema v2] mismas columnas que en matches (ver arriba).
    keyword_match_methods   TEXT,
    ml_semantic_margin      REAL,
    ml_confidence           REAL,
    ml_model_version        TEXT
);
CREATE INDEX IF NOT EXISTS idx_discarded_keyword ON discarded(keyword);

-- Ground truth para medir precisión/recall real del heurístico. Se llena
-- con una política de muestreo sistemática (Fase 2), no "de vez en cuando".
CREATE TABLE IF NOT EXISTS human_reviews (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id      INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    discarded_id  INTEGER REFERENCES discarded(id) ON DELETE CASCADE,
    reviewer      TEXT NOT NULL DEFAULT 'carlos',
    label         TEXT NOT NULL CHECK (label IN ('relevante', 'ruido')),
    reviewed_at   TEXT NOT NULL,
    notes         TEXT,
    -- [schema v3, Etapa 1 del ciclo de feedback] ver reviews.py. Sin CHECK
    -- ni indices sobre estas columnas a proposito: schema.sql se ejecuta en
    -- cada connect() ANTES de migrar, y un indice sobre una columna que la
    -- DB vieja aun no tiene la rompería. La validacion vive en reviews.py.
    reason        TEXT,                              -- motivo (reviews.MOTIVOS)
    on_topic      INTEGER,                           -- 1 = trata de finanzas, 0 = no, NULL = desconocido
    source        TEXT NOT NULL DEFAULT 'explicita', -- 'explicita' | 'implicita'
    CHECK ((match_id IS NOT NULL) <> (discarded_id IS NOT NULL))  -- una u otra, no ambas ni ninguna
);

-- Lo que Carlos efectivamente hizo con un match: si respondió, con qué link,
-- y si generó oportunidad de wiki. Es la base de la atribución real
-- (loop: match -> respuesta -> UTM -> tráfico en Analytics).
CREATE TABLE IF NOT EXISTS actions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id            INTEGER NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    responded_at        TEXT,
    response_has_link   INTEGER NOT NULL DEFAULT 0,   -- 0/1: la respuesta incluyó link a Monedario
    utm_url              TEXT,                          -- generado con utm_link.py, con utm_content = id del hilo
    wiki_opportunity    INTEGER NOT NULL DEFAULT 0,   -- 0/1: subreddit con wiki de recursos vacía/sin Monedario
    wiki_done           INTEGER NOT NULL DEFAULT 0,   -- 0/1: ya se contactó a moderadores
    notes               TEXT
);

-- Brechas de contenido: keyword que se repite sin cobertura, y si ya se
-- convirtió en artículo/calculadora. Alimenta el backlog de contenido en
-- vez de solo listarse en el reporte semanal.
CREATE TABLE IF NOT EXISTS content_gaps (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword             TEXT NOT NULL UNIQUE,
    first_seen_at       TEXT NOT NULL,
    times_seen          INTEGER NOT NULL DEFAULT 1,
    last_seen_at        TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'detectado'
                         CHECK (status IN ('detectado', 'en_backlog', 'publicado', 'descartado')),
    content_url         TEXT,    -- una vez publicado, el artículo/calculadora que lo cubre
    notes                TEXT
);

-- Seguimiento de wikis de recursos por subreddit (pagina /wikis de la UI).
-- Faltaba en el esquema: la app la consultaba pero ninguna DB la tenia, asi
-- que /wikis respondia 500. CREATE IF NOT EXISTS: se crea sola en el proximo
-- connect(), sin migracion ni cambio de version.
CREATE TABLE IF NOT EXISTS subreddit_wiki_status (
    subreddit       TEXT PRIMARY KEY,
    checked         INTEGER NOT NULL DEFAULT 0,
    has_monedario   INTEGER NOT NULL DEFAULT 0,
    notes           TEXT,
    updated_at      TEXT
);

-- version simple de esquema, para poder saber si una VM/copia quedó atrasada
-- [RM-016] v2 = Fase 0.6 (columnas ML en matches/discarded); v3 = columnas
-- reason/on_topic/source en human_reviews. db.connect() falla rapido si la
-- DB dice otra version: hay que correr migrate_fase06_schema.py y luego
-- migrate_v3_reviews.py.
CREATE TABLE IF NOT EXISTS schema_meta (
    key     TEXT PRIMARY KEY,
    value   TEXT NOT NULL
);
INSERT OR IGNORE INTO schema_meta (key, value) VALUES ('schema_version', '3');
