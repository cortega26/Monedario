# Revisión editorial asistida — `boleta-honorarios-2026-retencion-cobertura`

- **Fecha del paquete:** 2026-11-19
- **SLA:** 90 días · venció 2026-11-10 (`articleLead.validAsOf: 2026-08-12`)
- **Estado:** sin error material; **cuatro precisiones** y una ventana de
  cobertura ausente. Firma humana pendiente.
- **Alcance:** investigación y checklist. No se editó el artículo ni se
  movió ninguna fecha.

## Metadatos

| Campo | Valor |
| --- | --- |
| Archivo | `src/data/blog/boleta-honorarios-2026-retencion-cobertura.md` |
| Cadencia | `impuestos`: 90 días, `manual_review` |
| `validAsOf` | 2026-08-12 |
| Pin volátil | `economic.imm.value` = 553.553 (`strict`) |
| Fuentes declaradas | SII (boletas), ChileAtiende (cotización) |
| Gate | `check:editorial-timeliness` |

## Confirmado contra el SII y ChileAtiende (2026-11-19)

| Dato del artículo | Valor oficial | Estado |
| --- | --- | --- |
| Retención 2026 | **15,25 %** desde el 01-01-2026 | Coincide |
| Escalamiento 2025–2028 | 14,5 % → 15,25 % → 16 % → 17 % | Coincide |
| Retención 2028 | 17 % (nivel permanente) | Coincide |
| Base de cotización anual | **80 %** del bruto anual de boletas del año anterior | Coincide |
| Umbral de cotización | bruto 2025 **igual o superior a 5 IMM** | El artículo dice «sobre» |
| Monto del umbral | **$2.767.765** (5 × $553.553) | El artículo no lo publica |
| Exención por monto | bruto 2025 **inferior** a 5 IMM | Coincide |
| Ejemplo $100.000 | retención $15.250; líquido $84.750 | Coincide |
| Ejemplo $500.000 | retención $76.250; líquido $423.750 | Coincide |

Fuentes:

- [SII — Aumento gradual de la retención](https://www.sii.cl/destacados/boletas_honorarios/aumento_gradual.html).
- [SII — Noticia 26-12-2025: retención 15,25 % en 2026](https://www.sii.cl/noticias/2025/261225noti01smn.html).
- [ChileAtiende — Cotización de trabajadores que emiten boletas de honorarios](https://www.chileatiende.gob.cl/fichas/12016-cotizacion-de-trabajadores-que-emiten-boletas-de-honorarios).

## Precisión 1 — la ventana de cobertura no aparece

La ficha oficial dice que la cotización de la Operación Renta 2026 otorga
cobertura **desde el 1 de julio de 2026 hasta el 30 de junio de 2027**. El
artículo habla de «cobertura anual» sin fechas. Es el dato que más busca un
lector independiente: agregarlo en la respuesta rápida y en la sección de
cobertura.

## Precisión 2 — el umbral es «igual o superior», no «sobre»

La ficha oficial: si el bruto 2025 fue **igual o superior a cinco IMM**,
corresponde cotizar; si fue **inferior**, hay exención por monto. La tabla
del artículo dice «sobre 5 IMM» y «bajo 5 IMM», lo que deja fuera el caso
exacto de 5 IMM. Cambiar a «igual o superior» y «menor que».

## Precisión 3 — publicar el monto del umbral

El umbral de 2025 es **$2.767.765** (5 × $553.553). El artículo remite a
«5 IMM» sin el monto; agregarlo evita que el lector tenga que buscarlo.

## Precisión 4 — faltan dos exenciones por perfil

La ficha oficial enumera, además de la exención por monto y los pensionados
(salvo invalidez parcial):

- hombres que al 1 de enero de 2018 tenían **55 años o más**;
- mujeres que al 1 de enero de 2018 tenían **50 años o más**;
- personas afiliadas a un régimen distinto a las AFP.

El artículo menciona «edad de corte» y «régimen distinto a AFP» en una
recomendación, pero no los desarrolla. Agregarlos a la tabla de perfiles o a
la sección de cobertura.

## Sin corrección material

No encontré un monto, tasa o plazo **incorrecto**: la retención, el
escalamiento, la base del 80 % y los ejemplos cuadran. Las cuatro precisiones
son mejoras de exactitud y completitud, no una corrección de un dato falso.
Por eso **no** propongo una entrada en `correcciones.json`; si la firma humana
considera que el cambio de «sobre» a «igual o superior» es material, puede
registrarse igualmente.

## Pendiente de verificación humana

1. **IMM usado para el umbral.** La ficha oficial publica $2.767.765, que
   corresponde a 5 × $553.553 (IMM 2026). Confirmar que ese es el valor que
   el SII aplicará a las rentas 2025 y no el IMM de 2025.
2. **Retención como PPM.** El artículo no dice explícitamente que la
   retención mensual se imputa al impuesto anual; confirmar si conviene
   agregarlo.
3. **Cobertura y reforma previsional.** La Ley 21.735 incorpora la
   Cotización con Rentabilidad Protegida; verificar si afecta la cobertura de
   honorarios a partir de 2027 y si el artículo debe adelantarlo.

## Cierre

- [ ] Agregar la ventana 01-07-2026 a 30-06-2027.
- [ ] Cambiar «sobre 5 IMM» por «igual o superior a 5 IMM».
- [ ] Publicar el umbral de $2.767.765.
- [ ] Agregar las exenciones de edad (55/50 al 01-01-2018) y régimen
  distinto a AFP.
- [ ] `pnpm run check:editorial-timeliness`,
  `check:economic-source-consistency` y `check:correcciones`.
- [ ] Actualizar `articleLead.validAsOf` solo con la fecha real de la
  revisión.

La próxima revisión natural cae en **febrero de 2027**.
