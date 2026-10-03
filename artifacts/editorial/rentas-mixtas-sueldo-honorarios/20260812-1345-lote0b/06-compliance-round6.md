# Revisión de cumplimiento — rentas mixtas — round 6

Fecha de revisión: 2026-10-02  
Versión revisada: `src/data/blog/rentas-mixtas-sueldo-honorarios.md` después del ejemplo AT2026 y del formato aplicado por Prettier, congelada antes de cualquier corrección posterior de la FAQ 0972; se contrastó con su `git diff HEAD`.  
Alcance de edición: únicamente este informe.

**Status: BLOCKED — DEFECTS FOUND**  
**Role: ComplianceAgent (instancia independiente de OpenAI Codex, sesión fresca, adversarial).**

## Dictamen

**Verdicto: FAIL.** La tasa de 14,5% para boletas emitidas en 2025 está confirmada por el SII y el nuevo ejemplo no deriva un impuesto ni saldo individual. Sin embargo, el artículo mantiene errores materiales en la obligación de declarar, la propuesta F22 y la base usada para describir el cálculo del IGC. Cambian qué debe hacer una persona y cómo estima su impuesto; requieren corrección antes de publicación.

El informe round5 se trató solo como antecedente histórico. No se alteraron el artículo, el packet, changelogs, registro ni gates; tampoco se firmó publicación ni se marcaron casillas.

## Hallazgos

### DEFECT 1 — [MAYOR] La obligación de declarar se afirma como universal

El encabezado, `articleLead`, respuesta rápida, tabla y FAQ dicen que toda persona con sueldo y honorarios debe presentar F22, incluso si sus rentas están bajo el tramo exento. La FAQ oficial del SII sobre honorarios, actualizada el 2026-03-27, dice que la declaración es obligatoria cuando las rentas imponibles antes de deducciones superan 13,5 UTA; por debajo, se presenta si se quiere recuperar la retención. La guía SII de AT2026 también distingue a las personas obligadas por superar el umbral de quienes cumplieron mensualmente su obligación, como algunos trabajadores dependientes.

El artículo convierte el tramo exento de IGC en una excepción que elimina el impuesto, pero mantiene la obligación de declarar sin una fuente oficial que respalde esa regla. Además, presenta como permanente y aplicable a cualquier año una condición absoluta que la fuente oficial no confirma.

Fuentes primarias consultadas el 2026-10-02:

- [SII, FAQ 001.140.0972.009](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0972.htm), actualización 2026-03-27: obligatoriedad sobre 13,5 UTA y declaración voluntaria bajo ese umbral para recuperar retenciones.
- [SII, información para Personas Naturales AT2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html): exención IGC de 13,5 UTA, equivalente a $11.265.804 para AT2026.

**Resolución:** reescribir la regla ancla, tabla y FAQs para distinguir obligación legal de presentación voluntaria y cubrir las condiciones adicionales aplicables. No afirmar que la obligación subsiste automáticamente bajo 13,5 UTA. Citar la fuente SII que corresponda al ciclo descrito.

### DEFECT 2 — [ALTO] Se atribuye a la propuesta del SII una omisión automática de honorarios

El artículo afirma que la propuesta no incluye automáticamente las boletas porque cada pagador retiene por separado y no conoce otras rentas; también dice que el SII no puede precalcular el impuesto de rentas mixtas. La FAQ del SII sobre la propuesta F22, actualizada el 2026-04-10, señala que se confecciona con los antecedentes entregados por todos los agentes retenedores e informantes y que se presenta a personas naturales con rentas afectas al Impuesto Único de Segunda Categoría y al IGC. La guía SII de AT2026 para independientes describe la propuesta como construida con la información disponible de sus informantes y permite revisar, modificar o enviar el resultado.

La propuesta puede estar incompleta cuando un agente no informó o informó datos erróneos; eso no sustenta decir que los honorarios quedan fuera automáticamente ni que el SII no puede calcular la obligación conjunta. El propio artículo instruye al lector a verificar información, así que la regla puede expresarse con ese límite concreto.

Fuentes primarias consultadas el 2026-10-02:

- [SII, FAQ 001.140.2772.027](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2772.htm), actualización 2026-04-10: composición de la propuesta F22 a partir de información reportada y contribuyentes a quienes se ofrece.
- [SII, Operación Renta 2026 — guía para independientes](https://www.sii.cl/destacados/renta/2026/documents/pr_independiente.pdf): propuesta formada con los datos disponibles de informantes/agentes retenedores, revisión de rentas, resultado y opción de modificar.

**Resolución:** reemplazar la afirmación de omisión automática por una explicación de que el SII prepara una propuesta usando los antecedentes informados, que puede requerir revisión y corrección si falta información, y que el contribuyente debe verificarla antes de enviarla.

### DEFECT 3 — [ALTO] El procedimiento aplica el IGC a rentas brutas

La FAQ, el paso de cálculo y varias instrucciones repiten que se suman sueldos brutos y honorarios brutos y se aplica el IGC a esa suma. Esto omite que la base imponible no es necesariamente el total bruto de boletas: el F22 AT2026 separa total de ingresos brutos de honorarios, gastos efectivos y gastos presuntos; estos últimos pueden rebajar 30% con tope de 15 UTA. La guía práctica SII AT2026 muestra explícitamente el cálculo de base imponible del IGC con esa rebaja. Presentar la suma bruta como base puede llevar a sobreestimar el impuesto y a una conclusión incorrecta sobre devolución o pago.

Fuente primaria consultada el 2026-10-02: [Guía Práctica de Declaración de Renta 2026 del SII](https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf), caso práctico de determinación de base imponible IGC para honorarios; y [Formulario 22 AT2026](https://www.sii.cl/ayudas/formularios/f22_at2026.pdf), Recuadro N.º 1, que distingue total de ingresos brutos, gastos efectivos/presuntos y total de honorarios.

**Resolución:** describir el cálculo desde las bases imponibles y rentas tributables determinadas en el F22 —incluidas las deducciones que correspondan a honorarios—, no como aplicación directa del IGC a la suma de montos brutos. Si se conserva una simplificación, rotularla como orientativa y explicar su límite.

## Verificación de afirmaciones restantes y acceso a fuentes

- **Retención del ejemplo:** confirmada. La página oficial [SII — Boletas de honorarios](https://www.sii.cl/destacados/boletas_honorarios/) informa 14,5% para 2025 y 15,25% desde 2026. El ejemplo nuevo atribuye 14,5% a boletas emitidas durante 2025 y advierte que la tasa por sí sola no determina el saldo final. No deriva una cifra individual; esa adición no requiere un nuevo cálculo.
- **Umbral y tabla AT2026:** el SII confirma $11.265.804 como 13,5 UTA y publica la tabla anual del IGC en [Información para Personas Naturales AT2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html). El artículo identifica las cifras como AT2026 e ingresos de 2025.
- **Calendario AT2026:** la publicación oficial del SII del 2026-03-31 respalda los vencimientos y fechas de depósito citados; la noticia SII del 2026-05-06 confirma que el 8 de mayo fue el último plazo para declaraciones con devolución o sin pago. La frase sobre no haber encontrado un calendario AT2027 está acotada a la consulta del sitio de Operación Renta 2026 y del índice de noticias realizada el 2026-10-02; no se interpreta como prueba de que no exista información en otro lugar.
- **APV:** el extracto local completo `source-extract-l23-at2026.txt` se revisó junto con el [PDF oficial SII Línea 23 AT2026](https://www.sii.cl/servicios_online/renta/2026/archivos/l23_instruccion.pdf). El extracto respalda, en §23.4, el límite mensual de 50 UF, el agregado de 600 UF y el orden de imputación. Las páginas de [SPensiones, Capítulo XII](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html) y [Capítulo XI APVC](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html) respaldan el tratamiento previsional y la bonificación descritos, sujetos a las reglas de cada régimen.
- **Convenio TGR:** el artefacto `source-observation-tgr-2026-10-02.txt` limita correctamente la evidencia al producto de deudas vencidas de Impuestos Fiscales y Aduaneros. El fetch web de la página TGR falló; repetí la consulta en Chrome visible, expandí el acordeón de ese producto y comprobé hasta 24 cuotas según comportamiento de pago, pie de 10%–30% según comportamiento/garantía y mínimo de 1 UTM. La condición está atribuida solo a ese producto en el artículo.
- **Límite de acceso al PDF SII:** el lector web devolvió error al abrir el PDF de Línea 23. El enlace cargó en Chrome visible como documento de cinco páginas; el contenido detallado de §23.4 fue cotejado con el extracto completo suministrado para esta revisión. No se presenta el fallo del lector web como si fuera ausencia de respaldo oficial.

## Cumplimiento editorial

| Dimensión NORMA_YMYL §7 | Puntuación | Motivo |
|---|---:|---|
| Respuesta ancla (35%) | 3/10 | Es directa, pero la obligación universal que comunica es incorrecta. |
| Precisión y fuentes (25%) | 4/10 | La tasa y varias cifras están respaldadas; persisten errores sobre deber de declarar, propuesta F22 y base imponible. |
| Vigencia y calendario (15%) | 9/10 | AT2026, año de ingresos y fechas están explícitos y cotejados; el estado AT2027 se limita a páginas consultadas. |
| Excepciones y cobertura (15%) | 3/10 | Se menciona el umbral exento, pero se niega incorrectamente su efecto en la obligación de presentar. |
| Claridad y estructura (10%) | 8/10 | La estructura es completa y legible, pero repite los errores centrales en varias secciones. |
| **Total ponderado** | **4,65/10** | **No alcanza el mínimo de 9,5/10.** |

## Separación de funciones

| Rol | Evidencia disponible | Evaluación de round6 |
|---|---|---|
| DraftAgent | El paquete identifica el trabajo DraftAgent como continuación de cambios existentes y declara que no fue una sesión sin exposición previa. | La desviación de frescura del DraftAgent queda registrada; no se presenta como corregida por esta revisión. |
| ComplianceAgent round6 | Instancia independiente `/root/compliance_rentas_round6`, sin historial del trabajo DraftAgent antes de iniciar esta auditoría; verificación de fuentes en vivo propia. | Instancia distinta del DraftAgent. No hay violación de identidad Draft/Compliance en esta ronda. |
| ComplianceAgent round5 | `06-compliance-round5.md`, informe previo del mismo run. | Solo contexto histórico; no se usa como autoridad ni se reemplaza. |
| HumanEditor | No hay sign-off humano acreditado en la evidencia revisada. | Pendiente; este informe no firma publicación. |

La frescura no debe confundirse con la separación: que DraftAgent haya continuado una sesión previamente expuesta constituye la desviación de sesión declarada en el paquete; esta instancia Compliance es distinta e independiente. Esa independencia no elimina los defectos editoriales ni cierra las gates humanas.

## Reglas aplicadas y cierre

Se aplicaron `NORMA_YMYL.md` §§1.1, 5.1–5.4 y 7; `DEFINITION_OF_DONE.md` §2; las instrucciones YMYL de `AGENTS.md`; y `EDITORIAL_AI_PIPELINE.md` §§2, 4 y 8. La verificación contrastó la versión actual y `git diff HEAD`; no se editaron otros artefactos ni se ejecutaron tests o gates en esta pasada.

**Veredicto final: FAIL — publicación bloqueada por los tres defectos indicados.** La revisión round6 no marca `[X]`, no firma publicación y no modifica el packet.
