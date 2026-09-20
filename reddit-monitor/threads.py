"""
Agrupacion de matches por hilo de Reddit para la cola.

Un mismo hilo puede generar varios matches: el post y N comentarios que
coinciden con las keywords. Sin agrupar, "sueldo necesario?" ocupo 3 tarjetas.
Las etiquetas (Carlos, 84 al 2026-09-20) muestran ademas que los comentarios
casi nunca son accionables (1 de ~45): son respuestas de otros, no preguntas.
Por eso la cola muestra UNA tarjeta por hilo, con el post como principal y los
comentarios plegados, y deja al final los hilos de los que solo vimos
comentarios (el post original no paso el filtro).

Puro y sin dependencias de la DB: recibe filas con id, type y permalink.
"""
import re

_THREAD_RE = re.compile(r"/comments/([a-z0-9]+)/", re.IGNORECASE)


def thread_key(permalink: str | None) -> str:
    """Id del post dentro del permalink (igual para el post y sus comentarios).
    Si el permalink no tiene la forma de Reddit, es su propia clave: nunca
    se agrupan por accidente hilos distintos."""
    match = _THREAD_RE.search(permalink or "")
    return match.group(1).lower() if match else (permalink or "")


def group_by_thread(rows) -> list[dict]:
    """Agrupa filas (ya ordenadas por prioridad) por hilo.

    Devuelve dicts {key, primary, extras, has_post, ids}: `primary` es el post
    si el hilo lo trae, si no la primera fila; `extras` el resto en el orden
    original; `ids` todos los ids del grupo. Los hilos con post van primero y
    los de solo comentarios despues; dentro de cada bloque se conserva el orden
    de aparicion (prioridad) de la entrada.
    """
    order: list[str] = []
    members: dict[str, list] = {}
    for row in rows:
        key = thread_key(row["permalink"])
        if key not in members:
            members[key] = []
            order.append(key)
        members[key].append(row)

    groups = []
    for key in order:
        rows_in = members[key]
        primary = next((r for r in rows_in if r["type"] == "post"), rows_in[0])
        extras = [r for r in rows_in if r is not primary]
        groups.append({
            "key": key,
            "primary": primary,
            "extras": extras,
            "has_post": primary["type"] == "post",
            "ids": [primary["id"]] + [r["id"] for r in extras],
        })
    # sorted() es estable: conserva el orden de prioridad dentro de cada bloque.
    return sorted(groups, key=lambda g: not g["has_post"])
