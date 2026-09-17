# VERIFY — reforma-previsional-2025-que-cambia-y-como-te-afecta (2026-09-17)

**Rol:** ComplianceAgent, sesión fresca, sin contexto previo. No escribí los
cambios revisados.
**Alcance del veredicto:** SOLO el diff workdir (sin commit) de
`src/data/blog/reforma-previsional-2025-que-cambia-y-como-te-afecta.md`
(25 inserciones / 11 eliminaciones, un archivo).
**Contexto leído:** `docs/reports/AUDIT-reforma-previsional-2025-2026-09-17.md`
(2 alta F1–F2, 5 media F3–F7, 4 baja F8–F11; 5 NHV).
**Referencia de alcance:** `docs/reports/HUMAN-VERIFY-reforma-previsional-2025-2026-09-17.md`
(checklist humano previo; sin respuestas registradas en disco).
**Método:** adversarial (intentar rechazar). Re-fetch en vivo de SP
`w3-propertyvalue-10906.html` (tasa empleador), SP `w3-article-16708.html`
(NCG-350 BAC/CEV), SP `w3-article-16668.html` (fondos generacionales) y
Subsecretaría de Previsión Social 2026-03-26 (publicación/lagunas/PGU);
grep de remanentes prohibidos; comparación HEAD vs workdir con `git diff` y
`git show HEAD:<archivo>`.

## 1. Disposición por hunk

| Hunk | Contenido | Disposición + razón |
| --- | --- | --- |
| H1 (L7) | `updatedDate`: 2026-03-12 → 2026-09-17 | **ACCEPT.** Alinea frescura con el corte real (cierra F11: `updatedDate` ≥ `validAsOf`, mismo día). |
| H2 (L29) | `validAsOf`: 2026-04-12 → 2026-09-17 | **ACCEPT.** El corte 2026-04-12 era semánticamente falso al 2026-09-17 (tasa 1 % superada). Nueva fecha coincide con la tabla "Hoy". |
| H3 (L54, F1) | "promulgada el 20 de marzo de 2025 y publicada el 26 de marzo de 2025 (Ley 21.735)" | **ACCEPT.** Reproduce verbatim el fix prescrito por la auditoría. Corroborado: Subsecretaría 2026-03-26 ("publicada este miércoles", "promulgada la semana pasada") + export BCN citado en la auditoría. Caveat: LeyChile bloquea bots, así que el día exacto de promulgación (20-03) se hereda de la cita BCN de la auditoría, no de re-fetch propio. Sin evidencia en contrario. |
| H4 (L62–L63, F2) | Tasa: "Fue de 1 % entre agosto de 2025 y julio de 2026 y es de 3,5 % desde las remuneraciones de agosto de 2026 … hasta 7 % en agosto de 2033"; tramo directo "ese nuevo 3,5 %" | **ACCEPT.** SP-10906 en vivo: 01-08-2025→jul-2026 = 1 % (0,1 % individual + 0,9 % FAPP); 01-08-2026→jul-2027 = 3,5 % (0,1 % individual + 2,5 % SIS+CEV + 0,9 % CRP). Formulación "remuneraciones de agosto" es la correcta (pago septiembre). Endpoint 2033 preexistente, no es claim nuevo. |
| H5 (L66–L71, F10) | Mini-calendario: lagunas may-2025; BAC+CEV ene-2026; 3,5 % + 0,9 % CRP ago-2026; FG abr-2027 | **ACCEPT con nota.** Cada hito verifica: lagunas may-2025 con cargo a cuentas individuales (Subsecretaría 2026-03-26); BAC/CEV ene-2026 (NCG-350: "deberá comenzar a pagar en enero de 2026"); 3,5 %/CRP (SP-10906); FG abr-2027 (SP-16668). Nota: "opera/primer pago" afirma pago ocurrido; las fuentes spot establecen la norma (deber-pagar-desde) + anuncios previos, no confirmación de pago post-hoc (p. ej. reporte IPS). Sin evidencia en contrario; sigue el framing factual de la propia auditoría. No bloquea. Ver F8-nit abajo por "CRP" desnudo en L70. |
| H6 (L90–L91, F2+F8) | Tabla "Hoy (corte 2026-09-17)": 3,5 % = 0,1 % individual + 0,9 % CRP + 2,5 % SSP (SIS y CEV); 1 % historicizado | **ACCEPT.** Desglose 0,1/0,9/2,5 exacto contra SP-10906 en vivo. Primera mención sustantiva expande "Cotización con Rentabilidad Protegida (CRP)" (cierra F8 en lo sustantivo). Solo cambió el padding de la tabla, no el contenido de celdas "Después" (ver §3). |
| H7 (L95, F3) | Párrafo CRP: transitoria 30 años, 0,9 % desde remuneraciones ago-2026, reintegro con reajustes e intereses desde edad legal (60 M / 65 H), financia el BAC | **ACCEPT.** SP-10906 en vivo confirma cada elemento, incluida la vía de financiamiento del BAC. La CRP deja de ser abstracción futura: correcto. |
| H8 (L137, F4) | Regla BAC: pago desde ene-2026, vejez/invalidez 65+ (excepción trabajo pesado), 0,1 UF/año tope 25, 120 meses M / 240 H, gradualidad M (132/144/156/168/180 en 2028–2036), resta de anualidad si pensión desde ago-2025, exclusión Capredena/Dipreca | **ACCEPT.** Todos los parámetros verifican contra SP-16708 (NCG-350) en vivo, incluida la tabla de gradualidad y la anualidad-descuento. El dodge "no conviene prometer un monto fijo" fue eliminado (ver §2). |
| H9 (L139–L141, F5) | Bloque CEV: pago desde ene-2026, igualación vs hombre mismo saldo/edad/grupo, escala 100/75/50/25/15/5 % (65+→60), piso 0,25 UF/mes, tope 18 UF autofinanciada, cotización FAPP antes de los 50, incorporadas pre-01-08-2025 | **ACCEPT.** Escala, piso, tope y requisitos verifican contra SP-16708 en vivo fila por fila. La omisión total de CEV queda cerrada. |
| H10 (L205–L206) | +2 bullets en "Fuentes oficiales": Subsecretaría (publicación Diario Oficial) y SP cotización empleador (propertyvalue-10906) | **ACCEPT.** Adiciones puras de fuente (etiqueta + URL, cero prosa). Cubren exactamente las lagunas de sourcing que la auditoría marcó (NCG-350 ya estaba citada; faltaban página de cotización y publicación oficial). |

**Conteo:** 10 hunks aceptados / 0 rechazados.

## 2. Remanentes prohibidos (grep sobre el archivo actual)

| Patrón | Resultado |
| --- | --- |
| "julio de 2025 se promulgó" | No encontrado. Bien. |
| "1 % desde agosto de 2025" como tasa vigente | No encontrado. Las 3 menciones de "1 %" están historicizadas ("Fue de 1 % entre…", "entre … fue de 1 %"). Bien. |
| Dodge BAC "no conviene prometer un monto fijo" | No encontrado. Reemplazado por regla concreta (H8). Bien. |
| CEV ausente | Presente (encabezado L139 + párrafo L141). Bien. |
| "CRP" desnudo en primera mención | **Nit no bloqueante.** La primera ocurrencia en orden de lectura (L70, mini-calendario) usa "CRP" desnudo; la expansión aparece en L91 y L95. La definición existe, solo el orden es imperfecto. Pulido aplicable omitido (ver §5). |
| Monto PGU sep-2026 ($250.275 / "250") | No encontrado. Correctamente ausente (el monto solo tenía respaldo de prensa; la auditoría exigía confirmación IPS/ChileAtiende). Bien. |

## 3. Claims prospectivos (sin claims nuevos no verificados)

- Columna "Después" preservada verbatim contra HEAD (`git show HEAD:` L85–L87):
  "Sube gradualmente hasta llegar a **7 %** en agosto de 2033.",
  "La fracción directa sube gradualmente hasta **4,5 %** en 2033.",
  "La transición a fondos generacionales parte en **abril de 2027**.".
  Solo cambió el padding de pipes; el contenido de celda es idéntico.
- El endpoint 7 %/2033 en el bullet L62 reformula el claim preexistente, no
  agrega mecánica nueva (el calendario año a año sigue en NHV-1, BCN-dependiente).
- FG abr-2027 no agrega mecánica más allá de lo que SP-16668 declara
  (transición abr-2027; Régimen a publicar máx. sep-2026). Sin extralimitación.
- Sin nuevas fechas, tasas ni mecánicas inventadas en el diff.

## 4. Disciplina de alcance

- Diff del archivo objetivo: un solo archivo, 25+/11-. Sin cambios de
  slug, título, descripción, canonical/topic, categoría, cluster, pubDate,
  hero ni rutas/código.
- Frontmatter: solo `updatedDate` + `validAsOf`. Los +2 bullets son adiciones
  puras de fuente en el cuerpo, sin prosa editorial.
- No se coló F6 (sin bloque de vigencia/aprobado-rige-aplica),
  F7 (`dataTriggers: []` intacto, sin `volatileData`) ni F9
  (sin etiqueta "resumen orientativo"), tal como exige el alcance.
- Caveat de workdir: el repo tiene otras modificaciones no comprometidas
  ajenas a este pase (otros 3 slugs de blog + borrados masivos bajo
  `output/`). Este veredicto cubre EXCLUSIVAMENTE los hunks del archivo de
  reforma. No es bloqueante para este diff, pero se deja constancia.

## 5. Residuales (no aplicado → justificación)

| Ítem auditoría | Estado | ¿Genuinamente fuera de alcance? |
| --- | --- | --- |
| F6 bloque de vigencia legal | No aplicado | Sí. Requiere BCN (NHV-2, vigencia diferida 01-04-2027) con verificación humana; el checklist HUMAN-VERIFY ítem B sigue sin respuesta en disco. Diferimiento correcto. |
| F7 `volatileData`/`dataTriggers` | No aplicado | Sí. Requiere decisión humana de gobierno de datos (dataset vs triggers). Diferimiento correcto. |
| F9 etiqueta "resumen orientativo" | No aplicado | **Seguro y aplicable pero omitido por diseño.** Es una línea, pero el alcance de este pase la prohibía explícitamente ("must NOT have been smuggled in"). Cumplimiento correcto; queda como pulido diferido. Se lista aquí porque era lo único trivialmente aplicable y saltado. |
| F10 fila/monto PGU | No aplicado (monto ausente) | Sí. El monto sep-2026 solo tenía respaldo de prensa; la auditoría y HUMAN-VERIFY ítem F exigen confirmación IPS/ChileAtiende. Omisión correcta. |
| F11 alineación updatedDate/validAsOf | Aplicado (H1+H2) | N/A. Cerrado. |
| F8 orden de primera mención CRP | Parcial (nit L70) | Pulido trivial omitido: expandir o reordenar para que L70 no anteceda desnudo a L91. No bloqueante. |
| NHV-1, NHV-3, NHV-4, NHV-5 | Intactos | Sí. Todos BCN-dependientes (LeyChile bloquea bots). Sin tocar, como corresponde. |

## 6. Veredicto

**ACCEPT DIFF.** 10/10 hunks aceptados, 0 rechazados, 0 bloqueantes.
Residuales: F6, F7, F10-monto y NHV genuinamente fuera de alcance;
F9 y nit F8 como pulido diferido no bloqueante; caveat evidencial menor
sobre confirmación post-hoc de pagos ene-2026 (norma verificada, reporte de
pago IPS pendiente para un pase futuro).

## 7. Gates

- `pnpm exec prettier --check` sobre este reporte: PASS (ver salida).
- `git diff --check`: PASS (ver salida).
