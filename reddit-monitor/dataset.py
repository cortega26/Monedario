"""
Etapa 2 del ciclo de feedback: arma el dataset etiquetado a partir de
human_reviews. Solo lectura — nada aqui escribe en la DB — y sin dependencias
externas, para poder correrlo en la VM o en local sobre una copia.

Cada Example es una decision humana sobre un match (que las reglas dejaron
pasar) o sobre un descarte automatico del filtro. `rule_kept` distingue una
de otra: es lo que permite medir precision (sobre matches) y falsos
negativos (sobre descartes) por separado.
"""
import sqlite3
from dataclasses import dataclass
from pathlib import Path

# Las etiquetas implicitas (descartes previos sin motivo) son evidencia mas
# debil que un motivo elegido a proposito: pesan menos al entrenar.
WEIGHT_EXPLICIT = 1.0
WEIGHT_IMPLICIT = 0.3


@dataclass(frozen=True)
class Example:
    source: str                 # 'match' | 'discarded'
    item_id: int
    subreddit: str
    text: str
    keywords: tuple[str, ...]
    rule_kept: bool             # True = paso el filtro de reglas
    rule_confidence: str | None # 'Alta' | 'Media' | 'Baja' (matches) / None
    intent_score: int | None
    ml_confidence: float | None
    label: int                  # 1 = relevante (accionable), 0 = ruido
    on_topic: int | None
    reason: str | None
    explicit: bool
    weight: float


def open_readonly(db_path: Path) -> sqlite3.Connection:
    """Conexion de solo lectura: no ejecuta schema.sql ni exige version, asi
    que sirve incluso sobre una copia vieja o mientras corre el monitor."""
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn


_MATCHES_SQL = """
SELECT hr.label, hr.on_topic, hr.reason, hr.source AS review_source,
       m.id, m.subreddit, m.title, m.snippet, m.confidence, m.intent_score, m.ml_confidence,
       (SELECT group_concat(keyword, '|') FROM match_keywords k WHERE k.match_id = m.id) AS kws
FROM human_reviews hr JOIN matches m ON m.id = hr.match_id
"""

_DISCARDED_SQL = """
SELECT hr.label, hr.on_topic, hr.reason, hr.source AS review_source,
       d.id, d.subreddit, d.snippet, d.confidence, d.ml_confidence, d.keyword AS kws
FROM human_reviews hr JOIN discarded d ON d.id = hr.discarded_id
"""


def _example(r: sqlite3.Row, source: str) -> Example:
    explicit = r["review_source"] == "explicita"
    title = r["title"] if source == "match" and r["title"] else ""
    text = f"{title}\n{r['snippet'] or ''}".strip()
    return Example(
        source=source, item_id=r["id"], subreddit=r["subreddit"], text=text,
        keywords=tuple(k for k in (r["kws"] or "").split("|") if k),
        rule_kept=source == "match",
        rule_confidence=r["confidence"] if source == "match" else None,
        intent_score=r["intent_score"] if source == "match" else None,
        ml_confidence=r["ml_confidence"],
        label=1 if r["label"] == "relevante" else 0,
        on_topic=r["on_topic"], reason=r["reason"], explicit=explicit,
        weight=WEIGHT_EXPLICIT if explicit else WEIGHT_IMPLICIT,
    )


def load_examples(conn: sqlite3.Connection) -> list[Example]:
    out = [_example(r, "match") for r in conn.execute(_MATCHES_SQL)]
    out += [_example(r, "discarded") for r in conn.execute(_DISCARDED_SQL)]
    return out
