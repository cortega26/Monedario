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

**Nota de acceso:** Los portales SII, Registro Civil y ChileAtiende actualizaron sus URLs
entre 2024 y 2026, dejando las URLs indexadas en motores de búsqueda en 404. Las páginas
actuales requieren navegación desde la portada o búsqueda interna. Impacto: los claims C1
(RUT) y C4 (arriendo) quedan TODO:SOURCE. El claim C2 (CuentaRUT) está VERIFIED vía
carryover de run bancos.

---

## Claims Catalogue

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C1 | **RUT provisorio para extranjeros:** el SII asigna RUT a personas extranjeras que necesitan realizar actividades económicas o tributarias en Chile aunque no tengan cédula de identidad chilena; se puede solicitar en cualquier oficina del SII con pasaporte o cédula del país de origen + visa o permiso vigente. | O3 (SII) | **TODO:SOURCE** | No pudo verificarse vía fetch; la página SII retornó solo menú de navegación. Verificar en https://www.sii.cl → "RUT y Cédula de RUT → Extranjeros". |
| C1b | **RUT definitivo (= RUN):** los extranjeros con residencia definitiva que obtienen cédula de identidad de extranjero (Registro Civil) quedan con un RUN que equivale al RUT para todos los efectos. | O4 (Registro Civil) | **TODO:SOURCE** | Fetch fallido (404 + CAPTCHA). Verificar en https://www.registrocivil.cl → "Cédula de identidad para extranjeros". |
| C2 | **CuentaRUT para extranjeros:** BancoEstado permite abrir CuentaRUT con cédula de identidad vigente (incluye cédula de extranjero); se puede iniciar por la web (firma de contrato pendiente en sucursal) o abrir y habilitar por la App si el cliente tiene la app activada en Chile y número de celular chileno; el plástico se entrega solo en territorio nacional. | O1 / O8 (BancoEstado FAQ, carryover) | **VERIFIED** (2026-06-17) | Cita literal del FAQ de BancoEstado (C6b del dossier bancos). Sin cambios conocidos entre 2026-06-17 y 2026-06-22. |
| C3 | **Edad mínima CuentaRUT:** 12 años con representante legal o vía App si el padre/madre es cliente; adultos directamente. | O1 / O8 | **VERIFIED** (2026-06-17) | C6 del dossier bancos. |
| C4 | **Arriendo siendo extranjero:** los propietarios pueden exigir garantías adicionales (meses de garantía, codeudor solidario, seguro de arriendo) cuando el arrendatario carece de historial crediticio local; no existe una ley que prohíba arrendar a extranjeros. La Ley 21.461 ("Devuélveme mi casa", 2022) regula el proceso de recuperación de propiedades pero aplica por igual a nacionales y extranjeros. | Ley 21.461 (BCN) | **TODO:SOURCE parcial** | Existencia y contenido general de Ley 21.461 verificable en BCN; afirmación sobre "no prohibición" es principio legal general no fetcheado específicamente. Verificar: ¿hay disposición que limite o prohíba explícitamente arrendar a personas sin RUT chileno? |
| C5 | **Otros bancos para extranjeros:** varios bancos (Banco de Chile, Santander, BCI, Banco Falabella) abren cuentas a extranjeros con cédula de identidad vigente, aunque algunos exigen ciertos tipos de visa o período de residencia. Las cuentas fintech (MACH, Tenpo) requieren también cédula de identidad de extranjero. | CMF / bancos | **TODO:SOURCE** | No pudo verificarse; los portales de bancos bloquean el fetch. Verificar directamente en los bancos. Para el draft: mantener cualitativo ("varios bancos permiten…") sin afirmar condiciones específicas. |
| C6 | **Impacto de no tener RUT:** sin RUT no es posible cotizar en AFP/salud, firmar contrato de trabajo formal en Chile, ni abrir algunas cuentas bancarias. Con RUT provisorio del SII se puede firmar contrato de trabajo y acceder a CuentaRUT. | SII / legislación laboral | **TODO:SOURCE** | Claim lógico pero no verificado vía fuente primaria en este run. |

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
| Q1 | Proceso exacto de RUT para extranjeros en SII (documentos, costo, presencialidad) | **ABIERTO** | SII → "RUT y Cédula de RUT → Extranjeros"; visitar https://www.sii.cl presencialmente o llamar al 22395-1515 |
| Q2 | Proceso de cédula de identidad de extranjero (Registro Civil) y su relación con RUT definitivo | **ABIERTO** | Registro Civil → "Cédula de identidad para extranjeros" |
| Q3 | Condiciones de arriendo para extranjeros sin historial: ¿hay restricción legal o es discrecional del propietario? | **PARCIAL** | Ley 21.461 (BCN) verificable; práctica de garantías es costumbre del mercado |
| Q4 | Cuentas fintech para extranjeros: MACH, Tenpo, otras — ¿requieren cédula de extranjero o aceptan pasaporte? | **ABIERTO** | Portales de cada fintech; CMF Registro de Prestadores |

---

## Implicaciones para el draft

1. **C1/C1b (RUT):** dado que son TODO:SOURCE, el draft debe describir el proceso con nivel
   de precisión que indique "para obtener RUT puedes ir al SII con tu pasaporte y permiso
   vigente" y remitir a https://www.sii.cl — sin afirmar pasos específicos como hecho verificado.
2. **C2 (CuentaRUT):** VERIFIED; se puede citar con precisión y fuente.
3. **C4 (arriendo):** describir las prácticas comunes (garantías adicionales) sin afirmar que
   hay prohibición legal; remitir a verificar con el propietario/corredor.
4. **C5/C6:** mantener cualitativo; no afirmar condiciones específicas de bancos ni consecuencias
   exactas de no tener RUT sin respaldo de fuente.
