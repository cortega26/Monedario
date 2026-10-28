# HANDOFF — Causa 2, fase 4: remediación del clúster AFC

**Estado:** listo para una sesión de redacción nueva. **No ejecutar en la sesión
que redactó la corrección de `descuentos-de-sueldo` ni en la que audita.**
**Origen:** waiver de #719 y `docs/backlog/PLAN-causa2-afc-consistency-2026-10-27.md`.
**Prerrequisitos ya en `main`:** `ADR-20261027-payroll-rules-single-source`,
`src/domain/payroll/PayrollRules.ts` (#747) y el gate parcial
`check:payroll-consistency` (#748).
**Riesgo:** R4 (YMYL).

## 1. Objetivo

Cerrar los diez defectos que el waiver de #719 difirió a esta causa, y **activar
el gate `check:payroll-consistency` en `check:ci`** una vez que pase.

Los defectos están en páginas que **no** son `descuentos-de-sueldo`: ese artículo
ya se corrigió y auditó. No lo reabras.

## 2. Reglas de la sesión

1. **R1 del protocolo:** ninguna cifra de memoria. Todo número se obtiene
   ejecutando código y se adjunta la salida.
2. **No cambies slugs, URLs, canonical ni `topicRole`.**
3. **No marques gates `[X]`** en ningún `07-publish-packet.md`.
4. **No audites tu propio trabajo.** Al terminar, otra sesión y otra familia de
   modelo hacen la auditoría de compliance.
5. **Máximo 2 causas en vuelo.** Esta es una.
6. Si un defecto no se puede verificar con fuente primaria, **no lo corrijas a
   ciegas**: márcalo como no verificable y explica por qué.

## 3. Defectos y qué exige cada uno

| ID | Archivo | Qué hacer | Verificación exigida |
|---|---|---|---|
| **D1** | `src/data/laws/codigo-del-trabajo.md:54` | Recalcular el tope de gratificación con el IMM vigente (`economicParameters.imm` = $553.553, no $539.000) | Ejecutar el cálculo; el resultado debe ser $2.629.376,75 |
| **D2** | `src/data/blog/como-calcular-sueldo-liquido.md:181,187` | AFP Capital está rotulada con la comisión de Modelo (0,58%, total 10,58%). Corregir a **1,44% / 11,44%** y **recalcular todo el ejemplo** | `pnpm run check:payroll-consistency` debe pasar; recomputar con código, no a mano |
| **D3** | `src/data/blog/primer-empleo-chile-guia-completa.md:194` | Dice "3% al FCS" en plazo fijo; el 3% se reparte 2,8% CIC + 0,2% FCS | Cotejar con `PayrollRules` (`afc.employer`) y BCN art. 9 |
| **D4** | `primer-empleo…:134` | SIS "1,87%". Verificar la tasa vigente del régimen **dependiente** (el cluster usa además 1,49% boletas, 1,62% independientes y 2,5% CEV: son regímenes distintos) | Fuente SP. **No crear un registro SIS único**; el régimen importa |
| **D6** | `primer-empleo…:110,222,225` | "10,5% ahorro previsional" mezcla 10% de ahorro con la comisión | Separar 10% + comisión; contrastar con `afpCommissions.ts` |
| **D7** | `src/data/laws/dl-3500-sistema-afp.md:31` | Rango de comisiones 0,58–1,45%; el mínimo vigente es 0,46% (AFP Uno) | `check:payroll-consistency` y `afpCommissions.ts` |
| **D8** | `primer-empleo…:142,267` | Afirma 12 meses para cambiarse de AFP. **La auditoría dice 24: verifícalo en la SP antes de tocar el texto.** La regla distingue primer cambio, cambios posteriores y traspaso por licitación | Fuente SP primaria. Si la regla es contextual, explícala; no sustituyas un número por otro |
| **D13** | `como-calcular-sueldo-liquido.md:104,245,252` | Afirma que todos los descuentos van sobre el imponible | Usar el modelo de bases de `descuentos-de-sueldo` (tabla por descuento) |
| **D14** | `como-calcular-sueldo-liquido.md:133` | Fonasa 7% sin el tope de 90 UF, y llama "copago" al precio adicional del plan Isapre | Cotejar con `economicParameters.previsionalTopes` y Superintendencia de Salud |
| **D16** | `src/data/correcciones.json` | La entrada `descuentos-sueldo-clasificacion-bases-atrasos` no consigna el cambio material completo (pérdidas de caja, daños de herramientas, mercadería) | Completar `wrong`/`fixed` con lo que realmente cambió en #719 |

## 4. Después de corregir

1. **Activar el gate**: añadir `check:payroll-consistency` a `check:ci` en
   `package.json`. Solo cuando pase en verde.
2. **Ampliar cobertura** si el registro ya lo permite. Si quieres cubrir SIS o la
   ventana de cambio de AFP, primero hay que modelar **régimen y período** en el
   registro: un valor plano de "SIS" sería un error nuevo, no una mejora.
3. **Criterios de aceptación:**
   - [ ] D1, D2, D3, D4, D6, D7, D13, D14, D16 cerrados con fuente.
   - [ ] D8 resuelto o marcado no verificable con razón escrita.
   - [ ] `check:payroll-consistency` verde y en `check:ci`.
   - [ ] `pnpm run test`, `astro check`, `pnpm run build`, `check:editorial`.
   - [ ] Entrada de `correcciones.json` completa (D16).
   - [ ] Auditoría de compliance en sesión y familia distintas.

## 5. Lo que NO hace esta sesión

- No toca `descuentos-de-sueldo.md`: ya está corregido y auditado.
- No cambia `PayrollRules` para meter SIS sin modelar régimen.
- No reabre #719 ni su waiver.
- No crea URLs nuevas ni páginas de auditoría.
- No firma ni publica: la firma es del owner.

## 6. Rollback

Revert por defecto de los commits de contenido. Si se activó el gate en
`check:ci`, retirarlo en el mismo revert para no dejar `main` en rojo.

## 7. Contexto que conviene leer antes de escribir

- `docs/adr/ADR-20261027-payroll-rules-single-source.md` — por qué el número no
  se centraliza sin su condición.
- `src/domain/payroll/PayrollRules.ts` — fuente de las tasas de nómina.
- `src/config/afpCommissions.ts` — fuente de comisiones (validada contra Previred).
- `docs/editorial/audits/descuentos-de-sueldo-20261020/13-owner-waiver-2026-10-27.md`
  — los diez defectos y por qué se difirieron.

## 8. Advertencia sobre D8

La auditoría afirma que son 24 meses, pero la regla real distingue situaciones
(primer cambio tras la asignación por licitación, cambios posteriores, traspaso).
Es el defecto con más probabilidad de convertirse en un número nuevo igual de
incompleto. **Verifica la fuente antes de escribir, y si la regla es contextual,
explica el contexto en vez de sustituir una cifra por otra.**
