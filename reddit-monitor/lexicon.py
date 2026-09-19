"""
Fase 0.6 — Mejora de recall en el matching de keywords, sin tocar el
comportamiento existente (el regex exacto se mantiene identico, esto solo
SUMA formas adicionales de encontrar la misma keyword).

Por que dos tecnicas (lematizacion + stemming) y no una sola: se probaron
ambas contra casos reales y son complementarias, no intercambiables.
"invirtiendo" (verbo irregular con diptongacion e->ie) solo lo agarra la
lematizacion; "ahorrando" solo lo agarra el stemming (la lematizacion de
spaCy lo lematiza a la forma verbal "ahorrar", que no coincide con la
keyword sustantivo "ahorro"). Ninguna de las dos agarra derivaciones con
prefijo como "endeudado" -> "deuda" (raices distintas: "endeud-" vs
"deud-") — para esos casos hay que agregar la variante a mano en
config.json bajo "related_terms", no hay atajo automatico razonable.

Carga perezosa (lazy): spaCy/nltk solo se importan si alguien llama a
estas funciones, para no pagar el costo de import en scripts que no los
necesitan (ej. utm_link.py).
"""
import re

# RM-014: single normalize module (re-exported so `lexicon.normalize`
# keeps working for existing callers).
from normalize import keyword_pattern, normalize, strip_accents

__all__ = [
    "strip_accents",
    "normalize",
    "lemma_matches",
    "stem_matches",
    "related_term_matches",
    "expanded_keyword_matches",
]

_nlp = None
_stemmer = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        import spacy
        _nlp = spacy.load("es_core_news_sm", disable=["parser", "ner"])
    return _nlp


def _get_stemmer():
    global _stemmer
    if _stemmer is None:
        from nltk.stem.snowball import SnowballStemmer
        _stemmer = SnowballStemmer("spanish")
    return _stemmer


def lemma_matches(text: str, keywords: list[str]) -> set[str]:
    """Devuelve el subconjunto de 'keywords' cuyo lema aparece entre los
    lemas de 'text'. Compara lema-a-lema (una sola palabra por keyword;
    las keywords multi-palabra como 'tarjeta de credito' no pasan por
    aqui, ya las agarra el regex exacto de matched_keywords)."""
    single_word = [kw for kw in keywords if " " not in kw.strip()]
    if not single_word:
        return set()
    nlp = _get_nlp()
    text_lemmas = {tok.lemma_.lower() for tok in nlp(normalize(text))}
    hits = set()
    for kw in single_word:
        kw_lemma = nlp(normalize(kw))[0].lemma_.lower()
        if kw_lemma in text_lemmas:
            hits.add(kw)
    return hits


def stem_matches(text: str, keywords: list[str]) -> set[str]:
    """Igual que lemma_matches pero con stemming (Snowball). Cubre casos
    de derivacion regular por sufijo que la lematizacion de spaCy no
    conecta (ver docstring del modulo)."""
    single_word = [kw for kw in keywords if " " not in kw.strip()]
    if not single_word:
        return set()
    stemmer = _get_stemmer()
    words = re.findall(r"\w+", normalize(text))
    text_stems = {stemmer.stem(w) for w in words}
    hits = set()
    for kw in single_word:
        if stemmer.stem(normalize(kw)) in text_stems:
            hits.add(kw)
    return hits


def related_term_matches(text: str, keywords: list[str], related_terms: dict[str, list[str]]) -> set[str]:
    """related_terms es un dict keyword -> [variantes que no conecta ni
    lema ni stem], ej. {"deuda": ["endeudado", "endeudarse", "endeudarme"]}.
    Definido a mano en config.json, no hay deteccion automatica razonable
    para estos casos (ver docstring del modulo)."""
    norm = normalize(text)
    hits = set()
    for kw in keywords:
        for variant in related_terms.get(kw, []):
            if keyword_pattern(variant).search(norm):
                hits.add(kw)
                break
    return hits


def expanded_keyword_matches(text: str, keywords: list[str], related_terms: dict[str, list[str]] | None = None,
                              use_lemma: bool = True, use_stem: bool = True) -> tuple[set[str], dict[str, str]]:
    """Combina regex exacto (siempre) + lema + stem + variantes manuales.
    Devuelve (keywords_encontradas, metodo_por_keyword) donde metodo_por_keyword
    mapea cada keyword encontrada al primer metodo que la encontro
    ('regex' | 'lemma' | 'stem' | 'related_term') — util para poder medir
    despues cuanto aporta cada tecnica por separado."""
    norm = normalize(text)
    found = set()
    method = {}

    for kw in keywords:
        if keyword_pattern(kw).search(norm):
            found.add(kw)
            method[kw] = "regex"

    if use_lemma:
        for kw in lemma_matches(text, keywords):
            if kw not in found:
                found.add(kw)
                method[kw] = "lemma"

    if use_stem:
        for kw in stem_matches(text, keywords):
            if kw not in found:
                found.add(kw)
                method[kw] = "stem"

    if related_terms:
        for kw in related_term_matches(text, keywords, related_terms):
            if kw not in found:
                found.add(kw)
                method[kw] = "related_term"

    return found, method
