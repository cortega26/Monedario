"""Etapa 2: dataset etiquetado y evaluador de linea base."""
import sys

import pytest

import dataset
import db as dbmod
import eval_filter
import reviews


def test_wilson_valores_conocidos():
    lo, hi = eval_filter.wilson(5, 10)
    assert lo == pytest.approx(0.2366, abs=1e-3) and hi == pytest.approx(0.7634, abs=1e-3)
    assert eval_filter.wilson(0, 0) == (0.0, 1.0)
    lo, hi = eval_filter.wilson(0, 10)  # nunca sale de [0, 1] ni da NaN
    assert lo == 0.0 and 0.0 < hi < 0.35


def test_auc_casos_limite():
    assert eval_filter.auc([(0.9, 1), (0.8, 1), (0.2, 0), (0.1, 0)]) == 1.0
    assert eval_filter.auc([(0.1, 1), (0.2, 1), (0.8, 0), (0.9, 0)]) == 0.0
    assert eval_filter.auc([(0.5, 1), (0.5, 0)]) == 0.5  # empate = azar
    assert eval_filter.auc([(0.9, 1), (0.8, 1)]) is None  # falta una clase


@pytest.fixture
def conn(tmp_path):
    c = dbmod.connect(tmp_path / "reddit_monitor.db")
    yield c
    c.close()


def _match(c, n, conf="Media", ml=None, title="Titulo"):
    mid = c.execute(
        "INSERT INTO matches (permalink, type, subreddit, created_utc, detected_at, title, "
        "snippet, confidence, intent_score, filter_version, ml_confidence) "
        "VALUES (?, 'post', 'chile', 1.0, 'x', ?, ?, ?, 3, 'v', ?)",
        (f"/p{n}", title, f"cuerpo {n}", conf, ml),
    ).lastrowid
    c.execute("INSERT INTO match_keywords (match_id, keyword) VALUES (?, 'afp'), (?, 'uf')", (mid, mid))
    c.commit()
    return mid


def _discarded(c, n, ml=None):
    did = c.execute(
        "INSERT INTO discarded (type, subreddit, detected_at, keyword, confidence, snippet, "
        "filter_version, ml_confidence) VALUES ('post', 'chile', 'x', 'uf', 'Baja', ?, 'v', ?)",
        (f"descartado {n}", ml),
    ).lastrowid
    c.commit()
    return did


def test_load_examples_une_matches_y_descartes(conn):
    m = _match(conn, 1, "Alta", ml=0.8)
    d = _discarded(conn, 1, ml=0.7)
    reviews.record_review(conn, "accionable", match_id=m)
    reviews.record_review(conn, "ruido", discarded_id=d, source="implicita")
    by = {e.source: e for e in dataset.load_examples(conn)}
    em, ed = by["match"], by["discarded"]
    assert (em.label, em.rule_kept, em.rule_confidence, em.explicit, em.weight) == (
        1, True, "Alta", True, dataset.WEIGHT_EXPLICIT)
    assert em.text == "Titulo\ncuerpo 1" and set(em.keywords) == {"afp", "uf"}
    assert (ed.label, ed.rule_kept, ed.rule_confidence, ed.explicit, ed.weight) == (
        0, False, None, False, dataset.WEIGHT_IMPLICIT)
    assert ed.keywords == ("uf",) and ed.ml_confidence == 0.7


def test_evaluate_reporta_precision_recall_desconocido_y_auc(conn):
    for n, (motivo, ml) in enumerate([("accionable", 0.9), ("accionable", 0.7),
                                      ("ruido", 0.3), ("ruido", 0.2)]):
        reviews.record_review(conn, motivo, match_id=_match(conn, n, ml=ml))
    out = "\n".join(eval_filter.evaluate(dataset.load_examples(conn)))
    assert "global: 2/4 = 50%" in out and "no concluyente" in out
    assert "SIN DATOS" in out  # sin descartes etiquetados el recall es desconocido
    assert "AUC = 1.00" in out
    assert "r/chile: 2/4" in out


def test_evaluate_con_falsos_negativos(conn):
    reviews.record_review(conn, "accionable", discarded_id=_discarded(conn, 1))
    reviews.record_review(conn, "ruido", discarded_id=_discarded(conn, 2))
    out = "\n".join(eval_filter.evaluate(dataset.load_examples(conn)))
    assert "descartes que eran accionables: 1/2" in out and "SIN DATOS" not in out


def test_evaluate_sin_datos_no_revienta(conn):
    out = "\n".join(eval_filter.evaluate([]))
    assert "Ejemplos etiquetados: 0" in out and "sin datos" in out and "no calculable" in out


def test_cli_solo_lectura_y_filtro_explicitas(tmp_path, monkeypatch, capsys):
    c = dbmod.connect(tmp_path / "reddit_monitor.db")
    reviews.record_review(c, "accionable", match_id=_match(c, 1))
    reviews.record_review(c, "ruido", match_id=_match(c, 2), source="implicita")
    c.close()
    before = (tmp_path / "reddit_monitor.db").stat().st_mtime_ns
    monkeypatch.setattr(sys, "argv", ["eval_filter.py", str(tmp_path), "--solo-explicitas"])
    assert eval_filter.main() == 0
    assert "Ejemplos etiquetados: 1 (1 explicitos, 0 implicitos)" in capsys.readouterr().out
    assert (tmp_path / "reddit_monitor.db").stat().st_mtime_ns == before  # no escribe
