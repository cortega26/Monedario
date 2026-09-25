"""
Contenido operativo de siembra — una sola fuente para la pestaña "Siembra"
de la web app (reddit.monedario.cl).

Tres bloques:

- SEED_DRAFTS: respuestas listas para pegar en hilos de Reddit, con su link
  UTM ya armado. La app las importa a la DB al arrancar (idempotente por
  permalink) y NUNCA pisa el estado humano (listo/publicado/descartado).
- MODMAILS: mensajes a moderadores pidiendo inclusión en la wiki de
  recursos del subreddit (tráfico compuesto). Mismo trato: la app copia y
  abre el compose; el envío es manual y se registra.
- WIKI_TARGETS: resultado del escaneo de wikis por API solo-lectura
  (2026-09-25), para que /wikis diga qué hacer por sub y no solo el checkbox.

Reglas que este módulo respeta (ver docs/operations/COMMUNITY_SEEDING_KIT.md):

- Nada se publica solo: automatizar = kill criterion del canal. La UI
  acelera (copiar + abrir + registrar), la persona decide y envía.
- Tono humano, no de asistente: frases cortas, empatía primero, sin
  negritas ni listas de manual, link al final y suave.
- Links de wiki/modmail SIN UTM (son permanentes, no de campaña). Los
  links de los comentarios SÍ llevan UTM (atribución de la corrida).
- Ningún dato volátil inventado: el valor del día lo da la calculadora.

Uso manual:  python3 seed_content.py <directorio_con_reddit_monitor.db>
"""
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

CHILE_TZ = timezone(timedelta(hours=-3))

# Reglas de links por subreddit (leídas por la API el 2026-09-25). Si el link
# no está permitido, la app ofrece/publica la versión sin link: se corta el
# cierre "Si te sirve... [URL]" y el comentario igual resuelve el problema
# (test del kit: si borras la URL, igual sirve).
LINK_POLICY = {
    "chile": (
        "solo-con-aprobacion",
        "r/chile: autopromoción solo con aprobación previa de los mods y para usuarios activos. Parte sin link; pide aprobación cuando la cuenta tenga historial.",
    ),
    "AskChile": (
        "sin-link",
        "r/AskChile: spam y autopromoción prohibidos. Publicar solo la versión sin link.",
    ),
    "FinanzasChile": (
        "link-permitido",
        "r/FinanzasChile: la regla 7 prohíbe promover comunidades externas, no herramientas. Aporte primero, link al final.",
    ),
}


def sin_link(texto: str) -> str:
    """Versión sin el cierre promocional, para subs donde el link no va."""
    corte = texto.find("\n\nSi ")
    if corte == -1:
        raise ValueError("borrador sin cierre 'Si ...': no se puede publicar sin link")
    return texto[:corte].strip()


# --- Respuestas preparadas --------------------------------------------------

SEED_DRAFTS = [
    {
        "permalink": "/r/chile/comments/1wnohi4/me_despidieron_después_de_4_años_y_tengo_un_buen/",
        "batch": "Lote 1 · semana del 28-sep",
        "planned_week": "2026-09-28",
        "subreddit": "chile",
        "thread_title": "Me despidieron después de 4 años y tengo un buen colchón. ¿Me doy un tiempo o busco pega altiro?",
        "preflight": "Verificado 2026-09-25: abierto, sin respuesta equivalente (API solo-lectura)",
        "link_url": "https://monedario.cl/calculadoras/finiquito-indemnizacion/",
        "utm_url": "https://monedario.cl/calculadoras/finiquito-indemnizacion/?utm_source=reddit&utm_medium=community&utm_campaign=chile&utm_content=despido-4-anos",
        "draft_text": """Es una decisión difícil, te entiendo. Antes de decidir, yo separaría dos cosas que se suelen mezclar: lo que te corresponde por ley y lo que es tu colchón.

Lo primero, el finiquito. La indemnización por años de servicio no siempre corre, depende de la causal con que te despidieron. Si corre, son 30 días de tu última remuneración por año, con tope de 11 años, y el año que no completaste también cuenta. Los errores típicos son la causal mal puesta y la base de cálculo mal armada, así que dale una vuelta a eso antes de firmar.

El seguro de cesantía tampoco es automático: si estabas en el CIC necesitas 10 cotizaciones, 3 de ellas seguidas; el Fondo Solidario tiene sus propias reglas.

Y lo del colchón: pásalo a meses de gastos, no a pesos. Si te da para 6 meses o más, tomarte un tiempo ya es una decisión financiera y no solo emocional.

Si te sirve, hice una calculadora de finiquito que va según la causal, gratis y sin registro:
https://monedario.cl/calculadoras/finiquito-indemnizacion/?utm_source=reddit&utm_medium=community&utm_campaign=chile&utm_content=despido-4-anos

Soy de Monedario.""",
    },
    {
        "permalink": "/r/chile/comments/1wnrnro/cómo_puedo_pasar_de_fonasa_a_a_otra_letra_mejor/",
        "batch": "Lote 1 · semana del 28-sep",
        "planned_week": "2026-09-28",
        "subreddit": "chile",
        "thread_title": "Cómo puedo pasar de Fonasa A a otra letra mejor?",
        "preflight": "Descartado 2026-09-25: ya respondido en el hilo (PREVIRED→B, tramos y letras)",
        "link_url": "https://monedario.cl/posts/fonasa-vs-isapre-comparativa/",
        "utm_url": "https://monedario.cl/posts/fonasa-vs-isapre-comparativa/?utm_source=reddit&utm_medium=community&utm_campaign=chile&utm_content=fonasa-tramos",
        "status": "descartado",
        "status_note": "Respuesta equivalente ya publicada por otros usuarios; no postear",
        "draft_text": """El tramo no se elige, se calcula con tu ingreso imponible y tus cargas. Con 3 o más cargas subes uno (por ejemplo, de D a C). Y ojo con una confusión bien común: desde 2022 existe Copago Cero en la red pública para todos los tramos, así que "letra mejor" no siempre significa pagar menos en el CESFAM o el hospital; lo que más pesa es si te atiendes en la red pública o compras bonos/Isapre. Los umbrales exactos se actualizan, así que confírmalos en fonasa.cl.

Si quieres comparar Fonasa vs Isapre con tu sueldo y cargas, dejé una guía con fuentes:
https://monedario.cl/posts/fonasa-vs-isapre-comparativa/?utm_source=reddit&utm_medium=community&utm_campaign=chile&utm_content=fonasa-tramos

Soy de Monedario.""",
    },
    {
        "permalink": "/r/FinanzasChile/comments/1wnbu97/tarjeta_de_crédito_a_los_18/",
        "batch": "Lote 1 · semana del 28-sep",
        "planned_week": "2026-09-28",
        "subreddit": "FinanzasChile",
        "thread_title": "tarjeta de crédito a los 18",
        "preflight": "Verificado 2026-09-25: abierto, sin respuesta equivalente (API solo-lectura)",
        "link_url": "https://monedario.cl/calculadoras/tarjeta-credito/",
        "utm_url": "https://monedario.cl/calculadoras/tarjeta-credito/?utm_source=reddit&utm_medium=community&utm_campaign=FinanzasChile&utm_content=tarjeta-18",
        "draft_text": """La trampa no es la tarjeta, es el pago mínimo. Desde junio de 2026 cambió el piso: como mínimo pagas el 100% de los intereses, comisiones y cargos (lo no financiable) más el 5% de lo financiable. Suena razonable, pero si te quedas ahí la deuda se estira años.

Lo que te recomiendo: usar la tarjeta como si fuera débito y pagar siempre el total. Si no llegas, paga harto más que el mínimo y no financies compras del día a día. Y cuando compares créditos, mira la CAE, no la tasa.

Si quieres ver cuánto se estira una deuda según lo que pagues al mes, hice una calculadora gratis y sin registro:
https://monedario.cl/calculadoras/tarjeta-credito/?utm_source=reddit&utm_medium=community&utm_campaign=FinanzasChile&utm_content=tarjeta-18

Soy de Monedario.""",
    },
    {
        "permalink": "/r/FinanzasChile/comments/1woqket/consulta_respecto_a_la_tarjeta_de_credito/",
        "batch": "Lote 2 · semana del 5-oct",
        "planned_week": "2026-10-05",
        "subreddit": "FinanzasChile",
        "thread_title": "Consulta respecto a la tarjeta de credito",
        "preflight": "Verificado 2026-09-25: abierto, sin respuesta equivalente (API solo-lectura)",
        "link_url": "https://monedario.cl/calculadoras/tarjeta-credito/",
        "utm_url": "https://monedario.cl/calculadoras/tarjeta-credito/?utm_source=reddit&utm_medium=community&utm_campaign=FinanzasChile&utm_content=pago-minimo-2026",
        "draft_text": """Tranqui, no es el fin del mundo, pero conviene tenerlo claro. Por el saldo que dejes te van a cobrar intereses, y si te acostumbras a pagar el mínimo se te arma una bola de nieve.

Algo que cambió hace poco: desde junio de 2026 el mínimo no lo pone el banco a su gusto, tiene un piso legal (CMF). Es el 100% de lo no financiable (intereses, comisiones y cargos) más el 5% de lo financiable. En simple: el mínimo se va primero en intereses y cargos, así que el capital baja lento igual. Si no llegas al total, paga todo lo que puedas por sobre el mínimo y no uses avance en efectivo. Y para comparar el costo real, mira la CAE, no la tasa.

Si quieres cachar cuántos meses te echarías pagando X al mes, hice una calculadora gratis y sin registro:
https://monedario.cl/calculadoras/tarjeta-credito/?utm_source=reddit&utm_medium=community&utm_campaign=FinanzasChile&utm_content=pago-minimo-2026

Soy de Monedario.""",
    },
    {
        "permalink": "/r/chile/comments/1wlv8a9/comprar_propiedad/",
        "batch": "Lote 2 · semana del 5-oct",
        "planned_week": "2026-10-05",
        "subreddit": "chile",
        "thread_title": "Comprar propiedad",
        "preflight": "Verificado 2026-09-25: abierto, sin respuesta equivalente (API solo-lectura)",
        "link_url": "https://monedario.cl/calculadoras/dividendo-hipotecario/",
        "utm_url": "https://monedario.cl/calculadoras/dividendo-hipotecario/?utm_source=reddit&utm_medium=community&utm_campaign=chile&utm_content=pie-10-vs-20",
        "draft_text": """Entiendo la ansiedad, es súper común que el dividendo asuste. Con 32-38M de pie estás en 10-12% del valor. Lo típico es que el banco financie hasta el 80% (pie ~20%); para el 90% con pie 10% necesitas garantía estatal tipo FOGAES. Y el otro número que miran: que el dividendo no pase del ~25% de la renta neta, con 5,1M eso es ~1,27M.

Acuérdate de que el dividendo está en UF, así que en pesos sube con la inflación aunque la cuota en UF no cambie. Corre los números con 10% y con 20% de pie, y con 25 vs 30 años: más pie y menos plazo bajan el total, aunque la cuota suba.

Si quieres simularlo con tus números, hice una calculadora de dividendo, gratis y sin registro:
https://monedario.cl/calculadoras/dividendo-hipotecario/?utm_source=reddit&utm_medium=community&utm_campaign=chile&utm_content=pie-10-vs-20

Soy de Monedario.""",
    },
    {
        "permalink": "/r/AskChile/comments/1wnf7j0/un_departamento_en_la_cisterna/",
        "batch": "Lote 2 · semana del 5-oct",
        "planned_week": "2026-10-05",
        "subreddit": "AskChile",
        "thread_title": "Un departamento en la cisterna?",
        "preflight": "Verificado 2026-09-25: abierto, sin respuesta equivalente (API solo-lectura)",
        "link_url": "https://monedario.cl/calculadoras/deposito-a-plazo/",
        "utm_url": "https://monedario.cl/calculadoras/deposito-a-plazo/?utm_source=reddit&utm_medium=community&utm_campaign=AskChile&utm_content=cisterna-yield",
        "draft_text": """Buena pregunta, y de las que casi nadie responde con números. Te la hago corta: 350 lucas x 12 son 4,2M al año, y sobre 2.900 UF (como 118,9M al valor de hoy) eso es un 3,5% bruto. De ahí tienes que descontar gastos comunes del dueño, contribuciones, mantención y los meses que esté vacío. El neto queda siempre bajo ese bruto.

La plusvalía no la cuentes como renta, no está garantizada. Compáralo con la alternativa aburrida: la misma plata en un depósito a plazo o algo reajustable en UF. Si el neto del arriendo no le gana por harta diferencia, no compensa el cacho de un solo activo y sin liquidez.

Si quieres comparar el otro lado (UF vs pesos), hice una calculadora gratis y sin registro:
https://monedario.cl/calculadoras/deposito-a-plazo/?utm_source=reddit&utm_medium=community&utm_campaign=AskChile&utm_content=cisterna-yield

Soy de Monedario.""",
    },
]

# --- Modmails y escaneo de wikis -------------------------------------------

_GENERIC_MODMAIL = """Hola, soy Carlos, mantengo monedario.cl, un sitio de calculadoras financieras chilenas con fuentes oficiales (SII, CMF, Banco Central), gratis y sin registro. Vi que tienen una lista de recursos en la wiki; ¿les tinca sumar alguna? Puede ser el conversor UTM/UF o la calculadora de sueldo líquido. Ustedes deciden qué les sirve y dónde. Gracias por mantener la comunidad."""

MODMAILS = [
    {
        "subreddit": "FinanzasChile",
        "subject": "¿Les sirve material para la wiki de recursos?",
        "body": """Hola, soy Carlos, mantengo monedario.cl, un sitio de calculadoras financieras chilenas (sueldo líquido, finiquito, UTM/UF, crédito hipotecario) con fuentes oficiales y sin registro.

Les escribo porque vi que tienen armada la sección de Recursos y Herramientas en la wiki, pero las páginas están vacías. Por si les sirve, tengo un par de calculadoras que podrían encajar en "simulaciones" (sueldo líquido y finiquito) y una guía de depósito a plazo vs UF para "dap_y_ahorro".

No es venta ni quiero spamear: se las dejo para que las revisen y decidan ustedes qué les sirve y dónde ponerlas. Si quieren, también les escribo dos líneas de explicación por cada una para la wiki.

Gracias por mantener la comunidad.
Carlos""",
        "wiki_targets": "index/recursos_y_herramientas (simulaciones, plataformas) · index/estrategias_y_guias (dap_y_ahorro, fondos_apv, inmobiliaria, impuestos)",
    },
    {
        "subreddit": "ChileInversiones",
        "subject": "Recursos para la wiki (calculadoras chilenas)",
        "body": _GENERIC_MODMAIL,
        "wiki_targets": "Revisar en navegador: old.reddit.com/r/ChileInversiones/wiki/index (el bot recibe 403)",
        "status_note": "Wiki cerrada al bot: revisar primero en el navegador",
    },
    {
        "subreddit": "AskChile",
        "subject": "Recursos para la wiki (calculadoras chilenas)",
        "body": _GENERIC_MODMAIL,
        "wiki_targets": "Revisar en navegador: old.reddit.com/r/AskChile/wiki/index (el bot recibe 403)",
        "status_note": "Wiki cerrada al bot: revisar primero en el navegador",
    },
    {
        "subreddit": "ChileStartup",
        "subject": "Recursos para la wiki (calculadoras chilenas)",
        "body": _GENERIC_MODMAIL,
        "wiki_targets": "Revisar en navegador: old.reddit.com/r/ChileStartup/wiki/index (el bot recibe 403)",
        "status_note": "Wiki cerrada al bot: revisar primero en el navegador",
    },
    {
        "subreddit": "chile",
        "subject": "",
        "body": "No enviar: la wiki de r/chile no tiene lista de recursos de finanzas y su regla permite autopromoción solo con aprobación previa.",
        "wiki_targets": "Sin página de recursos de finanzas",
        "status": "descartado",
        "status_note": "Sin objetivo. Si algún día hay hilo/lista pertinente, pedir aprobación previa a los mods",
    },
    {
        "subreddit": "RepublicadeChile",
        "subject": "",
        "body": "No enviar: la wiki solo tiene normas, sin lista de recursos.",
        "wiki_targets": "Sin página de recursos",
        "status": "descartado",
        "status_note": "Sin objetivo",
    },
    {
        "subreddit": "Santiago",
        "subject": "",
        "body": "No enviar: la wiki no tiene lista de recursos de finanzas.",
        "wiki_targets": "Sin página de recursos",
        "status": "descartado",
        "status_note": "Sin objetivo",
    },
    {
        "subreddit": "derechoenchile",
        "subject": "",
        "body": "No enviar: wiki legal (Central de Apuntes), fuera de tema.",
        "wiki_targets": "Fuera de tema",
        "status": "descartado",
        "status_note": "Fuera de tema",
    },
    {
        "subreddit": "ChileIT",
        "subject": "",
        "body": "No enviar: wiki de desarrollo, fuera de tema.",
        "wiki_targets": "Fuera de tema",
        "status": "descartado",
        "status_note": "Fuera de tema",
    },
    {
        "subreddit": "chile_autos",
        "subject": "",
        "body": "No enviar: wiki de autos, fuera de tema.",
        "wiki_targets": "Fuera de tema",
        "status": "descartado",
        "status_note": "Fuera de tema",
    },
]

WIKI_TARGETS = [
    {
        "subreddit": "FinanzasChile",
        "scan_status": "publica-sin-monedario",
        "index_url": "https://old.reddit.com/r/FinanzasChile/wiki/index",
        "target_pages": "Recursos y Herramientas (simulaciones, plataformas) · Estrategias y guías (dap_y_ahorro, fondos_apv, inmobiliaria, impuestos) — secciones vacías, sin links externos",
    },
    {
        "subreddit": "chile",
        "scan_status": "publica-sin-recursos",
        "index_url": "https://old.reddit.com/r/chile/wiki/index",
        "target_pages": "Sin lista de recursos de finanzas",
    },
    {
        "subreddit": "RepublicadeChile",
        "scan_status": "publica-sin-recursos",
        "index_url": "https://old.reddit.com/r/RepublicadeChile/wiki/index",
        "target_pages": "Wiki de normas, sin recursos",
    },
    {
        "subreddit": "Santiago",
        "scan_status": "publica-sin-recursos",
        "index_url": "https://old.reddit.com/r/Santiago/wiki/index",
        "target_pages": "Sin recursos de finanzas",
    },
    {
        "subreddit": "derechoenchile",
        "scan_status": "publica-fuera-de-tema",
        "index_url": "https://old.reddit.com/r/derechoenchile/wiki/index",
        "target_pages": "Central de Apuntes (legal)",
    },
    {
        "subreddit": "ChileIT",
        "scan_status": "publica-fuera-de-tema",
        "index_url": "https://old.reddit.com/r/ChileIT/wiki/index",
        "target_pages": "Wiki de desarrollo",
    },
    {
        "subreddit": "ChileInversiones",
        "scan_status": "cerrada-al-bot",
        "index_url": "https://old.reddit.com/r/ChileInversiones/wiki/index",
        "target_pages": "Revisar en navegador (API 403)",
    },
    {
        "subreddit": "AskChile",
        "scan_status": "cerrada-al-bot",
        "index_url": "https://old.reddit.com/r/AskChile/wiki/index",
        "target_pages": "Revisar en navegador (API 403)",
    },
    {
        "subreddit": "ChileStartup",
        "scan_status": "cerrada-al-bot",
        "index_url": "https://old.reddit.com/r/ChileStartup/wiki/index",
        "target_pages": "Revisar en navegador (API 403)",
    },
    {
        "subreddit": "chile_autos",
        "scan_status": "cerrada-al-bot",
        "index_url": "https://old.reddit.com/r/chile_autos/wiki/index",
        "target_pages": "Fuera de tema",
    },
]


def sync(conn, now_iso: str | None = None) -> dict[str, int]:
    """Upsert idempotente del contenido operativo. Preserva el estado humano:
    `status`, `status_note` y `published_at` solo se escriben en el INSERT
    inicial; `sent_at` nunca se pisa. Devuelve cuántas filas quedaron."""
    now = now_iso or datetime.now(tz=CHILE_TZ).isoformat()
    with conn:
        for d in SEED_DRAFTS:
            policy, policy_note = LINK_POLICY.get(d["subreddit"], ("link-permitido", None))
            no_link = d.get("draft_text_no_link")
            if no_link is None and policy != "link-permitido":
                no_link = sin_link(d["draft_text"])
            conn.execute(
                "INSERT INTO seed_drafts (permalink, batch, planned_week, subreddit, "
                "thread_title, draft_text, link_url, utm_url, preflight, link_policy, "
                "link_policy_note, draft_text_no_link, status, "
                "status_note, created_at, updated_at) "
                "VALUES (:permalink, :batch, :planned_week, :subreddit, :thread_title, "
                ":draft_text, :link_url, :utm_url, :preflight, :link_policy, "
                ":link_policy_note, :draft_text_no_link, :status, :status_note, "
                ":now, :now) "
                "ON CONFLICT(permalink) DO UPDATE SET batch=excluded.batch, "
                "planned_week=excluded.planned_week, subreddit=excluded.subreddit, "
                "thread_title=excluded.thread_title, draft_text=excluded.draft_text, "
                "link_url=excluded.link_url, utm_url=excluded.utm_url, "
                "preflight=excluded.preflight, link_policy=excluded.link_policy, "
                "link_policy_note=excluded.link_policy_note, "
                "draft_text_no_link=excluded.draft_text_no_link, "
                "updated_at=excluded.updated_at",
                {
                    "permalink": d["permalink"], "batch": d["batch"],
                    "planned_week": d.get("planned_week"), "subreddit": d["subreddit"],
                    "thread_title": d["thread_title"], "draft_text": d["draft_text"],
                    "link_url": d.get("link_url"), "utm_url": d.get("utm_url"),
                    "preflight": d.get("preflight"), "link_policy": policy,
                    "link_policy_note": policy_note, "draft_text_no_link": no_link,
                    "status": d.get("status", "listo"),
                    "status_note": d.get("status_note"), "now": now,
                },
            )
        for m in MODMAILS:
            conn.execute(
                "INSERT INTO modmail_drafts (subreddit, subject, body, wiki_targets, "
                "status, status_note, created_at, updated_at) "
                "VALUES (:subreddit, :subject, :body, :wiki_targets, :status, "
                ":status_note, :now, :now) "
                "ON CONFLICT(subreddit) DO UPDATE SET subject=excluded.subject, "
                "body=excluded.body, wiki_targets=excluded.wiki_targets, "
                "updated_at=excluded.updated_at",
                {
                    "subreddit": m["subreddit"], "subject": m["subject"], "body": m["body"],
                    "wiki_targets": m.get("wiki_targets"), "status": m.get("status", "borrador"),
                    "status_note": m.get("status_note"), "now": now,
                },
            )
        for w in WIKI_TARGETS:
            conn.execute(
                "INSERT INTO wiki_targets (subreddit, scan_status, index_url, "
                "target_pages, updated_at) VALUES (:subreddit, :scan_status, "
                ":index_url, :target_pages, :now) "
                "ON CONFLICT(subreddit) DO UPDATE SET scan_status=excluded.scan_status, "
                "index_url=excluded.index_url, target_pages=excluded.target_pages, "
                "updated_at=excluded.updated_at",
                {**w, "now": now},
            )
    return {
        "seed_drafts": len(SEED_DRAFTS),
        "modmails": len(MODMAILS),
        "wiki_targets": len(WIKI_TARGETS),
    }


def main() -> int:
    if len(sys.argv) != 2:
        print("Uso: python3 seed_content.py <directorio_con_reddit_monitor.db>", file=sys.stderr)
        return 2
    import db as dbmod

    db_path = Path(sys.argv[1]) / "reddit_monitor.db"
    conn = dbmod.connect(db_path)
    try:
        counts = sync(conn)
    finally:
        conn.close()
    print(f"[seed_content] OK en {db_path}: {counts}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
