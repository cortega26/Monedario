"""Etapa 1 del ciclo de feedback: etiquetas humanas (reviews.py, migracion
v3, endpoints de la UI)."""
import sqlite3
import sys

import pytest

import db as dbmod
import reviews


def _insert_match(conn, n: int, status: str = "pendiente") -> int:
    cur = conn.execute(
        "INSERT INTO matches (permalink, type, subreddit, created_utc, detected_at, "
        "snippet, confidence, intent_score, filter_version, status, status_changed_at) "
        "VALUES (?, 'post', 'chile', 1.0, '2026-09-19T10:00:00-03:00', ?, 'Media', 1, 'v', ?, ?)",
        (f"/r/chile/comments/{n}/x/", f"snippet {n}", status,
         None if status == "pendiente" else "2026-09-19T11:00:00-03:00"),
    )
    conn.commit()
    return cur.lastrowid


@pytest.fixture
def conn(tmp_path):
    c = dbmod.connect(tmp_path / "t.db")
    yield c
    c.close()


def test_record_review_mapea_motivo_a_label_y_on_topic(conn):
    mid = _insert_match(conn, 1)
    for motivo, label, on_topic in [
        ("accionable", "relevante", 1), ("tema_sin_accion", "ruido", 1),
        ("ya_resuelto", "ruido", 1), ("ruido", "ruido", 0),
    ]:
        reviews.record_review(conn, motivo, match_id=mid)
        row = conn.execute("SELECT * FROM human_reviews WHERE match_id = ?", (mid,)).fetchall()
        assert len(row) == 1  # una decision nueva reemplaza la anterior
        assert (row[0]["label"], row[0]["on_topic"], row[0]["reason"], row[0]["source"]) == (
            label, on_topic, motivo, "explicita")


def test_record_review_valida_argumentos(conn):
    mid = _insert_match(conn, 1)
    with pytest.raises(ValueError):
        reviews.record_review(conn, "inventado", match_id=mid)
    with pytest.raises(ValueError):
        reviews.record_review(conn, "ruido")
    with pytest.raises(ValueError):
        reviews.record_review(conn, "ruido", match_id=mid, discarded_id=1)


def test_migracion_v3_agrega_columnas_e_importa_implicitas(tmp_path, monkeypatch):
    path = tmp_path / "reddit_monitor.db"
    c = dbmod.connect(path)
    a = _insert_match(c, 1, "atendido")
    d = _insert_match(c, 2, "descartado")
    p = _insert_match(c, 3, "pendiente")
    # Rebobina a una DB v2 real: human_reviews sin columnas nuevas.
    c.executescript("""
        DROP TABLE human_reviews;
        CREATE TABLE human_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
            discarded_id INTEGER REFERENCES discarded(id) ON DELETE CASCADE,
            reviewer TEXT NOT NULL DEFAULT 'carlos',
            label TEXT NOT NULL CHECK (label IN ('relevante', 'ruido')),
            reviewed_at TEXT NOT NULL, notes TEXT,
            CHECK ((match_id IS NOT NULL) <> (discarded_id IS NOT NULL)));
        UPDATE schema_meta SET value = '2' WHERE key = 'schema_version';
    """)
    c.close()

    import migrate_v3_reviews
    for _ in range(2):  # idempotente: la segunda corrida no duplica nada
        monkeypatch.setattr(sys, "argv", ["migrate_v3_reviews.py", str(tmp_path)])
        assert migrate_v3_reviews.main() == 0

    c = dbmod.connect(path)  # ahora exige v3: si la migracion no sello, revienta
    rows = {r["match_id"]: r for r in c.execute("SELECT * FROM human_reviews")}
    c.close()
    assert set(rows) == {a, d}  # el pendiente no se etiqueta
    assert (rows[a]["label"], rows[a]["reason"], rows[a]["on_topic"], rows[a]["source"]) == (
        "relevante", "accionable", 1, "implicita")
    assert (rows[d]["label"], rows[d]["reason"], rows[d]["on_topic"], rows[d]["source"]) == (
        "ruido", reviews.MOTIVO_IMPLICITO, None, "implicita")


def test_migracion_v3_asigna_motivo_a_etiquetas_explicitas_antiguas(tmp_path, monkeypatch):
    path = tmp_path / "reddit_monitor.db"
    c = dbmod.connect(path)
    m1, m2 = _insert_match(c, 1), _insert_match(c, 2)
    c.executescript("UPDATE schema_meta SET value = '2' WHERE key = 'schema_version';")
    # Filas como las dejaba review_sampling.py antes de los motivos.
    c.execute("INSERT INTO human_reviews (match_id, label, reviewed_at) VALUES (?, 'ruido', 'x')", (m1,))
    c.execute("INSERT INTO human_reviews (match_id, label, reviewed_at) VALUES (?, 'relevante', 'x')", (m2,))
    c.commit()
    c.close()
    import migrate_v3_reviews
    monkeypatch.setattr(sys, "argv", ["migrate_v3_reviews.py", str(tmp_path)])
    assert migrate_v3_reviews.main() == 0
    c = dbmod.connect(path)
    got = {r["match_id"]: (r["reason"], r["on_topic"], r["source"])
           for r in c.execute("SELECT * FROM human_reviews")}
    c.close()
    assert got == {m1: ("ruido", 0, "explicita"), m2: ("accionable", 1, "explicita")}


def test_migrate_fase06_no_sella_v3(tmp_path, monkeypatch):
    """Correr solo la migracion de Fase 0.6 no debe marcar la DB como v3."""
    path = tmp_path / "reddit_monitor.db"
    c = dbmod.connect(path)
    c.execute("UPDATE schema_meta SET value = '1' WHERE key = 'schema_version'")
    c.commit()
    c.close()
    import migrate_fase06_schema
    monkeypatch.setattr(sys, "argv", ["migrate_fase06_schema.py", str(tmp_path)])
    assert migrate_fase06_schema.main() == 0
    raw = sqlite3.connect(path)
    assert raw.execute("SELECT value FROM schema_meta").fetchone()[0] == "2"
    raw.close()


def test_descartar_guarda_motivo_y_etiqueta(client):
    tc, path = client
    c = dbmod.connect(path)
    mid = _insert_match(c, 1)
    c.close()
    r = tc.post(f"/matches/{mid}/descartar", data={"motivo": "tema_sin_accion"})
    assert r.status_code == 303
    c = dbmod.connect(path)
    m = c.execute("SELECT status, status_note FROM matches WHERE id = ?", (mid,)).fetchone()
    h = c.execute("SELECT label, on_topic, reason FROM human_reviews WHERE match_id = ?", (mid,)).fetchone()
    c.close()
    assert (m["status"], m["status_note"]) == ("descartado", "tema_sin_accion")
    assert (h["label"], h["on_topic"], h["reason"]) == ("ruido", 1, "tema_sin_accion")


def test_descartar_rechaza_motivo_invalido_y_match_inexistente(client):
    tc, path = client
    c = dbmod.connect(path)
    mid = _insert_match(c, 1)
    c.close()
    assert tc.post(f"/matches/{mid}/descartar", data={"motivo": "accionable"}).status_code == 422
    assert tc.post("/matches/9999/descartar", data={"motivo": "ruido"}).status_code == 404
    c = dbmod.connect(path)
    assert c.execute("SELECT status FROM matches WHERE id = ?", (mid,)).fetchone()["status"] == "pendiente"
    assert c.execute("SELECT COUNT(*) FROM human_reviews").fetchone()[0] == 0
    c.close()


def test_atender_guarda_etiqueta_accionable(client):
    tc, path = client
    c = dbmod.connect(path)
    mid = _insert_match(c, 1)
    c.close()
    assert tc.post(f"/matches/{mid}/atender", data={}).status_code == 303
    c = dbmod.connect(path)
    h = c.execute("SELECT label, reason, source FROM human_reviews WHERE match_id = ?", (mid,)).fetchone()
    c.close()
    assert (h["label"], h["reason"], h["source"]) == ("relevante", "accionable", "explicita")


def test_revision_lista_implicitas_y_guardar_reemplaza(client):
    tc, path = client
    c = dbmod.connect(path)
    mid = _insert_match(c, 1, "descartado")
    reviews.record_review(c, "ruido", match_id=mid)
    c.execute("UPDATE human_reviews SET source='implicita', reason=?, on_topic=NULL WHERE match_id=?",
              (reviews.MOTIVO_IMPLICITO, mid))
    c.commit()
    c.close()
    page = tc.get("/revision")
    assert page.status_code == 200 and "snippet 1" in page.text
    assert tc.post(f"/revision/match/{mid}", data={"motivo": "tema_sin_accion"}).status_code == 303
    c = dbmod.connect(path)
    rows = c.execute("SELECT reason, source FROM human_reviews WHERE match_id = ?", (mid,)).fetchall()
    c.close()
    assert [(r["reason"], r["source"]) for r in rows] == [("tema_sin_accion", "explicita")]
    assert "snippet 1" not in tc.get("/revision").text  # ya no esta pendiente de motivo


def test_revision_rechaza_origen_y_motivo_invalidos(client):
    tc, _ = client
    assert tc.post("/revision/otro/1", data={"motivo": "ruido"}).status_code == 404
    assert tc.post("/revision/match/1", data={"motivo": "zzz"}).status_code == 422
    assert tc.post("/revision/match/9999", data={"motivo": "ruido"}).status_code == 404


def test_cola_y_atendidos_renderizan_con_motivos(client):
    tc, path = client
    c = dbmod.connect(path)
    pend = _insert_match(c, 1)
    desc = _insert_match(c, 2, "descartado")
    c.execute("UPDATE matches SET status_note = 'ya_resuelto' WHERE id = ?", (desc,))
    c.commit()
    c.close()
    cola = tc.get("/")
    assert cola.status_code == 200
    for motivo in ("ruido", "tema_sin_accion", "ya_resuelto"):
        assert f'name="motivo" value="{motivo}"' in cola.text
    assert f"/matches/{pend}/descartar" in cola.text
    atendidos = tc.get("/atendidos")
    assert atendidos.status_code == 200 and "Motivo: ya_resuelto" in atendidos.text


def test_wikis_renderiza_y_guarda(client):
    tc, path = client
    c = dbmod.connect(path)
    _insert_match(c, 1)
    c.close()
    page = tc.get("/wikis")  # antes: 500 por tabla subreddit_wiki_status inexistente
    assert page.status_code == 200 and "chile" in page.text
    assert tc.post("/wikis/chile", data={"checked": "true", "notes": "sin wiki"}).status_code == 303
    c = dbmod.connect(path)
    row = c.execute("SELECT checked, has_monedario, notes FROM subreddit_wiki_status").fetchone()
    c.close()
    assert (row["checked"], row["has_monedario"], row["notes"]) == (1, 0, "sin wiki")


def test_revision_guarda_etiqueta_de_descarte_automatico(client):
    """Rama discarded de /revision (la otra suite solo usa match_id)."""
    tc, path = client
    c = dbmod.connect(path)
    did = c.execute(
        "INSERT INTO discarded (type, subreddit, detected_at, snippet, filter_version) "
        "VALUES ('post', 'chile', '2026-09-19T10:00:00-03:00', 'descartado auto', 'v')"
    ).lastrowid
    c.commit()
    c.close()
    assert tc.post(f"/revision/discarded/{did}", data={"motivo": "accionable"}).status_code == 303
    c = dbmod.connect(path)
    h = c.execute("SELECT match_id, label, reason FROM human_reviews WHERE discarded_id = ?", (did,)).fetchone()
    c.close()
    assert (h["match_id"], h["label"], h["reason"]) == (None, "relevante", "accionable")  # falso negativo
    assert tc.post("/revision/discarded/9999", data={"motivo": "ruido"}).status_code == 404
