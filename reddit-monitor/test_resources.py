"""Sugerencia de calculadora por hilo (resources.py + integracion en la cola)."""
import json
from pathlib import Path

import db as dbmod
import pytest
import resources

MAP = [
    {"label": "Finiquito", "url": "https://monedario.cl/calculadoras/finiquito-indemnizacion/",
     "phrases": ["finiquito"]},
    {"label": "Sueldo", "url": "https://monedario.cl/calculadoras/sueldo-liquido/",
     "phrases": ["sueldo liquido", "de bruto a liquido"]},
]


def test_suggest_ignora_acentos_mayusculas_y_exige_palabra_completa():
    assert resources.suggest_resource("¿Cómo pasar de BRUTO a LÍQUIDO?", MAP)["label"] == "Sueldo"
    assert resources.suggest_resource("pasar el bruto a liquido", MAP) is None  # falta "de": no es la frase
    assert resources.suggest_resource("cuanto es mi Sueldo Líquido?", MAP)["label"] == "Sueldo"
    assert resources.suggest_resource("me pagaron el finiquito tarde", MAP)["label"] == "Finiquito"
    assert resources.suggest_resource("finiquitos y mas", MAP) is None  # palabra completa, no prefijo


def test_suggest_gana_el_primer_grupo_en_orden():
    text = "calcular finiquito y sueldo liquido"
    assert resources.suggest_resource(text, MAP)["label"] == "Finiquito"
    assert resources.suggest_resource(text, list(reversed(MAP)))["label"] == "Sueldo"


@pytest.mark.parametrize("text,rmap", [(None, MAP), ("", MAP), ("finiquito", []), ("nada relevante", MAP)])
def test_suggest_sin_datos_o_sin_coincidencia_devuelve_none(text, rmap):
    assert resources.suggest_resource(text, rmap) is None


def test_load_resource_map_descarta_grupos_invalidos_y_tolera_archivos_rotos(tmp_path):
    cfg = tmp_path / "config.json"
    good = MAP[0]
    cfg.write_text(json.dumps({"resource_map": [
        good,
        {"label": "Sin https", "url": "javascript:alert(1)", "phrases": ["x"]},
        {"label": "http plano", "url": "http://monedario.cl/x/", "phrases": ["x"]},
        {"label": "", "url": "https://monedario.cl/x/", "phrases": ["x"]},
        {"label": "Sin frases", "url": "https://monedario.cl/x/", "phrases": [" ", 3]},
        "no es un dict",
    ]}), encoding="utf-8")
    assert resources.load_resource_map(cfg) == [good]
    cfg.write_text("{ esto no es json", encoding="utf-8")
    assert resources.load_resource_map(cfg) == []
    assert resources.load_resource_map(tmp_path / "no-existe.json") == []
    cfg.write_text(json.dumps({"resource_map": "texto"}), encoding="utf-8")
    assert resources.load_resource_map(cfg) == []


def _match(c, n, title, snippet):
    c.execute(
        "INSERT INTO matches (permalink, type, subreddit, created_utc, detected_at, title, snippet, "
        "confidence, intent_score, filter_version) VALUES (?, 'post', 'chile', 1.0, 'x', ?, ?, 'Media', 1, 'v')",
        (f"/p{n}", title, snippet))
    c.commit()


def test_cola_muestra_sugerencia_y_prellena_la_url(client):
    tc, path = client
    (path.parent / "config.json").write_text(json.dumps({"resource_map": MAP}), encoding="utf-8")
    c = dbmod.connect(path)
    _match(c, 1, "Duda con mi finiquito", "me despidieron ayer")
    _match(c, 2, "Otro tema", "sin relacion con calculadoras")
    c.close()
    html = tc.get("/").text
    assert "Sugerencia:" in html and "Finiquito" in html
    assert html.count('value="https://monedario.cl/calculadoras/finiquito-indemnizacion/"') == 1
    assert html.count("Sugerencia:") == 1  # el segundo hilo no tiene sugerencia
    assert 'value=""' in html  # campo vacio en el hilo sin sugerencia


def test_cola_funciona_sin_config(client):
    tc, path = client  # config.json no existe
    c = dbmod.connect(path)
    _match(c, 1, "Duda con mi finiquito", "me despidieron ayer")
    c.close()
    resp = tc.get("/")
    assert resp.status_code == 200 and "Sugerencia:" not in resp.text


def test_config_real_del_repo_es_valida_y_sugiere_lo_esperado():
    """El resource_map que se despliega no debe perder grupos por validacion
    (un typo en una URL o frase lo dejaria sin sugerencias en silencio)."""
    rmap = resources.load_resource_map(Path(__file__).parent / "config.json")
    raw = json.loads((Path(__file__).parent / "config.json").read_text(encoding="utf-8"))["resource_map"]
    assert len(rmap) == len(raw) == 19
    cases = {
        "cuanto me toca de finiquito": "Calculadora de finiquito",
        "me conviene cambiarme de AFP por la comisión": "Comparador de comisiones AFP",
        "¿cuál es el valor de la UF hoy?": "Conversor UF ↔ pesos",
        "cómo calculo mi sueldo líquido": "Calculadora de sueldo líquido",
        "devolución de impuestos operación renta": "Simulador Operación Renta",
        "no alcanzo a pagar el total de la tarjeta, pago minimo": "Calculadora de tarjeta de crédito",
        "abrir cuenta de ahorro en coopeuch": "Calculadora de depósito a plazo",
        "consulta por credito hipotecario y dividendo": "Calculadora de dividendo hipotecario",
        "salir de dicom gratis": "Guía para salir del boletín comercial",
        "reajuste de arriendo 2026": "Calculadora de reajuste de arriendo",
    }
    for text, label in cases.items():
        got = resources.suggest_resource(text, rmap)
        assert got and got["label"] == label, text
    # frases anchas que daban falso positivo quedaron fuera del mapa
    assert resources.suggest_resource("uf, tengo un monton de tips", rmap) is None
    assert resources.suggest_resource("el presupuesto del estado", rmap) is None
    assert resources.suggest_resource("pensión de alimentos", rmap) is None
