#!/usr/bin/env python3
"""
Verificador de borradores de respuesta para Reddit (ver REPLY_GUIDE.md).

Los borradores los prepara una IA y los envia una persona. Este archivo aplica
las reglas que no deben depender de la memoria de nadie, sobre todo las que
delatan redaccion de IA ("AI slop") o exponen a la cuenta:

  ERROR  bloquea el borrador (no se le muestra a la persona como listo)
  AVISO  hay que revisarlo a mano antes de enviar

Regla dura: NUNCA emojis ni simbolos decorativos (flechas, checks, estrellas).

Uso:  python3 reply_lint.py [--enlace] < borrador.txt      (exit 1 si hay ERROR)
      --enlace  el borrador incluye un enlace a Monedario a proposito
"""
import re
import sys
from dataclasses import dataclass

MAX_PALABRAS_AVISO = 120
MAX_PALABRAS_ERROR = 180

# Emojis, pictogramas, dingbats (checks, estrellas), flechas y modificadores.
_EMOJI = re.compile(
    "[\U0001F000-\U0001FAFF\U0001F1E6-\U0001F1FF"   # emojis, banderas
    "☀-➿"                                  # simbolos varios y dingbats
    "⬀-⯿←-⇿⌀-⏿"        # flechas y simbolos tecnicos
    "‍️⃣]"                            # unidores y selectores
)
_URL = re.compile(r"https?://\S+|\bwww\.\S+|\b[\w-]+\.(?:cl|com|org|net)/\S*", re.IGNORECASE)
_DIVULGACION = re.compile(r"\b(soy|somos|trabajo|del equipo|parte del equipo)\b[^.\n]{0,40}\bmonedario\b", re.IGNORECASE)

# Muletillas tipicas de texto generado. Se buscan sin distinguir mayusculas.
_MULETILLAS = [
    "excelente pregunta", "buena pregunta", "muy buena pregunta", "claro que sí", "por supuesto",
    "es importante destacar", "cabe destacar", "cabe mencionar", "es fundamental", "es crucial",
    "en resumen", "en conclusión", "en definitiva", "espero que esto te ayude", "espero que te sirva",
    "espero haber ayudado", "no dudes en", "te recomiendo encarecidamente", "sumergirse",
    "hoy en día", "en la actualidad", "en el mundo de", "a continuación", "navegar por",
    "un abanico de", "estoy aquí para ayudarte", "como modelo", "como ia", "¿te gustaría que",
    "si necesitas más ayuda", "quedo atento", "quedo atenta", "tenga en cuenta",
]
# Cifras que cambian: hay que verificarlas contra una fuente antes de afirmarlas.
_VOLATIL = re.compile(r"\d\s?%|\b(uf|utm|uta|imm|tope|tasa|ipc)\b", re.IGNORECASE)
# Experiencia personal inventada: la IA no la tiene y la persona debe confirmarla.
_EXPERIENCIA = re.compile(
    r"\b(yo (también )?pas[eé] por|me pas[oó] (lo mismo|igual)|en mi experiencia|"
    r"cuando yo (estaba|era|trabajaba)|como ex\b|mi hermano|mi amigo|mi jefe)\b", re.IGNORECASE)
_USTED = re.compile(r"\b(usted|ustedes|le recomiendo|puede usted)\b", re.IGNORECASE)


@dataclass(frozen=True)
class Problema:
    nivel: str      # "ERROR" | "AVISO"
    codigo: str
    detalle: str

    def __str__(self) -> str:
        return f"[{self.nivel}] {self.codigo}: {self.detalle}"


def revisar(texto: str, *, con_enlace: bool = False) -> list[Problema]:
    """Devuelve los problemas del borrador (lista vacia = sin observaciones)."""
    out: list[Problema] = []
    limpio = texto.strip()
    if not limpio:
        return [Problema("ERROR", "vacio", "el borrador esta vacio")]

    emojis = sorted(set(_EMOJI.findall(limpio)))
    if emojis:
        out.append(Problema("ERROR", "emoji", f"nunca emojis ni simbolos decorativos: {' '.join(emojis)}"))
    if "—" in limpio:  # raya larga: marca tipica de texto generado
        out.append(Problema("ERROR", "raya", "evita la raya larga (—); usa coma, punto o parentesis"))
    if re.search(r"^\s{0,3}#{1,6}\s", limpio, re.MULTILINE):
        out.append(Problema("ERROR", "titulos", "sin titulos markdown: es un comentario, no un articulo"))
    if "**" in limpio or "__" in limpio:
        out.append(Problema("ERROR", "negritas", "sin negritas: no se escribe asi en Reddit"))

    bajo = limpio.lower()
    for frase in _MULETILLAS:
        if frase in bajo:
            out.append(Problema("ERROR", "muletilla", f"suena a texto generado: \"{frase}\""))

    palabras = len(limpio.split())
    if palabras > MAX_PALABRAS_ERROR:
        out.append(Problema("ERROR", "largo", f"{palabras} palabras (maximo {MAX_PALABRAS_ERROR}); recorta"))
    elif palabras > MAX_PALABRAS_AVISO:
        out.append(Problema("AVISO", "largo", f"{palabras} palabras (ideal <= {MAX_PALABRAS_AVISO})"))

    viñetas = len(re.findall(r"^\s*(?:[-*•]|\d+[.)])\s+", limpio, re.MULTILINE))
    if viñetas > 3:
        out.append(Problema("AVISO", "listas", f"{viñetas} viñetas: una respuesta casual casi no lleva listas"))
    if _USTED.search(limpio):
        out.append(Problema("ERROR", "usted", "tono formal: en Reddit se tutea"))
    if limpio.startswith(("¡", "!")) or re.match(r"(?i)^(hola[,! ]+)?(excelente|genial|claro)\b", limpio):
        out.append(Problema("AVISO", "apertura", "abre sin halagar ni repetir la pregunta"))
    if limpio.count("!") > 1:
        out.append(Problema("AVISO", "exclamaciones", "muchas exclamaciones: baja el entusiasmo"))

    enlaces = _URL.findall(limpio)
    if enlaces and not con_enlace:
        out.append(Problema("ERROR", "enlace", "el borrador trae un enlace y no se pidio (por defecto, sin enlace)"))
    if enlaces and con_enlace and not _DIVULGACION.search(limpio):
        out.append(Problema("ERROR", "divulgacion", "con enlace a Monedario hay que decir que eres del equipo"))

    if _VOLATIL.search(limpio):
        out.append(Problema("AVISO", "cifra", "menciona una cifra o indicador que cambia: verifica la fuente"))
    if _EXPERIENCIA.search(limpio):
        out.append(Problema("AVISO", "experiencia", "parece experiencia personal: solo si es cierta (no la inventes)"))
    return out


def main(argv: list[str]) -> int:
    problemas = revisar(sys.stdin.read(), con_enlace="--enlace" in argv)
    for p in problemas:
        print(p)
    if not problemas:
        print("OK: sin observaciones")
    return 1 if any(p.nivel == "ERROR" for p in problemas) else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
