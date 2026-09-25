"""Tests de la pestaña Siembra/Modmail: import de seed_content, acciones de
la UI y rechazo CSRF de los endpoints nuevos."""
import db as dbmod
import seed_content


def _sync(path):
    conn = dbmod.connect(path)
    try:
        seed_content.sync(conn)
    finally:
        conn.close()


def _match(draft):
    """Fila mínima de matches para probar el reflejo draft -> cola."""
    return {
        "permalink": draft["permalink"], "type": "post", "subreddit": draft["subreddit"],
        "created_utc": 1_700_000_000.0, "detected_at": "2026-09-25T00:00:00-03:00",
        "snippet": draft["thread_title"], "confidence": "Alta", "intent_score": 3,
        "filter_version": "test",
    }


def test_sync_importa_y_no_pisa_estado_humano(client):
    _tc, path = client
    _sync(path)
    conn = dbmod.connect(path)
    try:
        n1 = conn.execute("SELECT COUNT(*) c FROM seed_drafts").fetchone()["c"]
        assert n1 == len(seed_content.SEED_DRAFTS)
        assert conn.execute("SELECT COUNT(*) c FROM modmail_drafts").fetchone()["c"] == len(seed_content.MODMAILS)
        assert conn.execute("SELECT COUNT(*) c FROM wiki_targets").fetchone()["c"] == len(seed_content.WIKI_TARGETS)

        permalink = seed_content.SEED_DRAFTS[0]["permalink"]
        with conn:
            conn.execute(
                "UPDATE seed_drafts SET status='publicado', status_note='mío' WHERE permalink=?",
                (permalink,),
            )
        seed_content.sync(conn)  # segunda pasada: no debe pisar el estado humano

        row = conn.execute("SELECT * FROM seed_drafts WHERE permalink=?", (permalink,)).fetchone()
        assert conn.execute("SELECT COUNT(*) c FROM seed_drafts").fetchone()["c"] == n1
        assert row["status"] == "publicado" and row["status_note"] == "mío"
    finally:
        conn.close()


def test_siembra_lista_borradores(client):
    tc, path = client
    _sync(path)
    r = tc.get("/siembra")
    assert r.status_code == 200
    assert "Copiar y abrir hilo" in r.text
    assert "Me despidieron" in r.text
    # el descartado del lote 1 se muestra como cerrado
    assert "Descartado" in r.text


def test_marcar_publicado_refleja_en_cola_accion_y_review(client):
    tc, path = client
    _sync(path)
    draft = seed_content.SEED_DRAFTS[0]
    conn = dbmod.connect(path)
    try:
        m = _match(draft)
        with conn:
            conn.execute(
                "INSERT INTO matches (permalink, type, subreddit, created_utc, detected_at, "
                "snippet, confidence, intent_score, filter_version, status) "
                "VALUES (:permalink, :type, :subreddit, :created_utc, :detected_at, "
                ":snippet, :confidence, :intent_score, :filter_version, 'pendiente')",
                m,
            )
        seed_id = conn.execute("SELECT id FROM seed_drafts WHERE permalink=?", (draft["permalink"],)).fetchone()["id"]
        match_id = conn.execute("SELECT id FROM matches WHERE permalink=?", (draft["permalink"],)).fetchone()["id"]
    finally:
        conn.close()

    r = tc.post(
        f"/siembra/{seed_id}/publicado",
        data={"nota": "publicado en prueba"},
        headers={"sec-fetch-site": "same-origin"},
    )
    assert r.status_code == 303
    conn = dbmod.connect(path)
    try:
        assert conn.execute("SELECT status FROM seed_drafts WHERE id=?", (seed_id,)).fetchone()["status"] == "publicado"
        assert conn.execute("SELECT status FROM matches WHERE id=?", (match_id,)).fetchone()["status"] == "atendido"
        act = conn.execute("SELECT * FROM actions WHERE match_id=?", (match_id,)).fetchone()
        assert act is not None and act["response_has_link"] == 1 and act["utm_url"]
        # la etiqueta humana queda registrada (fuente explicita)
        rev = conn.execute(
            "SELECT * FROM human_reviews WHERE match_id=? AND source='explicita'", (match_id,)
        ).fetchone()
        assert rev is not None and rev["reason"] == "accionable"
    finally:
        conn.close()


def test_descartar_borrador_cierra_match(client):
    tc, path = client
    _sync(path)
    draft = seed_content.SEED_DRAFTS[0]
    conn = dbmod.connect(path)
    try:
        conn.execute(
            "INSERT INTO matches (permalink, type, subreddit, created_utc, detected_at, "
            "snippet, confidence, intent_score, filter_version, status) "
            "VALUES (:permalink, :type, :subreddit, :created_utc, :detected_at, "
            ":snippet, :confidence, :intent_score, :filter_version, 'pendiente')",
            _match(draft),
        )
        conn.commit()
        seed_id = conn.execute("SELECT id FROM seed_drafts WHERE permalink=?", (draft["permalink"],)).fetchone()["id"]
    finally:
        conn.close()

    r = tc.post(
        f"/siembra/{seed_id}/descartar",
        data={"motivo": "ya_resuelto", "nota": ""},
        headers={"sec-fetch-site": "same-origin"},
    )
    assert r.status_code == 303
    conn = dbmod.connect(path)
    try:
        assert conn.execute("SELECT status FROM seed_drafts WHERE id=?", (seed_id,)).fetchone()["status"] == "descartado"
        assert conn.execute(
            "SELECT status FROM matches WHERE permalink=?", (draft["permalink"],)
        ).fetchone()["status"] == "descartado"
    finally:
        conn.close()


def test_sin_link_para_subs_con_regla(client):
    tc, path = client
    _sync(path)
    conn = dbmod.connect(path)
    try:
        rows = conn.execute(
            "SELECT * FROM seed_drafts WHERE link_policy != 'link-permitido'"
        ).fetchall()
        assert rows, "debe haber borradores sujetos a regla de sub"
        for r in rows:
            # test del kit: sin la URL el comentario igual sirve y no promociona
            assert r["draft_text_no_link"]
            assert "http" not in r["draft_text_no_link"]
            assert "monedario" not in r["draft_text_no_link"].lower()
    finally:
        conn.close()
    html = tc.get("/siembra").text
    assert "Sin link · regla del sub" in html
    assert "Versión con link (solo si los mods la aprueban)" in html


def test_modmail_lista_y_registra_estado(client):
    tc, path = client
    _sync(path)
    r = tc.get("/modmail")
    assert r.status_code == 200
    assert "FinanzasChile" in r.text and "Copiar y abrir modmail" in r.text

    r = tc.post(
        "/modmail/FinanzasChile",
        data={"estado": "enviado", "nota": "enviado en prueba"},
        headers={"sec-fetch-site": "same-origin"},
    )
    assert r.status_code == 303
    conn = dbmod.connect(path)
    try:
        row = conn.execute("SELECT * FROM modmail_drafts WHERE subreddit='FinanzasChile'").fetchone()
        assert row["status"] == "enviado" and row["sent_at"]
        wiki = conn.execute("SELECT * FROM subreddit_wiki_status WHERE subreddit='FinanzasChile'").fetchone()
        assert wiki is not None and wiki["checked"] == 1 and wiki["has_monedario"] == 0
    finally:
        conn.close()

    # aceptado marca has_monedario sin perder checked
    tc.post(
        "/modmail/FinanzasChile",
        data={"estado": "aceptado", "nota": ""},
        headers={"sec-fetch-site": "same-origin"},
    )
    conn = dbmod.connect(path)
    try:
        wiki = conn.execute("SELECT * FROM subreddit_wiki_status WHERE subreddit='FinanzasChile'").fetchone()
        assert wiki["checked"] == 1 and wiki["has_monedario"] == 1
    finally:
        conn.close()


def test_wikis_muestra_objetivo_y_modmail(client):
    tc, path = client
    _sync(path)
    r = tc.get("/wikis")
    assert r.status_code == 200
    assert "publica-sin-monedario" in r.text
    assert "old.reddit.com/r/FinanzasChile/wiki/index" in r.text


def test_endpoints_nuevos_rechazan_origen_cruzado(client):
    tc, path = client
    _sync(path)
    headers = {"sec-fetch-site": "cross-site"}
    r = tc.post("/siembra/1/publicado", data={"nota": ""}, headers=headers)
    assert r.status_code == 403
    r = tc.post("/siembra/1/descartar", data={"motivo": "ruido"}, headers=headers)
    assert r.status_code == 403
    r = tc.post("/modmail/FinanzasChile", data={"estado": "enviado"}, headers=headers)
    assert r.status_code == 403


def test_estado_modmail_invalido_422(client):
    tc, path = client
    _sync(path)
    r = tc.post(
        "/modmail/FinanzasChile",
        data={"estado": "hackeado"},
        headers={"sec-fetch-site": "same-origin"},
    )
    assert r.status_code == 422
