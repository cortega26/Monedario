"""purge_own_authors.py: limpieza de matches de cuentas propias."""
import json
import sys

import pytest

import db as dbmod
import purge_own_authors
import reviews


def _match(c, n, author):
    mid = c.execute(
        "INSERT INTO matches (permalink, type, subreddit, created_utc, detected_at, snippet, "
        "confidence, intent_score, filter_version, author) "
        "VALUES (?, 'comment', 'chile', 1.0, 'x', 's', 'Media', 1, 'v', ?)", (f"/p{n}", author)).lastrowid
    c.execute("INSERT INTO match_keywords (match_id, keyword) VALUES (?, 'afp')", (mid,))
    c.commit()
    return mid


@pytest.fixture
def workdir(tmp_path):
    (tmp_path / "config.json").write_text(json.dumps({"own_authors": ["Yo"]}), encoding="utf-8")
    c = dbmod.connect(tmp_path / "reddit_monitor.db")
    mine, mine2, other = _match(c, 1, "yo"), _match(c, 2, "u/YO"), _match(c, 3, "otro")
    reviews.record_review(c, "tema_sin_accion", match_id=mine)
    reviews.record_review(c, "accionable", match_id=other)
    c.execute("INSERT INTO actions (match_id) VALUES (?)", (mine2,))
    c.commit()
    c.close()
    return tmp_path, mine, mine2, other


def _run(monkeypatch, workdir, *extra):
    monkeypatch.setattr(sys, "argv", ["purge_own_authors.py", str(workdir), *extra])
    return purge_own_authors.main()


def _counts(path):
    c = dbmod.connect(path / "reddit_monitor.db")
    out = {t: c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
           for t in ("matches", "human_reviews", "actions", "match_keywords")}
    c.close()
    return out


def test_dry_run_no_borra_nada(workdir, monkeypatch, capsys):
    path, *_ = workdir
    before = _counts(path)
    assert _run(monkeypatch, path) == 0
    assert "[dry-run] 2 matches" in capsys.readouterr().out
    assert _counts(path) == before


def test_apply_borra_solo_lo_propio_con_sus_hijos(workdir, monkeypatch, capsys):
    path, mine, mine2, other = workdir
    assert _run(monkeypatch, path, "--apply") == 0
    assert "Borrados 2 matches" in capsys.readouterr().out
    # queda solo el de "otro", con su etiqueta y su keyword
    assert _counts(path) == {"matches": 1, "human_reviews": 1, "actions": 0, "match_keywords": 1}
    c = dbmod.connect(path / "reddit_monitor.db")
    assert c.execute("SELECT id FROM matches").fetchone()["id"] == other
    c.close()


def test_es_idempotente(workdir, monkeypatch, capsys):
    path, *_ = workdir
    _run(monkeypatch, path, "--apply")
    capsys.readouterr()
    assert _run(monkeypatch, path, "--apply") == 0
    assert "nada que borrar" in capsys.readouterr().out


def test_sin_own_authors_se_niega_a_actuar(tmp_path, monkeypatch, capsys):
    (tmp_path / "config.json").write_text(json.dumps({"own_authors": []}), encoding="utf-8")
    dbmod.connect(tmp_path / "reddit_monitor.db").close()
    assert _run(monkeypatch, tmp_path, "--apply") == 1
    assert "own_authors esta vacio" in capsys.readouterr().err
