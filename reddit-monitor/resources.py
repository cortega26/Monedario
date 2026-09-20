"""
Sugerencia de recurso de Monedario (calculadora) para un hilo de Reddit.

Es la parte rescatada del antiguo Worker de alertas (`KEYWORD_GROUPS`): dice
QUE herramienta encaja con lo que pregunta el hilo, para no adivinar el link
al responder. Solo sugiere; nunca responde ni publica nada.

`resource_map` (config.json) es una lista ordenada de grupos:
    {"label": "Simulador Operacion Renta",
     "url": "https://monedario.cl/calculadoras/operacion-renta/",
     "phrases": ["operacion renta", "formulario 22"]}
El primer grupo cuyas frases aparecen en el texto gana, asi que los grupos mas
especificos van antes. Las frases se comparan sin acentos ni mayusculas y por
palabra completa (mismas reglas que las keywords del monitor).

Se calcula al renderizar la cola, no al escanear: cambiar el mapa aplica a los
pendientes existentes y no requiere migrar la DB.
"""
import json
from pathlib import Path

from normalize import keyword_pattern, normalize


def _valid_group(group) -> bool:
    if not isinstance(group, dict):
        return False
    url = group.get("url")
    phrases = group.get("phrases")
    return (
        isinstance(group.get("label"), str) and group["label"].strip() != ""
        # Solo https: la URL termina en un href y en un campo del formulario,
        # asi que un esquema raro (javascript:, data:) nunca debe pasar.
        and isinstance(url, str) and url.startswith("https://")
        and isinstance(phrases, list) and any(isinstance(p, str) and p.strip() for p in phrases)
    )


def load_resource_map(config_path: Path) -> list[dict]:
    """resource_map de config.json; lista vacia si el archivo falta, esta roto
    o no define el mapa (la cola debe funcionar igual sin sugerencias)."""
    try:
        cfg = json.loads(Path(config_path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    groups = cfg.get("resource_map") if isinstance(cfg, dict) else None
    return [g for g in groups if _valid_group(g)] if isinstance(groups, list) else []


def suggest_resource(text: str | None, resource_map: list[dict]) -> dict | None:
    """{'label', 'url'} del primer grupo que coincide con `text`, o None."""
    if not text or not resource_map:
        return None
    norm = normalize(text)
    for group in resource_map:
        for phrase in group["phrases"]:
            if isinstance(phrase, str) and phrase.strip() and keyword_pattern(phrase).search(norm):
                return {"label": group["label"], "url": group["url"]}
    return None
