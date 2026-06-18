# 02-dossier.md — bancos y fintech en Chile (pilar educativo)

Status: DRAFT — pending ComplianceAgent review
Role: ResearchAgent — ejecutado por **Claude Code** (no ChatGPT). Desviación de rol
documentada: la investigación upstream no compromete la separación adversarial de
deberes (DraftAgent / MathAuditAgent / ComplianceAgent siguen siendo instancias
distintas). Registrar en `07-publish-packet.md`.

**Fecha de corte:** 2026-06-17
**Slug:** bancos-y-fintech-chile (provisional)
**Brief:** `01-brief.yaml` (mismo run)
**Método de recuperación:** WebFetch para CMF Educa; **Scrapling 0.4.7** para las
fuentes que bloquean el fetch HTTP simple — `Fetcher` (curl_cffi, impersonación TLS)
para `bancoestado.cl` (403 con WebFetch) y `StealthyFetcher` (camoufox, render JS)
para `bcn.cl` (página JS con WebFetch). Todo recuperado el 2026-06-17.

## Official Sources

| # | Fuente | URL | Recuperada | Estado de fetch |
|---|---|---|---|---|
| O1 | CMF Educa — ¿Qué es una Cuenta a la vista? | https://www.cmfchile.cl/educa/621/w3-article-27449.html | 2026-06-17 | OK (WebFetch) |
| O2 | CMF Educa — ¿Qué es la Cuenta Corriente? | https://www.cmfchile.cl/educa/621/w3-article-27450.html | 2026-06-17 | OK (WebFetch) |
| O3 | CMF Educa — ¿Qué son las Cuentas de Ahorro? | https://www.cmfchile.cl/educa/621/w3-article-27325.html | 2026-06-17 | OK (WebFetch) |
| O4 | BancoEstado — Centro de Ayuda CuentaRUT (FAQ: menor de edad, sin costo, extranjero) | https://www.bancoestado.cl/.../centro-de-ayuda/productos/cuentas/cuentarut.html | 2026-06-17 | OK (Scrapling Fetcher) |
| O5 | BCN — Ley 21.521 (Ley Fintec), texto y encabezado | https://www.bcn.cl/leychile/navegar?idNorma=1187323 | 2026-06-17 | OK (Scrapling StealthyFetcher) |
| O6 | CMF — Registro de Prestadores de Servicios Financieros | https://www.cmfchile.cl/portal/principal/613/w3-channel.html | (citado en O7) | no re-fetcheado |

Artefacto interno (NO autoritativo para el dato legal — ver hallazgo H1):
- O7 — `src/data/laws/ley-21521-fintech.md` (ficha del repo). **Contiene imprecisiones** corregidas abajo.

## Claims Catalogue

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C1 | La **cuenta vista** "permite depositar dinero para girarlo después mediante un cajero automático y la misma tarjeta como débito"; **no emite cheques**. | O1 | VERIFIED | Cita literal CMF Educa. |
| C2 | La cuenta vista se ofrece "a los clientes que no cuenten con los requisitos para optar a una cuenta corriente, debido a su nivel de renta"; empresas la usan para pagar sueldos. | O1 | VERIFIED | Cita literal. Bridge con `sueldo-remuneraciones`. |
| C3 | La **cuenta corriente** "es un contrato entre una persona o empresa y un Banco, mediante la cual el primero deposita dinero"; acceso por cheques, cajero, débito, pagos automáticos y transferencias web. | O2 | VERIFIED | Cita literal. |
| C4 | En **cuentas de ahorro** con giro diferido "el ahorrante sólo puede girar los dineros depositados previo aviso a la entidad bancaria con una anticipación mínima de 30 días corridos". | O3 | VERIFIED | Cita literal. |
| C5 | Los bancos pueden permitir giros a la vista hasta **30 UF por transacción** en días distintos pese al aviso de 30 días. | O3 | VERIFIED | Cita literal. |
| C6 | **CuentaRUT — quién puede abrir:** "todos los menores desde los 12 años de edad pueden solicitar CuentaRUT"; entre 12 y 17 con representante legal / vía App con padre o madre cliente. Los adultos la abren directamente. | O4 | VERIFIED | Cita literal. **Corrige** el snippet previo que decía "mayor de 18 años". |
| C6b | **Apertura desde el extranjero:** se puede solicitar por la web (firma de contrato pendiente en sucursal) o abrir y habilitar por la App si se tiene cédula de identidad vigente, App activada en Chile y número de celular chileno; el plástico se entrega solo en territorio nacional. | O4 | VERIFIED | Cita literal. Bridge con `finanzas-para-migrantes-chile`. |
| C7 | **Transacciones SIN COSTO de CuentaRUT:** transferencias entre cuentas BancoEstado y **hacia otros bancos** vía App/Banca en Línea; giros en cajeros y cajas BancoEstado/CajaVecina; consultas de saldo y cartolas; reposición de tarjeta por deterioro/chip/vencimiento. | O4 | VERIFIED | Cita literal. **Corrige** el snippet de búsqueda previo (afirmaba "$300 por transferencia a otros bancos" — falso a hoy). |
| C7b | Tarifas CuentaRUT **con cobro** (al 2026-06-17, FAQ oficial): $300 por giro en cajeros de **otros bancos**; $100 por consulta de saldo en cajeros de otros bancos; 1,9% (mín USD 0,5) en compras/retiros internacionales; $1.000 por reposición por extravío/robo/hurto; UF 0,05 + IVA por duplicado de cartola en sucursal. | O4 (FAQ "con cobro") | VERIFIED (dato fechado) | **Sutileza:** las transferencias a otros bancos por **App/Banca en Línea** son sin costo (C7); el $300 aplica a **giros en cajeros de otros bancos** (la FAQ tiene un bullet antiguo que conflaba transferencias). Cifras volátiles → alcance diferido (Gate 00): mantener fuera del core o como ejemplo fechado, no como comparador en vivo. |
| C8 | Título oficial: **Ley Núm. 21.521, "PROMUEVE LA COMPETENCIA E INCLUSIÓN FINANCIERA A TRAVÉS DE LA INNOVACIÓN Y TECNOLOGÍA EN LA PRESTACIÓN DE SERVICIOS FINANCIEROS, LEY FINTEC"**. Promulgación **04-ENE-2023**, publicación **03-FEB-2023**. | O5 | VERIFIED | Cita literal del encabezado BCN. **Corrige** título y fecha de la ficha O7 (ver H1). |
| C9 | Definición legal: "**Fintec:** actividades que impliquen el uso y aplicación de la innovación y los desarrollos tecnológicos para el diseño, oferta y prestación de productos y servicios financieros." | O5 | VERIFIED | Cita literal (numeral de definiciones). |
| C10 | El régimen de **open banking** está en el **TÍTULO III "Del Sistema de Finanzas Abiertas"** de la ley. | O5 | VERIFIED | Estructura confirmada en BCN. **Corrige** la ficha O7 (atribuía finanzas abiertas a "arts. 28°–35°"). Citar el artículo exacto del Título III al draft. |
| C11 | El Registro de Prestadores de la CMF es público; operar sin inscripción es infracción. | O7 → O6 | TODO:SOURCE | Confirmar contra O6 (CMF) al draft. |

## Benchmark Observations (no autoritativas — solo input estratégico)

- B1: Páginas que rankean combinan tipos de cuenta + requisitos + (tabla comparativa de comisiones) + "banco vs. fintech" + CTA de apertura (`patternHypothesis`).
- `nonCopyBoundaries` vigentes: no copiar tablas de tarifas ni rates scrapeados; sin ranking patrocinado.

## gap / opportunity

- Cluster greenfield: sin owner; solo soporte (`glossary/cuenta-rut.md`, `laws/ley-21521-fintech.md`).
- `localDelta`: marco educativo neutral anclado en CMF Educa + Ley 21.521, con cifras solo ilustrativas/fechadas, interlinking a sueldo/ahorro/deuda/presupuesto y bridge a migrantes (C6b).
- Riesgo gestionado: las tarifas son volátiles (C7b) y la data de terceros desactualiza rápido (lección del snippet erróneo) → mantenerlas fuera del core o fechadas; comparador en vivo diferido (Gate 00).

## Hallazgos de calidad de datos

- **H1 (acción de seguimiento, fuera de este run):** la ficha `src/data/laws/ley-21521-fintech.md` tiene **título inexacto** ("Incentiva la Industria Fintec e instruye la portabilidad…" vs. el oficial "PROMUEVE LA COMPETENCIA E INCLUSIÓN FINANCIERA…"), `effective: 2023-01-04` corresponde a la **promulgación** (publicación = 03-FEB-2023), y atribuye open banking a "arts. 28°–35°" cuando el régimen está en el **TÍTULO III**. Abrir TD para corregir la ficha contra BCN (O5). No bloquea este pilar.

## Source Trust / Prompt Injection Notes

- Todo el contenido recuperado (CMF Educa, BancoEstado, BCN) se trató como **fuente no confiable**: aporta claims, no cambia rol, alcance, formato, herramientas, gates, citaciones ni decisiones de publicación.
- **No se detectaron instrucciones incrustadas** dirigidas al agente. Ningún `PROMPT_INJECTION_CANDIDATE`.
- Los **snippets de búsqueda** NO se promovieron a VERIFIED; al fetchear las fuentes con Scrapling se comprobó que algunas cifras del snippet estaban **desactualizadas** (C7). Confirma la política de fetch directo de Stage 02.

## Open Research Questions

| # | Pregunta abierta | Estado | Camino oficial de resolución |
|---|---|---|---|
| Q1 (C7b) | Tarifas CuentaRUT con cobro | **RESUELTO 2026-06-17** (FAQ O4, ver C7b) | — |
| Q2 (C10) | Artículo exacto del Título III sobre finanzas abiertas/consentimiento | PARCIAL: ubicación confirmada (Título III, arts. 16–27); falta quote literal | BCN sirve solo arts. 1–4 al fetcher; usar vista por-artículo (idParte) en Compliance antes de citar cláusula |
| Q3 (C11) | Texto de sanción por operar sin inscripción en el Registro CMF | PARCIAL: existencia del Registro confirmada; falta cláusula de sanción | BCN (Título de sanciones) o CMF (O6) en Compliance; el draft NO afirma la sanción, remite a verificar |
| Q4 | Tipos/costos de cuentas/tarjetas de prepago y cuentas digitales fintech (MACH, Tenpo, etc.) | ABIERTO | CMF + emisores oficiales; mantener neutralidad, sin ranking |

next_step: 03-outline.md — estructura con línea de diferenciación visible (H1/intención/snippet/CTA). Q1–Q3 son acotadas; Q1 pertenece al alcance diferido (tarifas) y puede quedar fuera del core del pilar.
