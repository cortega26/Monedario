# 45 — Fuentes primarias (pass5, consultadas 2026-09-29 UTC)

Método: `curl -s -A 'monedario-math-audit/1.0 (pass5)' --max-time 30 -o <archivo> <url>`
desde `/tmp/opencode/plan115-pass5/sources/`; extracción y normalización con Python
(`re.sub(<[^>]+>)` + `html.unescape`). Los hashes permiten detectar cambios de la
fuente; un tercero debe re-consultar, no confiar en estos extractos si el hash cambió.

| ID | Archivo | URL | sha256 |
|---|---|---|---|
| S1 | `faq-dap.html` | https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2738.htm | `9a4049e47a493280c941fc44fbe76e304543d7ade047d1744a683ce6b943c3bd` |
| S2 | `faq-honorarios.html` | https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_7297.htm | `857d9db78cd2f39d51527829b2b3ad2c843fe7e70351826c5cfaf3043f7b7f71` |
| S3 | `iusc-2026.html` | https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm | `a92c3df8f84121ff8a06285f183e817269314ff60e5bdb62bb8169cd334ed12d` |
| S4 | `at2026-personas.html` | https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html | `33ac2cb354aaa4ad3541668818d516ab21a154df5e534724c61686714d3362ff` |
| S5 | `utm2026.html` | https://www.sii.cl/valores_y_fechas/utm/utm2026.htm | `d6dc68096d7bc8eebd19d889277d1da15d7fe2dc7b3de4cc6cbd41ce1d89e0fb` |
| S6 | `leychile-6368.json` (DL 824 LIR) | https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=6368 | `85716958b904435dedfc710479a21ab6f6a06d26e59420622314ba25b49079da` |

## S1 — SII FAQ: intereses de depósitos a plazo de persona natural (D17)

- Fecha de actualización de la FAQ en la página: 31/03/2026.
- Extracto (sic, errores tipográficos del original):
  > "Los intereses de dicha inversión son rentas que están afectas al impuesto
  > Golobal Complemetario, por lo tanto, debe incorporarlos en la determinación
  > y considerar, el monto exento del Impuesto Global Complementario
  > correspondiente a 13,5 Unidades Tributarias Anuales (UTA). Debe considerar
  > que la excención otorgada a los intereses, en el cado de que la persona
  > natural obtenga únicamente rentas gravadas como sueldos o pequeños
  > contribuyentes, son rentas exentas si no superan las 20 UTM".
- Lectura: para residentes el interés DAP tributa en el IGC anual; la FAQ no
  menciona retención del banco. La retención del 4% vive en el art. 59 (S6).

## S2 — SII FAQ: tasas de retención de honorarios (D18/D20)

- Extracto:
  > "Las tasas de retenciones de honorarios, de acuerdo con cada año comercial,
  > son las siguientes: % AÑO COMERCIAL 10,75% 2020 11,50% 2021 12,25% 2022
  > 13,00% 2023 13,75% 2024 14,50% 2025 15,25% 2026 16,00% 2027 17,00% 2028".
- Lectura: la tasa se fija por **año comercial** (emisión de la boleta). Boletas
  emitidas en 2026 ⇒ 15,25% ⇒ se declaran en el AT2027, no en el AT2026
  (el AT2026 recibe las rentas del año comercial 2025, tasa 14,5%).

## S3 — SII tabla IUSC 2026 (D21)

- La página publica primero **Octubre 2026** (UTM 72.151):
  > "MENSUAL -.- $ 974.038,50 Exento ... $ 974.038,51 $ 2.164.530,00 0,04
  > $ 38.961,54 ... $ 22.366.810,01 Y MÁS 0,4 $ 2.800.901,82".
- Y **Septiembre 2026** (UTM 71.721):
  > "MENSUAL -.- $ 968.233,50 Exento ... $ 968.233,51 $ 2.151.630,00 0,04
  > $ 38.729,34 ... $ 22.233.510,01 Y MÁS 0,4 $ 2.784.209,22".
- Lectura: umbral exento = 13,5 UTM (968.233,50 en sep; 974.038,50 en oct);
  tope del 35% = 310 UTM (22.233.510 / 22.366.810); 40% sobre 310 con rebaja
  38,82 UTM (2.784.209,22 / 2.800.901,82). Fronteras y factores coinciden con el
  motor (`pass5.d21-compare.mjs`, evidence/50).

## S4 — SII AT2026 personas naturales (D18)

- Extractos:
  > "Tabla de cálculo del Impuesto Global Complementario vigente para el año
  > tributario 2026, para contribuyentes del artículo 52 de la LIR. ... $ 0,00
  > $ 11.265.804,00 Exento ... 0,04 $ 450.632,16".
  > "1 UTA del mes dic. de 2025 $ 834.504".
  > "13,5 UTA del mes dic. de 2025 $11.265.804".
  > "8.000 UF del 31.12.2025 $317.823.680".
- Lectura: el AT2026 usa la UTA de diciembre de **2025** (año comercial 2025);
  el umbral exento es 13,5 UTA = $11.265.804.

## S5 — SII UTM 2026 (cruce snapshot)

- La serie publicada incluye septiembre 71.721 y octubre 72.151.
- El snapshot del worktree en `c1701ad5` tiene `utm=71721` con
  `indicatorUpdatedAt.utm=2026-09-01` y `capturedAt 2026-09-29T18:15:26Z`:
  es la UTM vigente en la fecha de la auditoría (la de octubre entra en vigor el
  01-10-2026). 13,5 × 71.721 = 968.233,50 (SII sep), que el render muestra
  redondeado como `≈ $968.234`.

## S6 — LeyChile LIR (DL 824), art. 59 inc. 2° N°1 (D17)

- Extracto (las anotaciones de modificaciones de LeyChile interrumpen el texto;
  se cita el contenido sustantivo):
  > "Este impuesto se aplicará, con tasa 35%, respecto de las rentas que se
  > paguen o abonen en cuenta a personas a que se refiere el inciso primero por
  > concepto de: 1) Intereses. Estarán afectos a este impuesto, pero con una
  > tasa del 4%, los intereses provenientes de: a) Depósitos en cuenta corriente
  > y a plazo en moneda extranjera ... g) los instrumentos señalados en las
  > letras a), d) y e) anteriores, emitidos o expresados en moneda nacional."
- Lectura: el 4 % es Impuesto Adicional (art. 59) sobre rentas pagadas "a
  personas a que se refiere el inciso primero" (contribuyentes **no domiciliados
  ni residentes** en Chile); no es una retención de residentes. El alcance para
  residentes se rige por el IGC (S1/S4) y el motor `CalculateTermDeposit` no
  practica retención.
