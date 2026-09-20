"""Fixtures compartidas de los tests de la web (FastAPI)."""
import base64

import pytest


@pytest.fixture
def client(tmp_path, monkeypatch):
    """TestClient contra una DB y un config.json temporales. Devuelve
    (cliente, ruta_de_la_db); el config vive en <ruta_de_la_db>/../config.json
    (no existe hasta que un test lo escribe: sin config no hay sugerencias)."""
    from fastapi.testclient import TestClient
    import app as webapp
    path = tmp_path / "web.db"
    monkeypatch.setattr(webapp, "DB_PATH", path)
    monkeypatch.setattr(webapp, "CONFIG_PATH", tmp_path / "config.json")
    monkeypatch.setattr(webapp, "WEB_PASSWORD", "")
    tc = TestClient(webapp.app, follow_redirects=False)
    # HTTPBasic exige el header aunque WEB_PASSWORD este vacio (cualquier
    # credencial pasa en ese caso).
    tc.headers["Authorization"] = "Basic " + base64.b64encode(b"carlos:x").decode()
    return tc, path
