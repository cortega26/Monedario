"""Tests de la Fase 0.6: matching expandido (lema/stem/variantes) y capa
semantica en modo observacion, incluida la degradacion segura cuando las
librerias de ML no estan disponibles."""
import json
import sqlite3
import sys
import time
from pathlib import Path

import pytest

import lexicon
import monitor
import db as dbmod


# --- lexicon.py: matching expandido ----------------------------------

def test_lemma_catches_conjugated_verb_regex_misses():
    text = "estoy invirtiendo en fondos mutuos"
    found, method = lexicon.expanded_keyword_matches(text, ["invertir"])
    assert "invertir" in found
    assert method["invertir"] == "lemma"


def test_regex_still_wins_when_exact_match_present():
    """Si el regex exacto ya encuentra la keyword, no debe reportarse como
    encontrada por otro metodo (regex tiene prioridad en el reporte)."""
    text = "quiero invertir en algo seguro"
    found, method = lexicon.expanded_keyword_matches(text, ["invertir"])
    assert method["invertir"] == "regex"


def test_stem_catches_derivation_lemma_misses():
    text = "ando ahorrando para la pega"
    found, method = lexicon.expanded_keyword_matches(text, ["ahorro"])
    assert "ahorro" in found
    assert method["ahorro"] == "stem"


def test_related_terms_catch_prefixed_derivation():
    text = "estoy muy endeudado este mes"
    related = {"deuda": ["endeudado", "endeudarse"]}
    found, method = lexicon.expanded_keyword_matches(text, ["deuda"], related_terms=related)
    assert "deuda" in found
    assert method["deuda"] == "related_term"


def test_multiword_keywords_only_use_regex():
    """'tarjeta de credito' no debe intentar lematizarse palabra por
    palabra (lemma_matches/stem_matches las ignoran explicitamente)."""
    text = "pague con la tarjeta de credito"
    found, method = lexicon.expanded_keyword_matches(text, ["tarjeta de credito"])
    assert found == {"tarjeta de credito"}
    assert method["tarjeta de credito"] == "regex"


def test_no_false_match_on_unrelated_text():
    text = "el clima estuvo lindo hoy en Santiago"
    found, _ = lexicon.expanded_keyword_matches(text, ["invertir", "ahorro", "deuda"])
    assert found == set()


# --- monitor.py: integracion con degradacion segura --------------------

def test_find_keywords_expanded_degrades_to_regex_on_failure(monkeypatch):
    """Si lexicon.expanded_keyword_matches revienta (ej. spaCy no
    instalado en el entorno), la corrida no debe caerse — se degrada a
    devolver solo lo que el regex exacto encuentra."""
    def boom(*a, **kw):
        raise RuntimeError("spaCy no disponible")
    monkeypatch.setattr(lexicon, "expanded_keyword_matches", boom)
    cfg = monitor.load_config.__wrapped__ if hasattr(monitor.load_config, "__wrapped__") else None
    found, method = monitor.find_keywords_expanded(
        "quiero invertir en algo seguro", {"keywords": ["invertir"], "related_terms": {}}
    )
    assert found == ["invertir"]
    assert method == {"invertir": "regex"}


def test_score_semantic_disabled_returns_none():
    margin, conf, ver = monitor.score_semantic("cualquier texto", {"ml_enabled": False})
    assert (margin, conf, ver) == (None, None, None)


def test_score_semantic_degrades_on_exception(monkeypatch):
    monkeypatch.setattr(monitor, "_SEMANTIC_AVAILABLE", True)

    class FakeSemantic:
        MODEL_VERSION = "fake"

        @staticmethod
        def compute_margin(*a, **kw):
            raise RuntimeError("modelo no cargo")

    monkeypatch.setattr(monitor, "semanticmod", FakeSemantic)
    margin, conf, ver = monitor.score_semantic("texto", {"ml_enabled": True})
    assert (margin, conf, ver) == (None, None, None)


# --- write_to_db: persistencia de los campos nuevos --------------------

@pytest.fixture
def workdir(tmp_path):
    (tmp_path / "schema.sql").write_text(
        (Path(__file__).parent / "schema.sql").read_text(encoding="utf-8"), encoding="utf-8"
    )
    return tmp_path


def test_write_to_db_persists_ml_fields_and_match_methods(workdir):
    now = time.time()
    items = [{
        "type": "post", "subreddit": "FinanzasChile", "permalink": "/r/x/comments/1/a/",
        "created_utc": now - 300, "keyword": "ahorro", "keywords": ["ahorro"],
        "keyword_match_methods": {"ahorro": "stem"},
        "title": "t", "confidence": "Alta", "intent_score": 2, "signals": [],
        "snippet": "s", "score": 5, "num_comments": 1, "subreddit_subscribers": 1000, "author": "u",
        "ml_semantic_margin": 0.12, "ml_confidence": 0.77, "ml_model_version": "embed:test:v1",
    }]
    monitor.write_to_db(
        workdir, started_at_iso="x", status="ok", lookback_seconds=4500,
        gap_extended_hours=None, new_items=items, all_discarded=[], all_stats=[],
        error_detail=None, now_ts=now,
    )
    conn = dbmod.connect(workdir / "reddit_monitor.db")
    row = conn.execute("SELECT * FROM matches").fetchone()
    assert row["ml_semantic_margin"] == pytest.approx(0.12)
    assert row["ml_confidence"] == pytest.approx(0.77)
    assert row["ml_model_version"] == "embed:test:v1"
    assert json.loads(row["keyword_match_methods"]) == {"ahorro": "stem"}


def test_write_to_db_handles_missing_ml_fields_gracefully(workdir):
    """Si score_semantic devolvio (None, None, None) porque ML estaba
    deshabilitado, la fila igual debe insertarse sin reventar."""
    now = time.time()
    items = [{
        "type": "comment", "subreddit": "chile", "permalink": "/r/x/comments/2/b/",
        "created_utc": now, "keyword": "deuda", "keywords": ["deuda"],
        "keyword_match_methods": {"deuda": "regex"},
        "title": None, "confidence": "Baja", "intent_score": 0, "signals": [],
        "snippet": "s", "score": None, "num_comments": None, "subreddit_subscribers": None, "author": None,
        "ml_semantic_margin": None, "ml_confidence": None, "ml_model_version": None,
    }]
    monitor.write_to_db(
        workdir, started_at_iso="x", status="ok", lookback_seconds=4500,
        gap_extended_hours=None, new_items=items, all_discarded=[], all_stats=[],
        error_detail=None, now_ts=now,
    )
    conn = dbmod.connect(workdir / "reddit_monitor.db")
    row = conn.execute("SELECT * FROM matches").fetchone()
    assert row["ml_semantic_margin"] is None


def test_schema_has_ml_columns():
    conn = dbmod.connect(Path("/tmp") / f"schema_check_{time.time_ns()}.db")
    cols_matches = {r["name"] for r in conn.execute("PRAGMA table_info(matches)")}
    cols_discarded = {r["name"] for r in conn.execute("PRAGMA table_info(discarded)")}
    for col in ("ml_semantic_margin", "ml_confidence", "ml_model_version", "keyword_match_methods"):
        assert col in cols_matches
        assert col in cols_discarded


# --- RM-008: write_to_db falla -> degraded + marca + runs.log (mock, sin red) ---

def _write_creds_cfg(workdir, subs):
    (workdir / "credentials.json").write_text(
        json.dumps({"client_id": "id", "client_secret": "s", "user_agent": "ua"}),
        encoding="utf-8",
    )
    (workdir / "config.json").write_text(json.dumps({"subreddits": subs}), encoding="utf-8")


def _mock_clean_run(monkeypatch, subs):
    """collect_items vacio + token falso: la corrida solo ejercita el cierre."""
    monkeypatch.setattr(monitor, "get_token", lambda *a: "tok")
    stats = {"subreddit": subs[0], "posts_scanned": 0, "comments_scanned": 0,
             "posts_en_ventana": 0, "comments_en_ventana": 0}
    monkeypatch.setattr(monitor, "collect_items", lambda *a, **k: ([], [], dict(stats)))


def _mock_db_broken(monkeypatch):
    def boom(*a, **k):
        raise RuntimeError("disco lleno")
    monkeypatch.setattr(monitor, "write_to_db", boom)


def _main_rc(monkeypatch, workdir):
    monkeypatch.setattr(sys, "argv", ["monitor.py", str(workdir)])
    return monitor.main()


def _last_scan_run(workdir):
    conn = dbmod.connect(workdir / "reddit_monitor.db")
    try:
        return conn.execute(
            "SELECT status, error_detail FROM scan_runs ORDER BY id DESC LIMIT 1"
        ).fetchone()
    finally:
        conn.close()


def _last_runs_log_status(workdir):
    lines = (workdir / "runs.log").read_text(encoding="utf-8").strip().splitlines()
    return json.loads(lines[-1])["status"]


def test_rm008_db_falla_deja_degraded_marca_y_runs_log(monkeypatch, workdir):
    _write_creds_cfg(workdir, ["chile"])
    _mock_clean_run(monkeypatch, ["chile"])
    _mock_db_broken(monkeypatch)
    assert _main_rc(monkeypatch, workdir) == 0
    row = _last_scan_run(workdir)
    assert row["status"] == "degraded"
    assert "db_degraded" in (row["error_detail"] or "")
    digest = next(workdir.glob("digest-*.md")).read_text(encoding="utf-8")
    assert digest.count(monitor.DB_DEGRADED_MARKER) == 1
    assert _last_runs_log_status(workdir) == "degraded"


def test_rm008_marca_dedup_en_corridas_degradadas_repetidas(monkeypatch, workdir):
    """R-04: el marcador RM-008 aparece una sola vez por digest."""
    _write_creds_cfg(workdir, ["chile"])
    _mock_clean_run(monkeypatch, ["chile"])
    _mock_db_broken(monkeypatch)
    assert _main_rc(monkeypatch, workdir) == 0
    assert _main_rc(monkeypatch, workdir) == 0
    digest = next(workdir.glob("digest-*.md")).read_text(encoding="utf-8")
    assert digest.count(monitor.DB_DEGRADED_MARKER) == 1


def test_rm008_db_falla_mas_sub_errores_sigue_degraded(monkeypatch, workdir):
    """R-04: DB rota + sub-errores coincidentes -> 'degraded' rc=0, no 'error'."""
    _write_creds_cfg(workdir, ["chile"])
    monkeypatch.setattr(monitor, "get_token", lambda *a: "tok")

    def sub_down(*a, **k):
        raise RuntimeError("sub caido")

    monkeypatch.setattr(monitor, "collect_items", sub_down)
    _mock_db_broken(monkeypatch)
    assert _main_rc(monkeypatch, workdir) == 0
    assert _last_runs_log_status(workdir) == "degraded"
    assert _last_scan_run(workdir)["status"] == "degraded"


def test_write_degraded_run_fallback_en_schema_viejo(tmp_path):
    """R-04: pre-RM-008 CHECK (sin 'degraded') -> 'error' con prefijo, sin
    fallback muerto."""
    db_path = tmp_path / "reddit_monitor.db"
    conn = sqlite3.connect(db_path)
    conn.execute(
        "CREATE TABLE scan_runs (id INTEGER PRIMARY KEY, started_at TEXT, "
        "status TEXT NOT NULL CHECK (status IN ('ok', 'error')), "
        "lookback_seconds INTEGER, gap_extended_hours REAL, n_new INTEGER, "
        "n_discarded INTEGER, error_detail TEXT, filter_version TEXT)"
    )
    conn.commit()
    conn.close()
    monitor.write_degraded_run(
        tmp_path, started_at_iso="x", lookback_seconds=4500,
        gap_extended_hours=None, n_new=0, n_discarded=0,
        error_detail="r/chile: 500", db_error="boom",
    )
    conn = dbmod.connect(db_path)
    try:
        row = conn.execute(
            "SELECT status, error_detail FROM scan_runs ORDER BY id DESC LIMIT 1"
        ).fetchone()
    finally:
        conn.close()
    assert row["status"] == "error"
    assert row["error_detail"].startswith("degraded: ")
    assert "db_degraded: boom" in row["error_detail"]
