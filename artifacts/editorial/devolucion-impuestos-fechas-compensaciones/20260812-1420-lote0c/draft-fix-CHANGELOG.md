# Draft fix changelog — devolución de impuestos

- Fecha: 2026-10-03, America/Santiago.
- Rol: DraftAgent editorial fresco. Este archivo registra la reparación; no es una auditoría ni un sign-off.
- Alcance: artículo, packet de publicación, este changelog y registro público de correcciones. Se preservaron los demás cambios del worktree.
- Contexto: `06-compliance-round7.md` no está en el checkout actual. Se recuperó desde `d4449ddd` como contexto autorizado; no se editó ni creó informe de compliance. Se repararon sus defectos #1 y #2.

## Cambios

- Se añadió la FAQ SII 001.140.0516.011 a `articleLead.officialSources` y a “Fuentes y referencias primarias”, además de citarla junto a la regla de que la devolución por rectificatoria llega alrededor de tres semanas después de la autorización a TGR.
- Se reemplazó la remisión general sobre multas fuera de plazo por el resumen respaldado por FAQ SII 001.140.3095.025: declaración con pago, reajuste del impuesto impago por IPC, multa de 10% si el atraso no supera cinco meses y, después, aumento de 2% por mes o fracción hasta 30%, más interés penal diario vigente por semestre; declaración con devolución o sin pago, multa entre 1 UTM y 1 UTA. El artículo no calcula una multa individual ni promete un resultado para un caso particular.
- Se añadió FAQ 001.140.3095.025 a `articleLead.officialSources` y a las fuentes del artículo.
- Se actualizó `updatedDate`, `articleLead.validAsOf` y la fecha visible de revisión a 2026-10-03. Es cambio sustantivo de cobertura según NORMA YMYL §5.1.
- Se refetchearon el 2026-10-03 [FAQ SII 001.140.0516.011](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0516.htm), actualizada el 2026-04-13, que aún dice “alrededor de tres semanas”, y [FAQ SII 001.140.3095.025](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_3095.htm), actualizada el 2025-07-03, que publica las reglas y rangos resumidos arriba.
- Para revalidar el corte temporal se refetchearon el [comunicado de Operación Renta AT2026](https://www.sii.cl/noticias/2026/310326noti01pcr.htm) (fechado 2026-03-31), la [FAQ de fechas AT2026](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8951.htm), la [FAQ de regularización](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0595.htm), la [página del SII sobre no declarar](https://www.sii.cl/contribuyentes/p7renta.htm), la [FAQ de rectificación AT2026](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8954.htm) y los [datos informativos AT2026](https://www.sii.cl/valores_y_fechas/renta/datos_informativos_2026.html). El comunicado y la FAQ mantienen el calendario ya publicado; las páginas de regularización y rectificación mantienen los canales citados.
- Para AT2027, se consultó el [portal de Renta destacado por el SII](https://www.sii.cl/destacados/index.html), que sigue presentando Renta 2026, los datos informativos AT2026 y la búsqueda oficial “Operación Renta AT2027 calendario”. Los recursos oficiales localizados siguen mostrando material AT2026; la noticia del SII del 2026-09-01 sobre una nueva DJ desde AT2027 no publica el calendario general. Al 2026-10-03 no se encontró calendario AT2027 publicado. Esto documenta una búsqueda negativa en el sitio oficial, no una declaración expresa del SII de que no existe calendario.
- El corte del packet se sincronizó en un Addendum, conservando intacto su checklist histórico. La tabla de fechas AT2026, el umbral de $3.000.000, slug, title, H1 y canonical no se modificaron.
- Se añadió una entrada material a `src/data/correcciones.json` conforme a NORMA YMYL §5.4.

## Variante editorial para el párrafo de sanciones

La FAQ publica mecánicas que podrían resumirse en una forma corta o detallada. Se eligió la variante detallada para conservar el reajuste por IPC y distinguir el cálculo del interés penal vigente por semestre sin trasladar una tasa semestral pasada al lector.

**Variante corta:** “Con pago, la multa es 10% si el atraso no supera cinco meses; luego aumenta 2% por mes o fracción hasta 30%, más interés penal. Con devolución o sin pago, la multa se regula entre 1 UTM y 1 UTA.”

**Variante larga elegida:** “En una declaración ‘con pago’, el impuesto impago se reajusta por IPC; la multa es 10% si el atraso no supera cinco meses y, después, aumenta 2% por cada mes o fracción de mes, con tope de 30% del impuesto adeudado, además del interés penal diario vigente para cada semestre. Si la declaración da devolución o queda ‘sin pago’, la multa se regula entre 1 UTM y 1 UTA. Estas reglas no determinan aquí el monto individual.”

## Cálculo y gates

- `requires_calculation=false`: los valores se transcriben de una FAQ oficial; no se derivó ni calculó ningún monto individual.
- `pnpm run check:frontmatter`: exit 0; escaneó 54 artículos; sin errores bloqueantes.
- `pnpm run check:links`: exit 0; escaneó 54 artículos publicados y 277 enlaces internos; sin enlaces rotos. Advierte un artículo huérfano: `src/data/blog/cotizacion-voluntaria-afp-independiente.md` (warning, no error).
- `pnpm run format:check`: exit 0; `All matched files use Prettier code style!`.
- `pnpm run check:correcciones`: exit 0; `OK. 12 entradas válidas en el registro.`
- No se marcó ningún gate `[X]`, no se firmó el packet y no se hizo commit.

## Follow-up R9 — alcance del calendario AT2027 (2026-10-03)

- Se acotó la frase de `articleLead.answer`, el párrafo “Próximo ciclo” y la
  nota de vigencia: en las páginas concretas consultadas no encontré un
  calendario general de fechas AT2027. El artículo distingue este hallazgo
  limitado de una negación expresa del SII y de lo que podría publicarse en
  otros recursos.
- Refetch en vivo del 2026-10-03: el [portal SII Operación Renta 2026](https://www.sii.cl/destacados/renta/2026/)
  muestra material del ciclo 2026; [datos informativos AT2026](https://www.sii.cl/valores_y_fechas/renta/datos_informativos_2026.html)
  lleva ese año en su título y selector; el [índice de noticias SII 2026](https://www.sii.cl/noticias/2026/index.html)
  lista el comunicado del calendario AT2026 del 31 de marzo y una noticia
  del 1 de septiembre sobre la DJ N°1965 desde Operación Renta 2027, pero no
  un calendario general AT2027. Las páginas se enlazaron junto a la
  afirmación y en las fuentes del artículo.
- `updatedDate`, `articleLead.validAsOf` y “Revisado el” se conservaron en
  2026-10-03 porque ya reflejaban la re-verificación hecha hoy; no moví la
  fecha de corte.
- Se amplió el registro material existente en `src/data/correcciones.json`
  sin crear otra entrada. No cambiaron la tabla AT2026, el umbral
  $3.000.000, el resumen de multas, slug, title, H1 ni canonical.
- No se reescribió el checklist histórico, no se creó artifact 05/06, ningún
  gate fue marcado `[X]` y no se firmó ni hizo commit.

### Gates del follow-up

- `pnpm run check:frontmatter`: exit 0; escaneó 54 artículos; sin errores
  bloqueantes.
- `pnpm run check:links`: exit 0; escaneó 54 artículos publicados y 277
  enlaces internos; sin enlaces rotos. Advierte un artículo huérfano:
  `src/data/blog/cotizacion-voluntaria-afp-independiente.md` (warning, no
  error).
- `pnpm run format:check`: exit 0; `All matched files use Prettier code
  style!`.
- `pnpm run check:correcciones`: exit 0; `OK. 12 entradas válidas en el
  registro.`

## Compliance closeout R10 — 2026-10-03

Fresh independent Compliance R10 (`06-compliance-round10.md`) returned
**PASS, 9.56/10**, with no open MUST. It independently refetched the two SII
FAQs governing the rectificatoria refund estimate and late-filing penalties,
and bounded the AT2027 statement to the named SII resources it consulted.
The article and packet remain pending HumanEditor publication sign-off. No
gate was marked, no signature was added, and no commit was made.
