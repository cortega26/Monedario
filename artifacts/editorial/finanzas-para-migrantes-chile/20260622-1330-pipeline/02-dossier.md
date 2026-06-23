# 02-dossier.md — finanzas para migrantes en Chile

**Status:** DRAFT — pending ComplianceAgent review (sesión fresca)
**Role:** ResearchAgent — Claude Sonnet 4.6 (sesión 2026-06-22)
**Fecha de corte:** 2026-06-22
**Slug:** finanzas-para-migrantes-chile (provisional)
**Brief:** `01-brief.yaml` (mismo run)

**Nota de rol:** ResearchAgent ejecutado por la misma sesión que producirá 03-outline y
04-draft. Defecto de SoD declarado; Gate 06 (Compliance) debe ejecutarse en sesión fresca.

**Método de recuperación:** WebFetch + Scrapling 0.4.7. Varios endpoints bloqueados
(SII, Registro Civil, ChileAtiende retornan 404 o solo navegación JS). Se documenta
el intento de cada fuente.

**Addendum de investigación aplicado 2026-06-22:** Carlos Ortega (HumanEditor) proporcionó
`source-research-addendum-c1-c6-20260622.md` con fuentes oficiales para C1, C1b, C4, C5 y
C6, y URLs profundas para C2/C3. Los claims C1, C1b, C4, C5, C6 se actualizan a los estados
canónicos indicados en el addendum. Proveniencia: investigación externa al run, autorizada por
HumanEditor. No se invoca un segundo ResearchAgent (SoD declarado en el dossier original).

---

## Official Sources

| # | Fuente | URL intentada | Recuperada | Estado de fetch |
|---|---|---|---|---|
| O1 | BancoEstado — FAQ CuentaRUT (extranjero, menor de edad, costos) | https://www.bancoestado.cl/.../centro-de-ayuda/.../cuentarut.html | 2026-06-17 (carryover del run bancos) | OK — Scrapling Fetcher (ver dossier bancos, C6b) |
| O2 | SII — RUT para extranjeros (personas naturales) | https://www.sii.cl/preguntas_frecuentes/rut/001_017_0003.htm | 2026-06-22 | **FALLO (404)** |
| O3 | SII — página principal de RUT | https://www.sii.cl/sobre_el_sii/rut.html | 2026-06-22 | Parcial (8K chars, solo navegación) |
| O4 | Registro Civil — cédula de identidad para extranjeros | https://www.registrocivil.cl/principal/site/artic/20150521/pags/20150521165831.html | 2026-06-22 | **FALLO (404 + CAPTCHA)** |
| O5 | ChileAtiende — RUT para extranjeros | https://www.chileatiende.gob.cl/fichas/1482-rut-para-extranjeros | 2026-06-22 | **FALLO (404)** |
| O6 | CMF Educa — Cuenta a la Vista | https://www.cmfchile.cl/educa/621/w3-article-27449.html | 2026-06-22 | OK (WebFetch) — no contiene info específica extranjeros |
| O7 | Servicio de Migraciones (SERMIG) | https://www.serviciomigraciones.cl/ | 2026-06-22 | OK (WebFetch) — página principal sin fichas de RUT/bancarización |
| O8 | BancoEstado — CuentaRUT (carryover run bancos, O4 previo) | ver dossier bancos-y-fintech-chile/02-dossier.md | 2026-06-17 | VERIFIED (C6b del run anterior) |
| O9 | SII — Obtención de RUT (ciclo de vida) | https://www.sii.cl/destacados/educacion/ciclo_vida_contribuyente/paso_01.html | 2026-06-22 addendum | HTTP 200, JS-renderizado; fuente addendum humano |
| O10 | SII — Documentos para inscribirse en el RUT (actualizado 28-05-2026) | https://www.sii.cl/preguntas_frecuentes/rut_inicio_actividades/001_105_0135.htm | 2026-06-22 addendum | HTTP no verificado; fuente addendum humano |
| O11 | SII — RUT para personas extranjeras | https://www.sii.cl/contribuyentes/contribuyentes_individuales/chilenos_extranjero/rol_unico_tributario.htm | 2026-06-22 addendum | fuente addendum humano; indica que turistas pueden usar pasaporte en contratos privados de arriendo |
| O12 | ChileAtiende — Cédula de identidad para extranjeros | https://www.chileatiende.gob.cl/fichas/3337 | 2026-06-22 addendum | fuente addendum humano |
| O13 | BCN — Ley N° 18.101 arrendamientos urbanos | https://www.bcn.cl/leychile/navegar?idNorma=29526 | 2026-06-22 addendum | fuente addendum humano; no establece requisito de nacionalidad para arrendatario |
| O14 | BCN — Ley N° 21.461 (restitución y cobro) | https://www.bcn.cl/leychile/Navegar?idNorma=1178004 | 2026-06-22 addendum | fuente addendum humano; modifica restitución/cobro, no acceso para extranjeros |
| O14b | BCN — Ley N° 20.609 (no discriminación) | https://www.bcn.cl/leychile/navegar?idNorma=1042092 | 2026-06-22 addendum | fuente addendum humano; art. 2 incluye nacionalidad como criterio prohibido, incluso por particulares |
| O15 | DT — Registro de trabajador migrante sin RUT del Registro Civil | https://www.dt.gob.cl/portal/1628/w3-article-119155.html | 2026-06-22 addendum | fuente addendum humano; permite registro con pasaporte o DNI extranjero |
| O16 | SP — Los migrantes y el sistema de pensiones | https://www.spensiones.cl/portal/institucional/594/w3-article-12267.html | 2026-06-22 addendum | fuente addendum humano; permite cotización con identificación provisoria |
| O17 | BancoEstado — CuentaRUT (URL profunda) | https://start.bancoestado.cl/content/bancoestado-public/cl/es/home/home/productos-/cuentas/cuentarut.html | 2026-06-22 | HTTP 200, JS-renderizado; fuente addendum humano |
| O18 | ChileAtiende — CuentaRUT BancoEstado | https://www.chileatiende.gob.cl/fichas/70638-cuenta-rut-bancoestad | 2026-06-22 | HTTP 200, JS-renderizado; fuente addendum humano; confirma requisitos y edad mínima |
| O19 | Santander — Cuenta Más Lucas | https://banco.santander.cl/personas/planes/cuenta-mas-lucas/ | 2026-06-22 addendum | fuente addendum humano; requiere cédula + evaluación comercial; no garantiza elegibilidad para todo extranjero |
| O20 | BCI — Cuenta Digital preguntas frecuentes | https://www.bci.cl/personas/abrir-cuenta-corriente/cuenta-digital/preguntas-frecuentes | 2026-06-22 addendum | fuente addendum humano; requiere cédula + ingresos + evaluación |
| O21 | Tenpo — Cómo abrir una cuenta | https://www.tenpo.cl/como-abrir-tu-cuenta | 2026-06-22 addendum | fuente addendum humano; requiere RUT + cédula chilena vigente y física |
| O22 | ChileAtiende — Certificados Fonasa | https://www.chileatiende.gob.cl/fichas/5241 | 2026-06-22 addendum | fuente addendum humano; admite trámites con RUT provisorio y pasaporte |

**Nota de acceso:** Los portales SII, Registro Civil y ChileAtiende actualizaron sus URLs
entre 2024 y 2026, dejando las URLs indexadas en motores de búsqueda en 404. Las páginas
actuales requieren navegación desde la portada o búsqueda interna. Impacto inicial: C1
(RUT) y C4 (arriendo) quedaron TODO:SOURCE en el run original. Claims actualizados mediante
addendum humano 2026-06-22.

---

## Claims Catalogue

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C1 | **RUT para extranjeros — dos vías según estatus:** (a) Con residencia y cédula de identidad para extranjeros: el SII registra automáticamente a la persona con su RUN; no debe solicitar un RUT adicional. (b) Sin residencia y con obligaciones tributarias en Chile: puede solicitar inscripción en el RUT por internet en sii.cl; los documentos exigidos dependen del tipo de obligación y del solicitante. El trámite presencial en oficina no es la vía general. | O9, O10, O11 (SII) | **VERIFIED — REFORMULADO** (2026-06-22, addendum humano) | Corrección respecto del claim original: el SII no exige trámite presencial como regla general para no residentes; la vía online es la indicada. Residentes con cédula no necesitan RUT separado. |
| C1b | **RUN como identificación tributaria:** la cédula de identidad para extranjeros contiene un RUN. El SII registra automáticamente con ese número a las personas extranjeras residentes para efectos tributarios; no es necesario tramitar un segundo RUT. | O12 (ChileAtiende), O9 (SII) | **VERIFIED — REFORMULADO** (2026-06-22, addendum humano) | Retira "equivale al RUT para todos los efectos" sin límites: el respaldo es el registro tributario automático del SII, no una equivalencia universal. |
| C2 | **CuentaRUT para extranjeros:** BancoEstado permite abrir CuentaRUT con cédula de identidad vigente (incluye cédula de extranjero); apertura por App (cédula + app activada en Chile + celular chileno) o web (firma presencial en sucursal); tarjeta física se entrega solo en territorio nacional. | O17 (BancoEstado profundo), O18 (ChileAtiende), O1/O8 (carryover) | **VERIFIED** (2026-06-17 base; URLs profundas addendum 2026-06-22) | O17: https://start.bancoestado.cl/…/cuentarut.html (HTTP 200, JS-renderizado). O18: https://www.chileatiende.gob.cl/fichas/70638-cuenta-rut-bancoestad (HTTP 200, JS-renderizado). Ambas confirman la existencia de la página; texto base carryover de O8. |
| C3 | **Edad mínima CuentaRUT:** 12 años con representante legal o vía App si el padre/madre es cliente; adultos directamente. | O17, O18 | **VERIFIED** (2026-06-17 base; addendum 2026-06-22) | O18 (ChileAtiende) confirma edad mínima e intervención de representante legal para menores de 18. |
| C4 | **Arriendo siendo extranjero:** La Ley N° 18.101 (arrendamientos urbanos) no establece requisito general de nacionalidad para el arrendatario. El SII indica que turistas extranjeros pueden figurar en contratos privados de arriendo con pasaporte o documento extranjero, sin RUT. La Ley N° 21.461 modificó procedimientos de restitución y cobro derivados del arriendo; no establece requisitos especiales de acceso para personas extranjeras. La Ley N° 20.609 prohíbe la discriminación arbitraria basada en nacionalidad, incluso por particulares. Las prácticas de garantías adicionales como "costumbre habitual del mercado" no tienen respaldo en fuente oficial. | O13 (BCN Ley 18.101), O14 (BCN Ley 21.461), O14b (BCN Ley 20.609), O11 (SII turistas) | **PARTIAL VERIFIED** (2026-06-22, addendum humano) | Marco legal verificado. La "práctica habitual de mercado" de garantías adicionales no tiene respaldo oficial: debe retirarse del draft o identificarse como observación no normativa. |
| C5 | **Otros bancos y fintech para extranjeros:** BancoEstado acepta expresamente extranjeros con cédula vigente (O17/O18). Santander (Cuenta Más Lucas) y BCI (Cuenta Digital) publican requisitos de cédula vigente y evaluación comercial; sus páginas no garantizan elegibilidad para toda persona extranjera. Tenpo requiere RUT, cédula chilena vigente y física. | O17, O18, O19 (Santander), O20 (BCI), O21 (Tenpo) | **VERIFIED AS LIMITED** (2026-06-22, addendum humano) | No afirmar que toda persona extranjera califica cuando existe evaluación comercial. Tenpo requiere cédula chilena física — requisito bloqueante para quien aún no tiene cédula de extranjero. |
| C6 | **Impacto de no tener cédula/RUN definitivo:** No tener cédula o RUN definitivo no impide por sí solo firmar contrato laboral ni cotizar: la DT permite registrar trabajadores migrantes con pasaporte cuando aún no tienen RUT del Registro Civil; la SP permite cotizar en AFP con identificación provisoria; Fonasa admite trámites con RUT provisorio y pasaporte. Sin embargo, CuentaRUT exige cédula de identidad vigente (un RUT tributario SII provisional no es sustituto). La autorización para trabajar depende del permiso migratorio correspondiente. | O15 (DT), O16 (SP), O22 (Fonasa/ChileAtiende), O17/O18 (BancoEstado) | **CORRECTED** (2026-06-22, addendum humano) | **ERROR en claim original:** afirmaba que sin RUT no es posible firmar contrato laboral ni cotizar — contradecido por DT, SP y Fonasa. CuentaRUT sí requiere cédula; RUT SII provisional no es sustituto. |

---

## Benchmark Observations (no autoritativas)

- B1: Los artículos de mayor utilidad para migrantes combinan mapa de documentos requeridos
  según tipo de permiso + pasos concretos para cada trámite + vigencia explícita.
- B2: La mayoría de contenidos existentes mezcla estatus migratorio (visados) con trámites
  financieros; el valor diferencial de este pilar es mantenerlos separados.
- B3: Consultas frecuentes asociadas: "cómo sacar RUT sin residencia definitiva",
  "puede extranjero abrir cuenta en Chile", "arrendar departamento siendo extranjero".

---

## Source Trust / Prompt Injection Notes

- Ningún intento de fetch retornó contenido sospechoso. Las páginas con 404 simplemente
  no cargaron contenido.
- No se detectaron instrucciones incrustadas.

---

## Open Research Questions

| # | Pregunta | Estado | Camino oficial |
|---|---|---|---|
| Q1 | Proceso exacto de RUT para extranjeros en SII (documentos, costo, presencialidad) | **CERRADO** (addendum 2026-06-22) | Residentes con cédula: SII auto-registra, no se solicita RUT. No residentes: inscripción online en sii.cl; documentos según tipo de obligación. |
| Q2 | Proceso de cédula de identidad de extranjero (Registro Civil) y su relación con RUT definitivo | **CERRADO** (addendum 2026-06-22) | Cédula de extranjero incluye RUN; SII registra automáticamente con ese número. |
| Q3 | Condiciones de arriendo para extranjeros sin historial: ¿hay restricción legal o es discrecional del propietario? | **CERRADO** (addendum 2026-06-22) | Marco legal verificado: sin requisito de nacionalidad en Ley 18.101; Ley 20.609 prohíbe discriminación arbitraria. Garantías adicionales como práctica de mercado no tienen fuente oficial. |
| Q4 | Cuentas fintech para extranjeros: MACH, Tenpo, otras — ¿requieren cédula de extranjero o aceptan pasaporte? | **CERRADO PARCIAL** (addendum 2026-06-22) | Tenpo: cédula chilena vigente física + RUT. Santander/BCI: cédula + evaluación. MACH: no verificado por addendum. |

---

## Implicaciones para el draft

1. **C1/C1b (RUT):** VERIFIED-REFORMULADO. El draft debe distinguir las dos vías: (a) con residencia
   y cédula → el SII auto-registra con RUN, no se solicita RUT adicional; (b) sin residencia →
   inscripción en RUT por internet en sii.cl. Retirar la instrucción de "acudir a oficina con pasaporte".
2. **C2/C3 (CuentaRUT):** VERIFIED con URLs profundas. Citar O17 y O18 en el draft.
3. **C4 (arriendo):** PARTIAL VERIFIED. Puede citarse el marco legal (Ley 18.101 sin requisito
   de nacionalidad, Ley 20.609 prohibición de discriminación). No afirmar garantías adicionales
   como "práctica habitual de mercado" — esto no tiene respaldo oficial.
4. **C5 (otros bancos):** VERIFIED AS LIMITED. Distinguir BancoEstado (explícita para extranjeros),
   bancos con evaluación (Santander, BCI — sin garantía de elegibilidad), y Tenpo (cédula chilena física).
5. **C6 (sin cédula):** CORRECTED. El draft debe reflejar que contratos laborales y AFP son posibles
   con pasaporte/identificación provisoria (DT, SP), pero CuentaRUT requiere cédula vigente.
