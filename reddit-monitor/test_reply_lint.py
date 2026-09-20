"""reply_lint.py: reglas de los borradores de respuesta (REPLY_GUIDE.md)."""
import pytest

import reply_lint as rl

BUENO = ("Yo primero armaria el colchon, unos 3 a 6 meses de gastos en una cuenta remunerada. "
         "Despues miraria si tienes deudas caras, porque esa tarjeta se come cualquier ganancia. "
         "Si me cuentas el plazo, te ayudo a afinar.")


def codigos(texto, **kw):
    return {p.codigo for p in rl.revisar(texto, **kw)}


def test_un_borrador_casual_y_limpio_pasa_sin_observaciones():
    assert rl.revisar(BUENO) == []


@pytest.mark.parametrize("emoji", ["🙌", "😅", "👍", "✅", "✔", "⭐", "→", "➡", "🇨🇱", "❤️"])
def test_cualquier_emoji_o_simbolo_decorativo_es_error(emoji):
    assert "emoji" in codigos(f"{BUENO} {emoji}")


def test_el_texto_con_tildes_y_signos_del_espanol_no_es_emoji():
    assert "emoji" not in codigos("¿Qué opinas? ¡Ojo con la garantía! Más allá de la comisión, ñandú.")


@pytest.mark.parametrize("texto,codigo", [
    ("Buena idea — aunque ojo con la garantia.", "raya"),
    ("# Consejos\nahorra", "titulos"),
    ("Lo **primero** es ahorrar.", "negritas"),
    ("Excelente pregunta, mira: ahorra primero.", "muletilla"),
    ("Espero que esto te ayude, no dudes en escribir.", "muletilla"),
    ("Le recomiendo que ahorre primero.", "usted"),
])
def test_marcas_de_texto_generado_son_error(texto, codigo):
    assert codigo in codigos(texto)


def test_largo_avisa_y_luego_bloquea():
    aviso = " ".join(["palabra"] * 130)
    error = " ".join(["palabra"] * 200)
    assert ("largo" in codigos(aviso)) and all(p.nivel == "AVISO" for p in rl.revisar(aviso) if p.codigo == "largo")
    assert any(p.nivel == "ERROR" and p.codigo == "largo" for p in rl.revisar(error))


def test_enlace_solo_con_permiso_y_con_divulgacion():
    con_url = BUENO + " Armamos una guia: https://monedario.cl/posts/fondo-emergencia-chile/"
    assert "enlace" in codigos(con_url)                                   # no se pidio
    assert "divulgacion" in codigos(con_url, con_enlace=True)             # falta decir quien eres
    ok = con_url.replace("Armamos una guia", "Soy del equipo de Monedario y armamos una guia")
    assert codigos(ok, con_enlace=True) == set()


def test_cifras_que_cambian_y_experiencia_inventada_son_avisos_no_errores():
    ps = rl.revisar("En mi experiencia la tasa hoy anda en 5,2% y el tope de la UF cambia.")
    assert {"cifra", "experiencia"} <= {p.codigo for p in ps}
    assert all(p.nivel == "AVISO" for p in ps if p.codigo in ("cifra", "experiencia"))


def test_muchas_viñetas_y_exclamaciones_avisan():
    lista = "Mira:\n- uno\n- dos\n- tres\n- cuatro\nsuerte!! dale!!"
    assert {"listas", "exclamaciones"} <= codigos(lista)


def test_vacio_es_error():
    assert codigos("   \n") == {"vacio"}


def test_cli_devuelve_1_solo_si_hay_error(monkeypatch, capsys):
    import io
    monkeypatch.setattr("sys.stdin", io.StringIO(BUENO + " 🙌"))
    assert rl.main([]) == 1 and "emoji" in capsys.readouterr().out
    monkeypatch.setattr("sys.stdin", io.StringIO(BUENO))
    assert rl.main([]) == 0
