# Addendum de investigación oficial — claims C1, C1b, C4, C5 y C6

**Artículo:** Finanzas para migrantes en Chile  
**Run:** `20260622-1330-pipeline`  
**Fecha de investigación:** 2026-06-22  
**Alcance:** investigación de fuentes oficiales para claims marcados `TODO:SOURCE`  
**Estado del documento:** evidencia para validación e incorporación; no modifica por sí mismo los estados del dossier ni autoriza publicación

## Resumen ejecutivo

La investigación permite:

- verificar C1 y C1b después de reformularlos;
- respaldar parcialmente C4, retirando prácticas de mercado sin fuente oficial;
- limitar C5 a requisitos efectivamente publicados por cada institución;
- determinar que C6 contiene errores sustantivos y debe reemplazarse.

Disposición recomendada para una posterior revisión humana o de ResearchAgent:

| Claim | Disposición recomendada |
|---|---|
| C1 | `VERIFIED — REFORMULATED` |
| C1b | `VERIFIED — REFORMULATED` |
| C4 | `PARTIAL VERIFIED` — retirar prácticas de mercado no respaldadas |
| C5 | `VERIFIED AS LIMITED CLAIM` — no prometer elegibilidad |
| C6 | `ERROR — REPLACE` |

Estas disposiciones son recomendaciones de investigación. Los estados canónicos deben ser
actualizados por el rol autorizado después de validar las fuentes y aplicar la remediación.

## C1 — RUT para extranjeros

### Resultado

**VERIFIED tras reformulación.** El claim original mezclaba residentes, no residentes y
permisos migratorios.

### Evidencia oficial

El Servicio de Impuestos Internos indica que:

- las personas extranjeras con residencia y cédula de identidad para extranjeros no deben
  solicitar otro RUT, porque son registradas automáticamente con su RUN;
- las personas extranjeras sin residencia que causen o puedan causar impuestos deben
  inscribirse en el RUT;
- el procedimiento vigente de inscripción se realiza por internet y los antecedentes
  dependen del tipo de contribuyente.

Fuentes:

- [SII — Obtención de RUT](https://www.sii.cl/destacados/educacion/ciclo_vida_contribuyente/paso_01.html)
- [SII — Documentos para inscribirse en el RUT, actualizado el 28-05-2026](https://www.sii.cl/preguntas_frecuentes/rut_inicio_actividades/001_105_0135.htm)
- [SII — Rol Único Tributario para personas extranjeras](https://www.sii.cl/contribuyentes/contribuyentes_individuales/chilenos_extranjero/rol_unico_tributario.htm)

### Corrección necesaria

Debe eliminarse como regla general la instrucción de “acudir a cualquier oficina con
pasaporte y permiso vigente”. La información vigente del SII establece un canal en línea y
distingue los antecedentes según el caso.

### Texto recomendado

> Las personas extranjeras con residencia y cédula de identidad para extranjeros no deben
> solicitar otro RUT: el SII las registra automáticamente con su RUN. Las personas
> extranjeras sin residencia que deban cumplir obligaciones tributarias pueden solicitar su
> inscripción en el RUT por internet; los documentos exigidos dependen de su situación y del
> motivo tributario del trámite.

## C1b — RUN como identificación tributaria

### Resultado

**VERIFIED tras reformulación.** La cédula de identidad para extranjeros contiene un RUN y
el SII registra automáticamente con ese número a las personas extranjeras residentes que
poseen la cédula.

### Evidencia oficial

- [ChileAtiende — Cédula de identidad para extranjeros](https://www.chileatiende.gob.cl/fichas/3337)
- [SII — Obtención de RUT](https://www.sii.cl/destacados/educacion/ciclo_vida_contribuyente/paso_01.html)

### Corrección necesaria

Conviene evitar las expresiones “RUT definitivo” y “para todos los efectos”. La evidencia
permite afirmar que el SII utiliza el RUN de la cédula para el registro tributario, pero no
respalda una equivalencia universal formulada sin límites.

### Texto recomendado

> Si tienes residencia y obtienes una cédula de identidad para extranjeros, esta incluye un
> RUN. El SII te registra automáticamente con ese mismo número para efectos tributarios, por
> lo que no debes solicitar un segundo RUT.

## C4 — Arriendo siendo extranjero

### Resultado

**PARTIAL VERIFIED.** Existe respaldo para explicar que la normativa general de arriendo no
establece un requisito general de nacionalidad o RUT. No existe respaldo oficial suficiente
para presentar determinadas garantías adicionales como práctica general del mercado.

### Evidencia oficial

- El SII indica que los turistas extranjeros pueden celebrar contratos privados de arriendo
  utilizando su pasaporte o documento de identidad extranjero, sin solicitar un RUT.
- La Ley N° 18.101 regula los arrendamientos urbanos sin establecer un requisito general de
  nacionalidad para el arrendatario.
- La Ley N° 21.461 modificó los procedimientos de restitución y cobro derivados del arriendo;
  no establece requisitos especiales de acceso para personas extranjeras.
- El artículo 2 de la Ley N° 20.609 contempla como discriminación arbitraria las distinciones
  injustificadas basadas, entre otros motivos, en la nacionalidad, incluso cuando son
  efectuadas por particulares.

Fuentes:

- [SII — RUT y contratos de turistas extranjeros](https://www.sii.cl/contribuyentes/contribuyentes_individuales/chilenos_extranjero/rol_unico_tributario.htm)
- [BCN — Ley N° 18.101 sobre arrendamiento de predios urbanos](https://www.bcn.cl/leychile/navegar?idNorma=29526)
- [BCN — Ley N° 21.461](https://www.bcn.cl/leychile/Navegar?idNorma=1178004)
- [BCN — Ley N° 20.609 contra la discriminación](https://www.bcn.cl/leychile/navegar?idNorma=1042092)

### Afirmaciones no verificadas

No se encontró una fuente oficial que permita afirmar como regla general:

- que es habitual exigir meses adicionales de garantía a personas extranjeras;
- que la mayoría de los propietarios acepta un arriendo si se ofrecen garantías adicionales;
- que normalmente se exige codeudor solidario o seguro de arriendo;
- que el propietario puede establecer libremente cualquier requisito.

Esas afirmaciones deben retirarse o identificarse expresamente como observaciones de mercado
no normativas. La autonomía contractual no elimina los límites legales ni la prohibición de
discriminación arbitraria.

### Texto recomendado

> **Resumen orientativo:** La legislación revisada no establece un requisito general de
> nacionalidad o RUT para celebrar un arriendo urbano. Incluso el SII indica que un turista
> puede figurar en contratos privados de arriendo con su pasaporte o documento extranjero.
> Los antecedentes económicos y garantías se acuerdan en cada contrato, dentro de los
> límites legales y sin discriminación arbitraria.

## C5 — Otros bancos y fintech para extranjeros

### Resultado

**VERIFIED AS LIMITED CLAIM.** Las fuentes permiten describir los requisitos publicados de
productos concretos, pero no afirmar que toda persona extranjera será aceptada por varios
bancos o fintech.

### Evidencia por institución

#### BancoEstado

BancoEstado admite expresamente a personas extranjeras con cédula de identidad vigente para
CuentaRUT.

- [BancoEstado — CuentaRUT](https://start.bancoestado.cl/content/bancoestado-public/cl/es/home/home/productos-/cuentas/cuentarut.html)
- [ChileAtiende — CuentaRUT BancoEstado](https://www.chileatiende.gob.cl/fichas/70638-cuenta-rut-bancoestad)

#### Santander

Santander publica productos que requieren cédula vigente y evaluación comercial. La página
consultada no garantiza expresamente elegibilidad para toda persona extranjera.

- [Santander — Cuenta Más Lucas](https://banco.santander.cl/personas/planes/cuenta-mas-lucas/)

#### BCI

BCI exige cédula vigente, ingresos y evaluación comercial para su Cuenta Digital. La página
no promete admisión universal de personas extranjeras.

- [BCI — Preguntas frecuentes de Cuenta Digital](https://www.bci.cl/personas/abrir-cuenta-corriente/cuenta-digital/preguntas-frecuentes)

#### Tenpo

Tenpo solicita RUT, número de serie y validación mediante cédula física chilena vigente.

- [Tenpo — Cómo abrir una cuenta](https://www.tenpo.cl/como-abrir-tu-cuenta)
- [Tenpo — Validación con cédula chilena vigente y física](https://soporte.tenpo.cl/hc/es-419/articles/45246771353755-Quiero-ingresar-a-mi-App-desde-otro-tel%C3%A9fono-pero-no-puedo-hacerlo-porque-no-tengo-c%C3%A9dula-chilena-Qu%C3%A9-hago)

### Corrección necesaria

No debe afirmarse que MACH, Tenpo, Santander, BCI o Banco Falabella aceptan a personas
extranjeras salvo que la página oficial del producto lo indique expresamente. La posesión de
una cédula vigente no garantiza aprobación cuando también existe evaluación comercial.

### Texto recomendado

> Además de CuentaRUT, existen productos bancarios y fintech que solicitan cédula chilena
> vigente, RUT y, según el producto, evaluación comercial o acreditación de ingresos. Sus
> páginas no garantizan que toda persona extranjera califique, por lo que debes comprobar las
> condiciones directamente con cada institución.

## C6 — Impacto de no tener RUT

### Resultado

**ERROR — REPLACE.** La afirmación original de que sin RUT no es posible firmar un contrato
formal, cotizar o acceder a salud es incompatible con las fuentes oficiales. También es
incorrecto afirmar que un RUT provisorio del SII basta para abrir CuentaRUT.

### Evidencia oficial

- La Dirección del Trabajo permite utilizar pasaporte o DNI en determinados registros de
  trabajadores migrantes que todavía no cuentan con un RUT otorgado por el Registro Civil.
- La Superintendencia de Pensiones permite que una persona extranjera sin cédula cotice en una
  cuenta con identificación provisoria y regularice posteriormente sus datos.
- Fonasa admite trámites de afiliación y certificados para personas extranjeras con RUT
  provisorio y pasaporte.
- BancoEstado exige cédula de identidad vigente para CuentaRUT; un RUT tributario provisorio
  no está acreditado como sustituto.

Fuentes:

- [Dirección del Trabajo — registro de trabajador migrante sin RUT del Registro Civil](https://www.dt.gob.cl/portal/1628/w3-article-119155.html)
- [Superintendencia de Pensiones — Los migrantes y el sistema de pensiones](https://www.spensiones.cl/portal/institucional/594/w3-article-12267.html)
- [ChileAtiende — Certificados de afiliación y cotizaciones de Fonasa](https://www.chileatiende.gob.cl/fichas/5241)
- [ChileAtiende — CuentaRUT BancoEstado](https://www.chileatiende.gob.cl/fichas/70638-cuenta-rut-bancoestad)

### Texto recomendado

> No tener todavía cédula o RUN definitivo no impide por sí solo firmar un contrato laboral
> ni cotizar: pueden utilizarse documentos extranjeros e identificadores previsionales
> provisorios, según el trámite. Sin embargo, algunos productos financieros —incluida
> CuentaRUT— exigen una cédula de identidad chilena vigente. La autorización para trabajar
> depende del permiso migratorio correspondiente, no de poseer únicamente un RUT tributario.

## Hallazgo adicional — fuente profunda para C2 y C3

La investigación también encontró las fuentes oficiales profundas que faltaban para los
claims C2 y C3:

- [BancoEstado — CuentaRUT](https://start.bancoestado.cl/content/bancoestado-public/cl/es/home/home/productos-/cuentas/cuentarut.html)
- [BancoEstado — solicitud de CuentaRUT desde el extranjero](https://www.bancoestado.cl/content/bancoestado-public/cl/es/home/home/centro-de-ayuda/productos/cuentas/cuentarut/-puedo-pedir-la-cuentarut-desde-el-extranjero----centro-de-ayuda.html)
- [ChileAtiende — CuentaRUT BancoEstado](https://www.chileatiende.gob.cl/fichas/70638-cuenta-rut-bancoestad)

Estas páginas respaldan, según el caso:

- cédula de identidad vigente;
- edad mínima de 12 años;
- intervención del representante legal para menores de 18 años;
- apertura mediante App para mayores de edad;
- condiciones específicas para solicitar la cuenta desde el extranjero;
- entrega de la tarjeta física únicamente en Chile para la modalidad descrita por
  BancoEstado.

## Suplemento para remediación posterior a Gate 06 — 2026-06-22

**Origen:** investigación oficial solicitada después del veredicto Gate 06 `FAIL — 8.86/10`.
**Fecha de recuperación:** 2026-06-22.
**Finalidad:** proporcionar evidencia cerrada para una nueva remediación de `04-draft.md` y
su posterior auditoría independiente. Este suplemento no cambia por sí mismo el draft ni el
veredicto de ningún gate.

### S1 — Condición exacta para el RUT de una persona extranjera sin residencia

La página vigente del SII limita la inscripción a personas naturales extranjeras sin
residencia que **“causen o puedan causar impuestos”**. También indica que las personas
extranjeras con residencia y cédula no deben solicitar otro RUT, porque el SII las registra
automáticamente con su RUN. El trámite se realiza por internet.

Fuentes recuperadas:

- [SII — Obtención de RUT](https://www.sii.cl/destacados/educacion/ciclo_vida_contribuyente/paso_01.html)
  — secciones “Quiénes deben realizarla” y “Dónde se hace”.
- [SII — Documentos para inscribirse en el RUT](https://www.sii.cl/preguntas_frecuentes/rut_inicio_actividades/001_105_0135.htm)
  — actualizada el 28-05-2026; confirma trámite por internet y antecedentes según el tipo
  de solicitante.

**Texto obligatorio recomendado para el ancla:**

> Si tienes residencia y cédula de identidad para extranjeros, el SII te registra
> automáticamente con tu RUN y no debes solicitar otro RUT. Si no tienes residencia y
> causas o puedes causar impuestos en Chile, debes solicitar la inscripción en el RUT por
> internet en sii.cl; los antecedentes dependen de tu situación tributaria.

**Control para Gate 05:** marcar como discrepancia cualquier versión que omita “causas o
puedes causar impuestos”, porque convertiría una condición tributaria en una elegibilidad
general para toda persona sin residencia.

### S2 — Alcance preciso del artículo 2 de la Ley N° 20.609

El artículo 2 no establece que toda diferencia de trato basada en nacionalidad sea
automáticamente ilegal. Define discriminación arbitraria mediante condiciones acumulativas:
la distinción debe carecer de justificación razonable y causar privación, perturbación o
amenaza al ejercicio legítimo de derechos fundamentales. La disposición comprende actos de
agentes del Estado o particulares y enumera la nacionalidad entre los motivos relevantes.

Fuente recuperada:

- [BCN — Ley N° 20.609, artículo 2](https://www.bcn.cl/leychile/navegar?idNorma=1042092)
  — versión vigente consultada el 2026-06-22.

**Extracto operativo breve para citar antes de la explicación:**

> “distinción, exclusión o restricción que carezca de justificación razonable, efectuada por
> agentes del Estado o particulares”.

**Texto recomendado después de la cita:**

> El artículo 2 incluye la nacionalidad entre los motivos relevantes. Esto no significa que
> toda distinción sea automáticamente ilícita: debe carecer de justificación razonable y
> afectar el ejercicio legítimo de derechos fundamentales. Este es un resumen orientativo y
> su aplicación depende de las circunstancias del caso.

**Control para Gate 05:** rechazar las formulaciones “la ley prohíbe cualquier distinción por
nacionalidad” o equivalentes. Verificar que la cita literal preceda a la síntesis y que esta
conserve las condiciones legales.

### S3 — Fuentes profundas para `articleLead.officialSources`

Las portadas institucionales genéricas no proporcionan trazabilidad suficiente para las
reglas del ancla. Deben reemplazarse por las páginas específicas:

- RUT e inscripción: [SII — Obtención de RUT](https://www.sii.cl/destacados/educacion/ciclo_vida_contribuyente/paso_01.html).
- Documentos del RUT: [SII — pregunta frecuente 001.105.0135.021](https://www.sii.cl/preguntas_frecuentes/rut_inicio_actividades/001_105_0135.htm).
- RUN en la cédula: [ChileAtiende — Cédula de identidad para extranjeros](https://www.chileatiende.gob.cl/fichas/3337).
- CuentaRUT: [BancoEstado — CuentaRUT](https://start.bancoestado.cl/content/bancoestado-public/cl/es/home/home/productos-/cuentas/cuentarut.html).
- CuentaRUT, respaldo estatal: [ChileAtiende — CuentaRUT BancoEstado](https://www.chileatiende.gob.cl/fichas/70638-cuenta-rut-bancoestad).
- Marco antidiscriminación: [BCN — Ley N° 20.609](https://www.bcn.cl/leychile/navegar?idNorma=1042092).

**Control para Gate 05:** comprobar que cada regla crítica del ancla apunte a una URL
específica y que no se reemplace por la portada de la institución.

### S4 — Descripción oficial de la UF

El Banco Central define la UF como un índice de reajustabilidad. Su valor se reajusta
diariamente desde el día 10 de cada mes hasta el día 9 del siguiente, de acuerdo con la
variación del IPC del mes calendario inmediatamente anterior. Por tanto, “la UF sube con la
inflación” es una simplificación incompleta y no debe usarse como regla técnica.

Fuente recuperada:

- [Banco Central de Chile — metodología de la Unidad de Fomento](https://si3.bcentral.cl/estadisticas/Principal1/Metodologias/EMF/UF.pdf)
  — “Definición y cobertura” y “Metodología”.

**Texto recomendado:**

> La UF se reajusta diariamente entre el día 10 de cada mes y el día 9 del siguiente, según
> la variación del IPC del mes anterior. Si el contrato fija el arriendo en UF, su
> equivalente en pesos dependerá del valor vigente y de lo pactado en el contrato.

**Control para Gate 05:** verificar los cuantificadores temporales “día 10”, “día 9” y “mes
anterior” contra la metodología del Banco Central, o retirar el detalle si no se conserva la
fuente.

### S5 — Excepción relevante para CuentaRUT de menores extranjeros

BancoEstado y ChileAtiende confirman que CuentaRUT puede solicitarse desde los 12 años, sin
distinción de género o sexo. Para personas de 12 a 17 años existen vías mediante la App si el
padre o la madre son clientes de BancoEstado. Sin embargo, BancoEstado indica expresamente
que debe acudirse a una sucursal cuando el menor es extranjero o cuando el padre o la madre
son extranjeros, entre otros casos.

Fuentes recuperadas:

- [BancoEstado — requisitos de CuentaRUT](https://start.bancoestado.cl/content/bancoestado-public/cl/es/home/home/productos-/cuentas/cuentarut.html)
  — requisitos y excepciones para menores de edad.
- [ChileAtiende — CuentaRUT BancoEstado](https://www.chileatiende.gob.cl/fichas/70638-cuenta-rut-bancoestad)
  — edad mínima de 12 años, cédula vigente y representación para menores de 18 años.
- [ChileAtiende — versión PDF actualizada el 16-04-2026](https://www.chileatiende.gob.cl/fichas/70638/1/pdf).

**Texto recomendado:**

> La CuentaRUT puede solicitarse desde los 12 años. Entre los 12 y 17 años existen
> alternativas mediante la App si el padre o la madre son clientes de BancoEstado. Si el
> menor o su padre o madre son extranjeros, BancoEstado exige acudir a una sucursal con la
> documentación correspondiente.

**Control para Gate 05:** el claim C3 no puede presentar la vía App como universal para todo
menor migrante. Debe incluir la excepción de sucursal, porque afecta directamente a la
audiencia objetivo del artículo.

### Criterio de cierre para la próxima auditoría

Antes de emitir un nuevo PASS, MathAuditAgent debe confirmar en el borrador remediado:

1. C1 conserva la condición tributaria “causen o puedan causar impuestos”.
2. C4 reproduce el alcance condicionado del artículo 2 y no lo convierte en prohibición
   absoluta.
3. Las fuentes del ancla son URLs profundas y corresponden al claim que acompañan.
4. La explicación de la UF coincide con la metodología del Banco Central o fue retirada.
5. C3 incluye la vía presencial para menores extranjeros o con padre/madre extranjeros.
6. No se introdujeron números, universalidades o condiciones de elegibilidad nuevas sin
   fuente oficial.

## Próximos pasos del pipeline

1. Validación humana de las fuentes y de los textos recomendados.
2. Actualización de `02-dossier.md` por el rol autorizado, conservando la trazabilidad y
   registrando las reformulaciones.
3. Remediación de `04-draft.md` por DraftAgent.
4. Nueva auditoría de Gate 05 si la remediación introduce o modifica claims auditables.
5. Nueva auditoría de Gate 06 en una sesión fresca e independiente.
6. Gate 07 permanece reservado para Carlos Ortega como HumanEditor.

Ninguna conclusión de este addendum marca gates, altera scorecards ni autoriza la
publicación.
