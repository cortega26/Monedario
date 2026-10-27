# Draft fix changelog — descuentos-de-sueldo

- Fecha: 2026-10-20, America/Santiago.
- Rol: DraftAgent (Claude Code, sesión de redacción distinta de la que auditó). Este archivo registra la reparación; no es una auditoría ni un sign-off.
- Alcance declarado antes de editar: `src/data/blog/descuentos-de-sueldo.md`; recurrencias en `primer-empleo-chile-guia-completa.md`, `como-calcular-sueldo-liquido.md`, `liquidacion-de-sueldo.md` (solo el tope de 90 UF) y `src/data/laws/codigo-del-trabajo.md`; `src/data/correcciones.json`; una guarda de regresión; este run de artefactos. Fuera de alcance: slug/URL/canonical/title/seoTitle/description/topicRole, `seguro-de-cesantia`, #652, #536, experimento IPC, gates `[X]`.

## Cambios por hallazgo

- **F01 (P1):** sección nueva "Atrasos: descuento del tiempo no trabajado frente a multa" y FAQ reescrita. Separa el descuento del valor del tiempo no laborado (ORD. 1578/2018, 2423/2017) de la multa del reglamento interno (arts. 154 N°10 y 157 vía ORD. 680; hasta 25% de la remuneración diaria). Causa ajena a la voluntad (ORD. 2000-44737/2026): el atraso justificado no es una falta; si el trabajador queda a disposición, el tiempo es jornada pasiva y se paga; con fuerza mayor que impide del todo la prestación pueden suspenderse las obligaciones de trabajar y remunerar, caso a caso; la recuperación de horas es un acuerdo voluntario. No se afirma nada sobre "atraso recuperado" más allá de lo que dicen esos dictámenes.
- **F02 (P1):** la cuota sindical sale de "autorizados" y pasa a "legales" con la cita de ORD. 4184/70 y 443/2026 (la renuncia avisada al empleador no basta por sí sola; la controversia sobre afiliación no la resuelve el empleador). FAQ nueva.
- **F03 (P1):** el crédito social de una CCAF sale de "autorizados" y pasa a "legales" (art. 22 Ley 18.833; ORD. 262/4). Se distingue el consentimiento para endeudarse de la retención por planilla. FAQ reescrita. ORD. 4527/93 no se usa (el handoff lo sobreinterpreta; ver dossier).
- **F04 (P1):** se eliminan las dos frases "todos se calculan sobre el imponible" y se agrega la tabla "Sobre qué se calcula cada descuento" (AFP/salud 90 UF; cesantía 135,2 UF; impuesto único sobre renta líquida imponible; convenidos sobre remuneración total bruta; cuota sindical y CCAF fuera del 45%).
- **F05 (P1):** `officialSources[0]` pasa de la consulta DT 60593 (indemnización por años de servicio) al ORD. N°680 con etiqueta honesta ("artículo 58 y multas del reglamento interno"). Se agregan ORD. 262/4, ORD. 4184/70, AFC y SP topes 2026.
- **F06 (P2):** cesantía con tope 135,2 UF, 11 años por relación laboral (0,8% al FCS después), exclusiones (pensionados) y fila de la tabla de contrato con el matiz.
- **F07 (P2):** salud "7% de la remuneración imponible hasta 90 UF (6,3 UF como máximo)"; se mantiene la distinción 7% legal / precio adicional del plan Isapre. Misma precisión en `liquidacion-de-sueldo`.
- **F08 (P2):** topes de 15%, 30% (solo mutuos/créditos sin interés del empleador para vivienda o educación, si el empleador paga la cuota directamente) y 45% en conjunto, base remuneración total bruta, ejemplo de $1.000.000, nota sobre cooperativas, y FAQ de retención con los topes.
- **F09 del informe (P2, no incluido en el handoff):** `validAsOf`, `updatedDate` y "Revisado el" alineados a 2026-10-20.
- **O1 / O2 (fuera de F01–F08):** ver `02-dossier.md` ("Divergencias" 7 y 8). Requieren verificación explícita del auditor.

## Metadatos y registros

- `volatileData`: se declaran `pensions.previsional.monthly_taxable_cap_uf` (90) y `economic.afc.monthly_taxable_cap_uf` (135,2) con `sync: strict`; ambos se agregan a `dataTriggers`.
- `reviewPolicy.computedAt` **sin cambio** (`2026-10-04`): alimenta `lastReviewed/reviewedBy` público.
- `updatedDate` de las páginas relacionadas y `lastVerified` de `codigo-del-trabajo.md` **sin cambio**: el HumanEditor decide si corresponde moverlos (NORMA_YMYL §5.1 vs. no afirmar frescura de afirmaciones no re-verificadas).
- `src/data/correcciones.json`: entrada nueva `descuentos-sueldo-clasificacion-bases-atrasos` con fecha 2026-10-20 (ajustar a la fecha de publicación al fusionar). La entrada del 2026-10-19 cita la consulta 60593 como fuente del art. 58; **no se reescribió** (NORMA_YMYL §5.4): la nueva entrada lo declara.

## Gates ejecutados (en el worktree `fix/descuentos-de-sueldo-art58-2026-10-20`)

Ver el bloque "Evidencia de gates" de `07-publish-packet.md`.

## Lo que no se hizo

- No se generó `05-math-audit.md` ni `06-compliance.md`; no se completó ningún `02-result.json`; no se marcó ningún gate `[X]`; no se firmó nada.
- No se corrió `pnpm run build` completo ni se inspeccionó el JSON-LD generado (ver packet).
- No se hizo commit ni push.
