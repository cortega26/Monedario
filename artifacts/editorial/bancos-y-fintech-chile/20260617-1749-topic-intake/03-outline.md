# 03-outline — Bancos y fintech en Chile (pilar educativo)

**Status: DRAFT — pending human editorial review**
**Role:** OutlineAgent
**Role-concentration note:** Este archivo lo produjo Claude actuando como OutlineAgent.
`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` exige separación de roles entre etapas. El
ResearchAgent (02-dossier) también fue Claude Code. Este defecto estructural se declara
aquí y se resuelve con el sign-off humano en `07-publish-packet.md`; los roles
adversariales (MathAudit / Compliance) deben ser instancias distintas.

---

## Article metadata

| Field | Value |
|-------|-------|
| Slug | `bancos-y-fintech-chile` (provisional) |
| Cluster | `bancos-fintech` (greenfield — owner canónico propuesto) |
| Hub parent | `/guias/bancos-fintech/` (aún NO existe — placement transitorio, documentar en `TOPIC_OWNERSHIP_POLICY.md`) |
| Category | `general` (provisional; revisar al crear taxonomía del cluster) |
| Word count target | 1,800–2,400 palabras |
| Schema targets | `FAQPage`, `Article` (y `HowTo` opcional para "cómo abrir una cuenta") |
| Primary query target | "qué banco o fintech me conviene en Chile" / "cómo abrir una cuenta básica" |
| YMYL risk | high · regulatory_sensitivity: media |
| Cut-off date | 2026-06-17 |

---

## Línea de diferenciación (localDelta — requerida por CONTRACT.EDITORIAL.OUTLINE)

> **Promesa al lector:** una guía **neutral** para entender qué tipo de cuenta te
> conviene y cómo abrirla, sin ranking patrocinado ni comparador de tarifas en vivo.
> Anclada en CMF Educa y la Ley 21.521 (Fintec), con cifras solo **ilustrativas y
> fechadas**. Frente a los comparadores comerciales (que empujan un producto), aquí
> el lector decide con criterios estables: tipo de cuenta, requisitos, costos
> conocidos y cómo verificar que una fintech esté regulada.

*No-copy boundaries vigentes (del brief):* no copiar tablas de tarifas ni rates
scrapeados; sin ranking con afiliados; cifras de comisiones solo como ejemplo fechado.

---

## Content structure

### [Respuesta rápida] ¿Qué cuenta me conviene para mi dinero del día a día?

*Purpose:* Cumple `CONTRACT.YMYL_RESPONSE_STRUCTURE`. Responde la intención dominante en ≤4 frases antes de cualquier detalle.

Structure:
- **Regla general:** Para recibir el sueldo y mover dinero diario, la cuenta básica a la que accede casi cualquier persona es una **cuenta vista** (como la CuentaRUT): no exige nivel de renta y no emite cheques. [C1, C2]
- **Excepciones:** Quien cumple los requisitos de renta puede optar a una **cuenta corriente** (permite cheques); para juntar dinero con metas, una **cuenta de ahorro** (giro con aviso). Las **fintech** ofrecen cuentas digitales/prepago bajo la Ley Fintec. [C3, C4, C8]
- **Vigencia:** Datos al 2026-06-17. Tarifas y productos cambian; verifica en la fuente oficial antes de contratar.
- **Fuentes:** CMF Educa, BancoEstado, Ley 21.521 (BCN).

---

### H2: ¿Qué tipos de cuenta existen en Chile?

*Source mapping:* 02-dossier C1–C5 (CMF Educa O1–O3).

Sub-sections:
- Cuenta vista (H3) — qué es, no emite cheques, a quién se ofrece (sin requisito de renta) [C1, C2]
- Cuenta corriente (H3) — contrato, acceso por cheque/cajero/débito/transferencia [C3]
- Cuenta de ahorro (H3) — giro diferido con aviso de 30 días corridos; hasta 30 UF a la vista [C4, C5]
- Tabla resumen de los tres tipos — **incluir etiqueta visible "resumen orientativo"** (requisito 4 del contrato YMYL)

*DraftAgent note:* Citar literal CMF Educa antes de glosar. La tabla compara características estables (no tarifas). Sin cifras de comisiones aquí.

---

### H2: Banco tradicional vs. fintech: ¿qué cambia para ti?

*Source mapping:* 02-dossier C8, C9, C10 (Ley 21.521, BCN O5).

Structure:
- Qué es una fintech, definición legal literal: "actividades que impliquen el uso y aplicación de la innovación y los desarrollos tecnológicos para el diseño, oferta y prestación de productos y servicios financieros" (Ley 21.521) [C9]
- Qué regula la Ley Fintec y desde cuándo (promulgada 04-ENE-2023, publicada 03-FEB-2023) [C8]
- **Finanzas abiertas (open banking)**, Título III de la ley: tus datos se comparten solo con tu consentimiento [C10]
- Encuadre neutral: no es "mejor banco o fintech", sino qué se ajusta a tu uso

*DraftAgent note:* Citar el artículo exacto del Título III antes de glosar open banking (Q2 del dossier — resolver en BCN al draft). Mantener neutralidad: sin recomendar marcas.

---

### H2: Cómo abrir una cuenta básica (caso CuentaRUT)

*Source mapping:* 02-dossier C6, C6b (BancoEstado O4).

Structure:
- Quién puede abrirla: desde los **12 años** (12–17 con representante legal); adultos con cédula vigente [C6]
- Apertura desde el extranjero: por web (firma de contrato pendiente en sucursal) o por App con cédula vigente, App activada en Chile y celular chileno [C6b]
- Pasos generales para abrir (HowTo)
- Bridge explícito al futuro pilar **finanzas para migrantes** (bancarización)

*DraftAgent note:* CuentaRUT se usa como caso concreto, no como recomendación de marca. Mencionar que otros bancos/fintech ofrecen cuentas vista/digitales equivalentes.

---

### H2: ¿Cuánto cuesta? Comisiones sin sorpresas

*Source mapping:* 02-dossier C7 (VERIFIED sin costo), C7b (TODO:SOURCE con cobro).

Structure:
- Qué transacciones suelen ser **sin costo** (ej. CuentaRUT: transferencias por App entre y hacia otros bancos, giros en cajeros propios, consultas de saldo) [C7]
- Dónde aparecen los cobros (transacciones internacionales, reposición por robo/extravío) — **cifras solo como ejemplo fechado** [C7b — resolver Q1]
- Cómo leer un tarifario antes de elegir
- **Etiqueta "resumen orientativo" + fecha** en cualquier cifra

*DraftAgent note:* Este es el punto de mayor volatilidad (alcance diferido de Gate 00). NO construir comparador en vivo. Toda cifra con `TODO:SOURCE` hasta verificar en tarifario oficial; ninguna cifra sin fecha en el blog file.

---

### H2: ¿Cómo sé si una fintech está regulada?

*Source mapping:* 02-dossier C10, C11 (Registro CMF O6).

Structure:
- El Registro de Prestadores de Servicios Financieros de la CMF es público [C11 — confirmar Q3]
- Cómo verificar una plataforma antes de entregarle datos o dinero
- Señal de alerta: operar sin inscripción

*DraftAgent note:* Enlazar a la ficha `laws/ley-21521-fintech.md` y al sitio CMF. Confirmar texto de sanción en CMF antes de afirmarlo.

---

### H2: Preguntas frecuentes

*Purpose:* FAQPage schema. 4–6 preguntas.

Planned FAQ items:
1. ¿Necesito tener un sueldo mínimo para abrir una cuenta? (cuenta vista no; corriente sí)
2. ¿Puede un extranjero abrir una cuenta en Chile? (sí, con cédula vigente; ver caso CuentaRUT)
3. ¿Es seguro tener mi dinero en una fintech? (depende de si está inscrita en la CMF)
4. ¿Qué pasa con mis datos en open banking? (se comparten solo con tu consentimiento)
5. ¿Cuál es la diferencia entre cuenta vista y cuenta de ahorro? (uso diario vs. juntar dinero con aviso de giro)

*DraftAgent note:* Cada respuesta ≤100 palabras, directa, con fuente (CMF/BancoEstado/Ley 21.521). Nada de "consulta a un asesor" como respuesta primaria.

---

### Footer: Información vigente al 2026-06-17

*Purpose:* Cumple `INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`.

- Información verificada al [cut-off date]
- Fuentes primarias: CMF Educa (cmfchile.cl), BancoEstado (bancoestado.cl), Ley 21.521 (bcn.cl)
- Tarifas y productos cambian; verifica directamente antes de contratar
- Última revisión: [el editor humano completa al publicar]

---

## Internal links plan

| From section | Target | Anchor text | Relationship |
|-------------|--------|-------------|-------------|
| Banco vs. fintech | `/leyes/ley-21521-fintech/` | "Ley Fintech (21.521)" | Reference (ficha de ley) |
| Cómo abrir cuenta | `/glosario/cuenta-rut/` | "CuentaRUT" | Glossary |
| Respuesta rápida | `/guias/sueldo-remuneraciones/` | "dónde recibir tu sueldo" | Related (cluster vecino) |
| Tipos de cuenta | `/guias/ahorro-e-inversion/` | "ahorrar e invertir" | Related |
| Comisiones | `/guias/deuda-credito/` | "costo del crédito" | Related |
| Respuesta rápida | `/guias/presupuesto-control-financiero/` | "ordenar tu presupuesto" | Related |
| Cómo abrir cuenta | (futuro pilar migrantes) | "finanzas para migrantes" | Bridge (cuando exista) |

*Nota:* Confirmar rutas reales de hubs antes del draft; usar solo enlaces a páginas existentes (los hubs de cluster pueden no existir aún → no inventar URLs).

---

## Excluded topics (fuera de alcance de este artículo)

| Topic | Why excluded |
|-------|-------------|
| Comparador de tarifas/productos **en vivo** | Diferido por Gate 00 (volatilidad + neutralidad/monetización sin resolver) |
| Ranking de "mejor banco/fintech" | `nonCopyBoundaries`: sin ranking patrocinado ni recomendación de marca |
| Productos de inversión (fondos, APV, ETFs) | Owned por `ahorro-e-inversion`; aquí solo bridge `related` |
| Criptoactivos / tokens en profundidad | Tema propio; aquí solo mención dentro de la Ley Fintec |
| Cuentas para empresas / microempresas | Este pilar es para personas |
| Crédito y tarjetas de crédito | Owned por `deuda-credito`; solo bridge `related` |

---

next_step: 04-draft.md (DraftAgent — instancia distinta) tras resolver Q1–Q3 del dossier. Recordatorio: ningún blog file puede contener `TODO:SOURCE`; resolver o diferir legítimamente cada cifra antes de publicar.
