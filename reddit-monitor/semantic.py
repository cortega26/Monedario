"""
Fase 0.6 — Capa semantica en modo OBSERVACION: calcula una señal adicional
de intencion (embeddings + similitud contra prototipos) y la registra junto
a cada match/descarte, pero NO decide nada todavia — confidence/status
siguen dependiendo 100% del heuristico de reglas existente.

Por que "modo observacion" antes de dejarlo decidir: se probo empiricamente
(ver conversacion) que el resultado es sensible al set de prototipos — con
prototipos genericos fallo 3/3 en ejemplos de ruido reales; con prototipos
calibrados contra el estilo real de los descartes, acerto 6/6. Eso significa
que no es seguro confiarle decisiones de produccion sin antes acumular datos
reales (via human_reviews) para calibrarlo o, mejor aun, entrenar un
clasificador liviano (regresion logistica) sobre esos embeddings una vez
haya suficientes ejemplos etiquetados.

Modelo: paraphrase-multilingual-MiniLM-L12-v2 (sentence-transformers).
CPU-only, ~1.2GB RAM mientras corre el proceso, ~5s de carga, ~2.5ms por
texto — corre en la VM (2 OCPU/12GB), no requiere GPU ni la maquina de
128GB del usuario. No se entrena nada en esta fase: son embeddings
preentrenados congelados, solo se comparan por similitud coseno.
"""
import os
# Evita que cada llamada intente chequear la red contra el Hub de Hugging
# Face (se detecto empiricamente que sin esto una corrida puede colgarse
# varios segundos por texto, aunque el modelo ya este descargado en disco).
os.environ.setdefault("HF_HUB_OFFLINE", "1")

from pathlib import Path

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
MODEL_VERSION = f"embed:{MODEL_NAME}:v1"

_model = None


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def compute_margin(text: str, prototypes_intent: list[str], prototypes_noise: list[str]) -> tuple[float, float]:
    """Devuelve (margin, ml_confidence).

    margin = similitud_max_contra_intencion - similitud_max_contra_ruido.
    Positivo => el texto se parece mas a los prototipos de intencion real
    que a los de ruido; negativo => al reves.

    ml_confidence es el margin mapeado a [0, 1] con una sigmoide, solo para
    tener un numero mas comodo de mostrar en la UI mas adelante (0.5 =
    frontera, no dice nada sobre 'confianza estadistica' real, es una
    transformacion monotona del margin nomas)."""
    import math
    from sentence_transformers import util

    if not prototypes_intent or not prototypes_noise:
        return 0.0, 0.5

    model = _get_model()
    emb = model.encode(text, convert_to_tensor=True)
    emb_intent = model.encode(prototypes_intent, convert_to_tensor=True)
    emb_noise = model.encode(prototypes_noise, convert_to_tensor=True)

    sim_intent = util.cos_sim(emb, emb_intent).max().item()
    sim_noise = util.cos_sim(emb, emb_noise).max().item()
    margin = sim_intent - sim_noise

    # sigmoide con pendiente ajustada empiricamente: los margins observados
    # en la validacion real cayeron en el rango [-0.06, +0.11] — una
    # sigmoide estandar (pendiente 1) los dejaria todos pegados a 0.5,
    # sin distinguir nada. Con pendiente 15 el rango observado se separa
    # de forma legible sin saturar en 0/1.
    ml_confidence = 1 / (1 + math.exp(-15 * margin))
    return round(margin, 6), round(ml_confidence, 6)


DEFAULT_PROTOTYPES_INTENT = [
    "Estoy buscando consejo sobre como manejar mi dinero o mis finanzas personales",
    "Tengo una duda especifica sobre ahorro, inversion, creditos o impuestos en Chile",
    "Alguien me puede recomendar que hacer con mis ahorros o mi presupuesto",
    "Quiero saber si me conviene invertir en esto o aquello",
    "Necesito ayuda para entender como funciona un tramite financiero o tributario",
]

DEFAULT_PROTOTYPES_NOISE = [
    "Me quejo de mi sueldo o mi trabajo sin pedir consejo financiero, solo desahogandome",
    "Menciono plata o deuda de pasada dentro de una historia personal que no es sobre finanzas",
    "Hablo de politica, noticias o critico a otra persona, sin relacion a dinero",
    "Cuento una anecdota o experiencia de vida donde la plata aparece pero no es el tema central",
    "Hago una broma, insulto o comentario coloquial sin pedir informacion ni consejo",
]
