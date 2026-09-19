"""
RM-014 — single normalize module for reddit-monitor.

Folds the duplicated `strip_accents` / `normalize` implementations that
lived in both monitor.py and lexicon.py into one source of truth. Both
modules now import from here (and re-export the names, so `monitor.normalize`
and `lexicon.normalize` keep working for existing callers/tests).

Also centralizes keyword regex compilation: `keyword_pattern()` compiles
each distinct normalized keyword ONCE and caches it process-wide, instead
of rebuilding the same `re` pattern on every item scanned. Warmed at
startup from run() — see monitor.py.
"""
import re
import unicodedata

_pattern_cache: dict[str, re.Pattern[str]] = {}


def strip_accents(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def normalize(text: str) -> str:
    return strip_accents(text or "").lower()


def keyword_pattern(keyword: str) -> re.Pattern[str]:
    """Compiled `\\b` word-boundary pattern for one keyword, cached by its
    normalized form. Identical semantics to the inline
    `re.search(r"\\b" + re.escape(normalize(kw)) + r"\\b", norm)` this
    replaces — only the compilation is hoisted out of the hot loop."""
    key = normalize(keyword)
    pat = _pattern_cache.get(key)
    if pat is None:
        pat = re.compile(r"\b" + re.escape(key) + r"\b")
        _pattern_cache[key] = pat
    return pat


def compile_keyword_patterns(keywords: list[str]) -> dict[str, re.Pattern[str]]:
    """Eagerly compile (and cache) patterns for a keyword list. Called once
    at startup so scan-time matching never pays a first-compile cost."""
    return {kw: keyword_pattern(kw) for kw in keywords}
