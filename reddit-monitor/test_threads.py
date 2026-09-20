"""Agrupacion de la cola por hilo (threads.py + queue/atender/descartar)."""
import pytest

import db as dbmod
import threads


def _row(id_, type_, permalink):
    return {"id": id_, "type": type_, "permalink": permalink}


def test_thread_key_es_igual_para_el_post_y_sus_comentarios():
    post = "/r/Santiago/comments/1WG4NSW/sueldo_necesario/"
    comment = "/r/Santiago/comments/1wg4nsw/sueldo_necesario/pasnoz2/"
    assert threads.thread_key(post) == threads.thread_key(comment) == "1wg4nsw"


@pytest.mark.parametrize("permalink", ["/p1", "", None])
def test_permalink_sin_forma_de_reddit_es_su_propia_clave(permalink):
    assert threads.thread_key(permalink) == (permalink or "")


def test_group_by_thread_pone_el_post_como_principal_y_conserva_ids():
    rows = [
        _row(2, "comment", "/r/s/comments/aaa/x/c1/"),
        _row(1, "post", "/r/s/comments/aaa/x/"),
        _row(3, "comment", "/r/s/comments/aaa/x/c2/"),
    ]
    (g,) = threads.group_by_thread(rows)
    assert g["primary"]["id"] == 1 and g["has_post"]
    assert [e["id"] for e in g["extras"]] == [2, 3]
    assert g["ids"] == [1, 2, 3]


def test_hilos_con_post_van_antes_que_los_de_solo_comentarios_conservando_prioridad():
    rows = [
        _row(1, "comment", "/r/s/comments/solo1/x/c/"),   # solo comentarios, mayor prioridad
        _row(2, "post", "/r/s/comments/conpost/x/"),
        _row(3, "comment", "/r/s/comments/solo2/x/c/"),
        _row(4, "post", "/r/s/comments/otropost/x/"),
    ]
    got = [g["primary"]["id"] for g in threads.group_by_thread(rows)]
    assert got == [2, 4, 1, 3]  # posts primero; dentro de cada bloque, orden original


def test_sin_filas_no_hay_grupos():
    assert threads.group_by_thread([]) == []


# --- integracion con la web -------------------------------------------------

def _match(c, n, thread, type_="comment", status="pendiente"):
    permalink = f"/r/chile/comments/{thread}/t/" + ("" if type_ == "post" else f"c{n}/")
    mid = c.execute(
        "INSERT INTO matches (permalink, type, subreddit, created_utc, detected_at, snippet, "
        "confidence, intent_score, filter_version, status) "
        "VALUES (?, ?, 'chile', 1.0, 'x', ?, 'Media', 1, 'v', ?)",
        (permalink, type_, f"snippet-{n}", status)).lastrowid
    c.commit()
    return mid


def _status(path, *ids):
    c = dbmod.connect(path)
    out = {i: tuple(c.execute("SELECT status, status_note FROM matches WHERE id = ?", (i,)).fetchone())
           for i in ids}
    n_reviews = {i: c.execute("SELECT COUNT(*) FROM human_reviews WHERE match_id = ?", (i,)).fetchone()[0]
                 for i in ids}
    c.close()
    return out, n_reviews


def test_cola_muestra_una_tarjeta_por_hilo_con_comentarios_plegados(client):
    tc, path = client
    c = dbmod.connect(path)
    _match(c, 1, "abc", "post")
    _match(c, 2, "abc")
    _match(c, 3, "abc")
    _match(c, 4, "zzz")            # hilo aparte, solo comentario
    c.close()
    html = tc.get("/").text
    assert html.count('class="card"') == 2                     # 2 hilos, no 4 filas
    assert "+2 comentarios del hilo" in html and "snippet-2" in html and "snippet-3" in html
    assert "solo comentarios" in html                          # el hilo "zzz"
    assert "2 hilos · 4 pendientes" in html
    assert html.index("snippet-1") < html.index("snippet-4")   # el hilo con post va primero


def test_descartar_aplica_el_motivo_a_todo_el_hilo_y_etiqueta_cada_match(client):
    tc, path = client
    c = dbmod.connect(path)
    post, c1, c2 = _match(c, 1, "abc", "post"), _match(c, 2, "abc"), _match(c, 3, "abc")
    ajeno = _match(c, 4, "otro")
    c.close()
    r = tc.post(f"/matches/{post}/descartar", data={"motivo": "tema_sin_accion", "ids": [c1, c2, ajeno]})
    assert r.status_code == 303
    status, reviews_n = _status(path, post, c1, c2, ajeno)
    assert status[post] == status[c1] == status[c2] == ("descartado", "tema_sin_accion")
    assert reviews_n[post] == reviews_n[c1] == reviews_n[c2] == 1      # etiqueta explicita en cada uno
    assert status[ajeno] == ("pendiente", None) and reviews_n[ajeno] == 0   # id de otro hilo: ignorado


def test_atender_cierra_los_comentarios_del_hilo_sin_etiquetarlos(client):
    tc, path = client
    c = dbmod.connect(path)
    post, c1 = _match(c, 1, "abc", "post"), _match(c, 2, "abc")
    c.close()
    assert tc.post(f"/matches/{post}/atender", data={"ids": [c1]}).status_code == 303
    status, reviews_n = _status(path, post, c1)
    assert status[post][0] == "atendido" and reviews_n[post] == 1       # accionable
    assert status[c1] == ("descartado", "hilo_atendido") and reviews_n[c1] == 0   # sin etiqueta humana


def test_descartar_sin_ids_se_comporta_como_antes(client):
    tc, path = client
    c = dbmod.connect(path)
    a, b = _match(c, 1, "abc", "post"), _match(c, 2, "abc")
    c.close()
    assert tc.post(f"/matches/{a}/descartar", data={"motivo": "ruido"}).status_code == 303
    status, _ = _status(path, a, b)
    assert status[a] == ("descartado", "ruido") and status[b] == ("pendiente", None)


def test_paginacion_cuenta_hilos_y_no_filas(client, monkeypatch):
    import app as webapp
    monkeypatch.setattr(webapp, "QUEUE_PAGE_SIZE", 2)
    tc, path = client
    c = dbmod.connect(path)
    for n, thread in enumerate(["t1", "t1", "t2", "t3"], start=1):
        _match(c, n, thread, "post" if n in (1, 3, 4) else "comment")
    c.close()
    assert tc.get("/").text.count('class="card"') == 2                  # 3 hilos, 2 por pagina
    assert tc.get("/?page=2").text.count('class="card"') == 1
