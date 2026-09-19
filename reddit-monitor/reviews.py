"""
Etapa 1 del ciclo de feedback: captura de etiquetas humanas en human_reviews.

Cada decision de Carlos sobre un match (o sobre un descarte automatico del
filtro) queda como una fila de human_reviews con:
  - label:    'relevante' = accionable para Monedario, 'ruido' = no lo es.
              Es el objetivo que aprendera el clasificador (Etapa 2).
  - on_topic: 1/0/NULL — el hilo trata de finanzas aunque no sea accionable.
              Separa "tema equivocado" de "tema bueno pero sin como aportar",
              que mezclados le ensenarian al modelo a rechazar temas buenos.
  - reason:   el motivo concreto (ver MOTIVOS).
  - source:   'explicita' (Carlos eligio el motivo) o 'implicita' (importada
              de una decision previa sin motivo; peso menor al entrenar).
"""
from datetime import datetime, timezone, timedelta

CHILE_TZ = timezone(timedelta(hours=-3))

# motivo -> (label, on_topic). Unica fuente de verdad: la UI, el CLI de
# review_sampling.py y el importador historico validan contra esto.
MOTIVOS: dict[str, tuple[str, int | None]] = {
    "accionable": ("relevante", 1),        # incluye 'atendido'
    "tema_sin_accion": ("ruido", 1),       # es de finanzas, pero no aporta responder
    "ya_resuelto": ("ruido", 1),           # ya tiene buenas respuestas / esta cerrado
    "ruido": ("ruido", 0),                 # no es un tema financiero
}
MOTIVO_IMPLICITO = "descarte_previo"       # solo lo usa el importador historico


def record_review(conn, motivo: str, *, match_id: int | None = None,
                  discarded_id: int | None = None, source: str = "explicita",
                  notes: str | None = None, now_iso: str | None = None) -> None:
    """Guarda (o reemplaza) la etiqueta de un match o de un descarte.

    Una sola fila por entrada: una decision nueva reemplaza la anterior
    (incluida la implicita), asi el motivo mas reciente es el que cuenta.
    Hace commit; el llamador puede envolver en su propia transaccion si
    necesita atomicidad con otro UPDATE (usar `with conn:` afuera y
    `commit=False` no hace falta: sqlite3 anida sin problema).
    """
    if motivo not in MOTIVOS:
        raise ValueError(f"motivo invalido: {motivo!r} (validos: {sorted(MOTIVOS)})")
    if (match_id is None) == (discarded_id is None):
        raise ValueError("indica exactamente uno de match_id / discarded_id")
    label, on_topic = MOTIVOS[motivo]
    now_iso = now_iso or datetime.now(tz=CHILE_TZ).isoformat()
    col, ref = ("match_id", match_id) if match_id is not None else ("discarded_id", discarded_id)
    with conn:
        conn.execute(f"DELETE FROM human_reviews WHERE {col} = ?", (ref,))
        conn.execute(
            f"INSERT INTO human_reviews ({col}, reviewer, label, reviewed_at, notes, "
            "reason, on_topic, source) VALUES (?, 'carlos', ?, ?, ?, ?, ?, ?)",
            (ref, label, now_iso, notes, motivo, on_topic, source),
        )
