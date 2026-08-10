# BORRADOR DE TRABAJO — NO PUBLICADO

**Estado:** `DRAFT — pendiente de MathAuditAgent y ComplianceAgent (sesión fresca)`
**No toca `src/data/blog/`.** No crea URL indexable. No requiere excepción al freeze estratégico (`docs/governance/STRATEGIC_FOCUS_2026Q3.md`) porque no publica nada.
**Origen:** solicitud del usuario de un artículo sobre el art. 107 LIR. Gate 00 (`artifacts/editorial/_intake/articulo-107-lir-ganancia-capital-acciones/00-topic-intake.md`) determinó que la intención ya tiene owner (`ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`) y recomienda foldear este contenido como sección nueva de ese artículo en vez de crear una pieza standalone. Este borrador está redactado con ese destino en mente, pero es autocontenido para poder leerse de forma independiente.
**Fecha de corte:** 2026-08-09.
**Redactado por:** Claude Code, sesión única (rol equivalente a DraftAgent + research ad hoc con `WebFetch`/`WebSearch`, no ChatGPT — desviación de `context/EDITORIAL_AI_PIPELINE.md` §2 documentada explícitamente; ver nota de separación de roles al final). **Esta misma sesión no puede auditar ni dar compliance a este borrador.**

---

## Respuesta rápida

Hoy (2026-08-09), la ganancia obtenida al vender acciones (de sociedades anónimas abiertas constituidas en Chile), cuotas de fondos de inversión o cuotas de fondos mutuos, **cada una cumpliendo los requisitos específicos que la ley establece para ese tipo de valor** (presencia bursátil para las acciones; requisitos propios para cada tipo de fondo — no es una única regla uniforme para los tres), paga un **impuesto único de 10%** sobre el mayor valor — no está exenta. La exención total ("ingreso no renta") que rigió hasta 2022 fue eliminada por la Ley N° 21.420, vigente desde el 2 de septiembre de 2022. El Congreso Nacional aprobó el 4 de agosto de 2026 un proyecto de ley que restituye la exención completa (0%) a contar del 1 de enero de 2027, pero **esa norma todavía no es ley**: está en control de constitucionalidad ante el Tribunal Constitucional y pendiente de promulgación y publicación en el Diario Oficial. No vendas ni dejes de vender un instrumento asumiendo que el 0% ya rige — no rige todavía.

---

## 1. Qué es el artículo 107 de la LIR

El artículo 107 de la Ley sobre Impuesto a la Renta (LIR, contenida en el artículo 1° del Decreto Ley N° 824 de 1974) regula el tratamiento tributario del mayor valor (ganancia de capital) obtenido en la **enajenación o rescate** de:

- acciones de sociedades anónimas abiertas constituidas en Chile, con presencia bursátil;
- cuotas de fondos de inversión;
- cuotas de fondos mutuos.

Es la norma que determina si, cuando vendes estos instrumentos con ganancia, esa ganancia paga impuesto, cuánto, y quién lo retiene.

## 2. Qué es "presencia bursátil" (el requisito que activa la norma)

El art. 107 solo aplica a instrumentos con presencia bursátil — no a cualquier acción o cuota. La definición vigente de presencia bursátil no está en la LIR sino en una norma de la Comisión para el Mercado Financiero (CMF, entonces Superintendencia de Valores y Seguros): la **Norma de Carácter General N° 327**, del 17 de enero de 2012, vigente desde el 1 de febrero de 2012, dictada en virtud del artículo 4° bis de la Ley N° 18.045 (Ley de Mercado de Valores).

Texto literal de los requisitos:

> "Se considerarán valores de presencia bursátil aquellos que, a la fecha de efectuar su determinación: a) Estén inscritos en el Registro de Valores; b) Estén registrados en una bolsa de valores de Chile; y c) Cumplan a lo menos uno de los siguientes requisitos: 1. Tener una presencia ajustada igual o superior al 25%. 2. Contar con un 'Market Maker', en los términos y condiciones establecidos en la presente Norma."
> — NCG N° 327, Sección I (SVS/CMF)

¿Cómo se calcula la "presencia ajustada" del 25%? Literal de la misma norma:

> "Dentro de los últimos 180 días hábiles bursátiles anteriores al día a que se refiere el cálculo, se determinará el número de días en que las transacciones bursátiles totales diarias hayan alcanzado un monto mínimo por el equivalente en pesos a 1.000 Unidades de Fomento conforme al valor que tenga dicha unidad en cada uno de esos días. Dicho número será dividido por ciento ochenta, y el cuociente así resultante se multiplicará por cien, quedando expresado en porcentaje."
> — NCG N° 327, Sección II

En palabras simples: un valor tiene presencia bursátil si, de los últimos 180 días hábiles bursátiles, se transaron en bolsa al menos 1.000 UF diarias en al menos 45 de esos días (45/180 = 25%). Alternativamente, califica si el emisor mantiene un contrato de "Market Maker" que sostenga ofertas de compra y venta por al menos 500 UF diarias cada una (suma mínima 1.000 UF), con una diferencia de precios entre ambas ofertas que no puede superar el 3% del precio de la oferta de compra (NCG 327, Sección III.c).

**Implicación práctica:** que una acción cotice en la Bolsa de Santiago no basta. Verifica la nómina de valores con presencia bursátil que las bolsas de valores chilenas deben mantener públicamente disponible (obligación establecida en la misma NCG 327) antes de asumir que tu instrumento califica.

*Nota de fuente: se encontró una propuesta de modificación de esta norma (2019) para elevar el umbral a 3.000 UF diarias y 75% de los días — no hay evidencia en las fuentes consultadas de que esa modificación haya sido aprobada y esté vigente. El umbral operativo verificado (25% / 1.000 UF) es el de la NCG 327 original de 2012, que la propia Circular SII N° 39 de 2022 sigue citando como vigente. Antes de publicar, confirmar en `cmfchile.cl` que no exista una norma posterior que haya modificado o reemplazado la NCG 327.*

## 3. Situación vigente hoy: impuesto único de 10%, no exención

Fuente primaria: **Circular N° 39 de 2022 del Servicio de Impuestos Internos** (Departamento Emisor Impuestos Directos, GE204576.2022, 31 de agosto de 2022), que imparte instrucciones sobre las modificaciones que la **Ley N° 21.420** (publicada en el Diario Oficial el 4 de febrero de 2022) introdujo a los artículos 17 N° 6, 33 bis, 107 y 110 de la LIR.

Texto literal de la Circular sobre el efecto de la reforma:

> "Tras las modificaciones, el mayor valor obtenido en estos casos dejará de ser un ingreso no constitutivo de renta, pasando a tributar con un impuesto único a la renta con tasa del 10%. Lo anterior, salvo que el mayor valor sea obtenido por inversionistas institucionales — sea que tengan o no domicilio o residencia en Chile — en cuyo caso, este mantendrá su calidad de ingreso no constitutivo de renta."
> — Circular SII N° 39/2022, §2

Puntos operativos clave, también literales de la Circular:

- **Vigencia de la reforma:** el impuesto único de 10% aplica a operaciones realizadas **a contar del 2 de septiembre de 2022**.
- **Quién no paga el 10%:** los inversionistas institucionales (con o sin domicilio/residencia en Chile) conservan el tratamiento de ingreso no renta. Las personas naturales, en cambio, no pueden acogerse a esa excepción ni a las reglas del art. 17 N° 8 letra a) de la LIR como alternativa.
- **Base imponible:** el mayor valor se determina como la diferencia entre el precio o valor de enajenación/rescate y el valor de aporte o adquisición reajustado. Para contribuyentes domiciliados o residentes en Chile, la ley permite elegir entre el precio de cierre oficial al 31 de diciembre del año de adquisición (reajustado) o el valor de adquisición efectivamente pagado (reajustado) — la opción, una vez ejercida en la declaración de impuestos, es irrevocable.
- **Pérdidas:** solo son deducibles contra ingresos afectos al mismo impuesto único de 10% del art. 107 (no contra otras rentas), en el mismo ejercicio o en ejercicios posteriores.
- **Retención:** el corredor de bolsa o agente de valores que actúa por cuenta del vendedor sin domicilio ni residencia en Chile debe retener el impuesto. Para rescates de cuotas de fondos, la sociedad administradora retiene primero; si no lo hace, recae en el corredor y luego en el adquirente.

### Ejemplo ilustrativo (cifras hipotéticas, no un caso real)

Una persona natural compra acciones con presencia bursátil por $10.000.000 y las vende más tarde por $15.000.000. Mayor valor: $5.000.000.

| Régimen | Tasa | Impuesto sobre el mayor valor |
|---|---|---|
| Vigente hoy (Ley 21.420, desde 2022-09-02) | 10% | $500.000 |
| Aprobado por el Congreso, aún no vigente (desde 2027-01-01 si se publica sin cambios) | 0% | $0 |

## 4. El cambio aprobado: qué está aprobado, desde cuándo rige, desde cuándo se aplica

**Qué está aprobado:** el 4 de agosto de 2026, la Cámara de Diputados comunicó al Presidente de la República que el Congreso Nacional dio su aprobación al proyecto de ley "Reconstrucción Nacional y Desarrollo Económico y Social" (**Boletín N° 18.216-05**). Entre sus normas, restituye el artículo 107 de la LIR al tratamiento de **ingreso no constitutivo de renta** que rigió hasta 2022, eliminando expresamente el impuesto único de 10% que introdujo la Ley 21.420. *(El año exacto de inicio de la exención original —anterior a la Ley 21.420— no quedó confirmado con una fuente fetcheada directamente en esta sesión; una búsqueda mencionó 2001, pero no se verificó contra el texto legal. No usar "2001" como cifra sourced hasta confirmarlo contra la LIR/BCN.)*

Texto literal del resumen técnico de KPMG Chile sobre esta norma del proyecto aprobado:

> "Las ganancias de capital reguladas en el artículo 107 pasan a considerarse ingresos no constitutivos de renta, eliminándose el actual impuesto único del 10%. Se elimina el impuesto de 10% a la ganancia de capital en venta de acciones o títulos de deuda con presencia bursátil; dichas rentas quedan expresamente calificadas como ingreso no renta y se suprimen los numerales del antiguo régimen. Se eliminan las reglas de pérdidas asociadas al antiguo régimen."
> — KPMG Chile, *Insights: Tax Alert — Ley de Reconstrucción Nacional*, agosto 2026

**Desde cuándo regiría (vigencia legal declarada en el proyecto):** 1 de enero de 2027.

**Desde cuándo se aplica hoy (estado real, 2026-08-09):** el proyecto **todavía no es ley**. Por contener normas propias de ley orgánica constitucional, fue remitido al Tribunal Constitucional. El propio Tax Alert de KPMG lo advierte: *"El contenido definitivo podría experimentar modificaciones durante el proceso de control constitucional, promulgación y publicación de la ley."*

Estado del control de constitucionalidad, verificado directamente:

- **2026-08-06:** el Tribunal Constitucional admitió a trámite y declaró admisibles tres requerimientos presentados por la oposición contra el proyecto (los escritos cuestionan, entre otras normas, el régimen de invariabilidad tributaria y cambios al modelo de Resolución de Calificación Ambiental — no impugnan directamente el art. 107, pero el fallo del TC es sobre el proyecto completo).
- **2026-08-12:** audiencia pública convocada, 09:00 horas.
- **2026-08-13:** audiencia de alegatos ante el TC.
- El TC concedió cinco días corridos al Presidente Kast, al Senado y a la Cámara de Diputados para pronunciarse sobre las cuestiones de constitucionalidad planteadas.

### Hoy vs. después (resumen orientativo — no es asesoría tributaria individual)

| | Hoy (2026-08-09) | Si se publica sin cambios (desde 2027-01-01) |
|---|---|---|
| Estado de la norma | Ley vigente (Ley 21.420) | Aprobada por el Congreso, en control de constitucionalidad — no promulgada ni publicada |
| Tasa sobre la ganancia de capital (persona natural, instrumento con presencia bursátil) | 10% | 0% (ingreso no renta) |
| Qué hacer si vendes hoy | Se te retiene/pagas 10% sobre el mayor valor | No aplica todavía |

## 5. Qué hacer mientras tanto

- No asumas el 0% para operaciones que hagas antes de que la ley esté publicada en el Diario Oficial y vigente. El resultado del control del Tribunal Constitucional puede modificar o eliminar esta norma del proyecto.
- Si tu decisión de venta es sensible al resultado del TC, considera esperar a la publicación oficial antes de vender, o consulta a un asesor tributario sobre tu caso específico — la fecha de vigencia (2027-01-01) y el resultado del control constitucional son, a la fecha de corte de este documento, los dos factores que determinan qué régimen te aplica.
- Verifica presencia bursátil en la nómina pública de tu bolsa antes de dar por hecho que un instrumento califica para el art. 107 (sea con la tasa de 10% de hoy o con la eventual exención).
- Verifica el estado de la ley en `bcn.cl/leychile` (Boletín 18.216-05) antes de tomar una decisión basada en este documento — este borrador tiene fecha de corte 2026-08-09 y el estado legislativo puede cambiar en cualquier momento.

## Fuentes (todas con fetch directo, no citadas de memoria)

| Fuente | Uso | Fecha de recuperación |
|---|---|---|
| SII, Circular N° 39/2022 (GE204576.2022) — `https://www.sii.cl/normativa_legislacion/circulares/2022/circu39.pdf` | Régimen vigente: tasa 10%, vigencia 2022-09-02, excepción inversionistas institucionales, retención | 2026-08-09 |
| SVS/CMF, Norma de Carácter General N° 327 (17-01-2012) — mirror institucional en `larrainvial.com/campanas/docs/NormaGeneralN327.pdf` | Definición literal de presencia bursátil y presencia ajustada | 2026-08-09 |
| KPMG Chile, *Insights: Tax Alert — Ley de Reconstrucción Nacional* (agosto 2026) — `assets.kpmg.com` | Contenido del art. 107 en el proyecto aprobado, vigencia 2027-01-01, advertencia de control constitucional pendiente | 2026-08-09 |
| El América, "Semana legislativa..." (04-08-2026) | Boletín N° 18.216-05; cierre de tramitación en el Senado | 2026-08-09 |
| Emol, "TC por requerimientos: admisibles" (06-08-2026) | Admisibilidad de los 3 requerimientos ante el TC; fechas de audiencia pública (12-08) y alegatos (13-08) | 2026-08-09 |

**TODO:SOURCE / pendiente antes de compliance:**
1. No se logró recuperar el texto literal codificado del art. 107 LIR directamente desde `bcn.cl/leychile` — dos intentos de `WebFetch` fallaron por timeout de la aplicación de LeyChile. El contenido de este borrador sobre el art. 107 se apoya en la paráfrasis oficial y las citas literales de la Circular SII N° 39/2022, que sí cita el articulado. Antes de foldear al artículo owner, reintentar el fetch directo a bcn.cl o usar el PDF de "texto refundido" de la LIR.
2. Confirmar en `cmfchile.cl` (no en el mirror de Larraín Vial) que la NCG 327 de 2012 sigue vigente sin modificaciones posteriores — ver nota en la sección 2.
3. El boletín 18.216-05 y las fechas del TC provienen de medios de prensa (El América, Emol), no de la página oficial del Tribunal Constitucional ni del Senado. Antes de publicar, verificar en `tribunalconstitucional.cl` y `senado.cl`.

## Nota separada: discrepancia detectada en contenido ya publicado (para triage editorial, no para incluir en el artículo)

Durante el research se detectó que **un artículo ya publicado en el sitio afirma que la ganancia de capital en acciones con presencia bursátil "sigue exenta"**, lo cual contradice el régimen vigente desde 2022-09-02 (10%, Ley 21.420):

- `src/data/blog/operacion-renta-centro.md:77` — "La Ley 21.210 (Modernización Tributaria, 2020) estableció que la ganancia de capital en venta de acciones con presencia bursátil sigue exenta". **Doble error verificado:** (a) la exención fue eliminada por la Ley **21.420** (2022), no establecida por la Ley 21.210 (2020) — son leyes distintas; (b) hoy no está exenta, paga 10% (salvo inversionista institucional). Este es un defecto de exactitud confirmado en contenido YMYL ya publicado.

Se revisó también `src/data/blog/como-elegir-inversion-segun-plazo-riesgo-objetivos.mdx:195-214` por la misma sospecha — **no tiene el defecto**. Ese artículo enlaza el art. 107 LIR pero se limita a decir que los instrumentos "pueden calificar para el tratamiento del Art. 107 de la LIR, bajo condiciones específicas que detalla la normativa vigente del SII" y defiere explícitamente ("esta guía no detalla las condiciones exactas... deben verificarse en el SII y CMF"), sin afirmar tasa ni exención. Es un deferral legítimo, no un error. (Corrijo aquí una sospecha inicial que tuve antes de leer el pasaje completo — no la dejo sin verificar.)

Recomiendo abrir el defecto de `operacion-renta-centro.md` como su propio hallazgo/issue para que pase por el pipeline de refresh (no corregirlo dentro de esta sesión sin brief propio, para no mezclar alcances).

## Nota de separación de roles (transparencia, no un veredicto de compliance)

Este documento fue producido en una sola sesión de Claude Code que actuó como intake (Gate 00) y como redactor/investigador, usando `WebFetch`/`WebSearch` en lugar de ChatGPT como `ResearchAgent` (desviación respecto de `context/EDITORIAL_AI_PIPELINE.md` §2, documentada aquí explícitamente, no oculta). Por diseño de la política:

- Esta misma sesión **no puede** actuar como `MathAuditAgent` ni como `ComplianceAgent` sobre este borrador.
- Antes de foldear este contenido en `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`, se requiere: auditoría matemática adversarial (idealmente ChatGPT, verificando cada cifra contra las fuentes citadas arriba), compliance adversarial en una sesión de Claude Code nueva sin exposición a esta conversación, y sign-off humano — ninguno de los tres puede saltarse porque `regulatory_sensitivity=alta` (interpretación tributaria + ley en tramitación).
