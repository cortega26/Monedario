# PLAN — Causa 2: fuente única de reglas de nómina y cierre del clúster AFC

**Estado:** Backlog — listo para ejecución por fases.
**Origen:** waiver de publicación del PR #719 (2026-10-27) y
`ADR-20261027-payroll-rules-single-source`.
**Fecha:** 2026-10-27
**Riesgo:** R3–R4 (YMYL: montos de cotización que la gente usa para verificar su
liquidación).
**Contrato que cambia:** tasas de nómina pasan de constantes dispersas a un
registro effective-dated. Requiere el ADR citado.

## 1. Problema

La corrección de `descuentos-de-sueldo` necesitó seis rondas de auditoría y
produjo ~20 defectos, casi todos divergencias entre copias del mismo hecho. El
aporte de 0,6% al seguro de cesantía aparecía en 17 archivos y viajaba **sin su
condición**: la Ley 19.728 exceptúa de él a los trabajadores de casa particular.

Diez defectos quedaron abiertos y diferidos a esta causa. Ninguno está en la
página corregida por #719.

## 2. Defectos que cierra este plan

| ID | Archivo | Qué |
|---|---|---|
| D1 | `src/data/laws/codigo-del-trabajo.md:54` | Tope de gratificación con IMM vencido ($539.000 → publica $2.560.250) |
| D2 | `src/data/blog/como-calcular-sueldo-liquido.md` | AFP Capital rotulada con la comisión de Modelo (0,58%) |
| D3 | `src/data/blog/primer-empleo-chile-guia-completa.md:194` | "3% al FCS" en plazo fijo; el 3% se reparte distinto |
| D4 | `src/data/blog/primer-empleo-chile-guia-completa.md:134` | SIS 1,87% vs 1,78% vigente |
| D6 | `src/data/blog/primer-empleo-chile-guia-completa.md:110,222,225` | 10,5% rotulado "ahorro previsional" |
| D7 | `src/data/laws/dl-3500-sistema-afp.md:31` | Rango de comisiones 0,58–1,45% vs 0,46–1,45% |
| D8 | `src/data/blog/primer-empleo-chile-guia-completa.md:142,267` | 12 meses para cambiarse de AFP; son 24 |
| D13 | `src/data/blog/como-calcular-sueldo-liquido.md:104,245,252` | Todos los descuentos "sobre imponible" |
| D14 | `src/data/blog/como-calcular-sueldo-liquido.md:133` | Fonasa 7% sin tope de 90 UF |
| D16 | `src/data/correcciones.json` | La entrada de #719 no consigna el cambio material completo |

Fuera de alcance: **D5** (defecto del paquete de auditoría, no bloquea) y
**D18** (se cierra en la firma humana de #719).

## 3. Fases

### Fase 0 — Aprobación del contrato

- [ ] Aprobar `ADR-20261027-payroll-rules-single-source`.
- [ ] Confirmar el modelo de datos de la regla con una carga piloto de dos
      conceptos (`afc.worker`, `health.legal`) antes de migrar todo.

### Fase 1 — Registro `PayrollRules`

- [ ] Crear `src/domain/payroll/PayrollRules.ts` + registro effective-dated.
- [ ] Cargar como mínimo: `afc.worker`, `afc.employer` (CIC/FCS),
      `health.legal`, topes previsional y AFC, y las excepciones por tipo de
      contrato con su fundamento legal.
- [ ] Fallo cerrado ante concepto o período no registrado.
- [ ] Pruebas por regla: valor, base, tope, excepción vigente y período ausente.
- [ ] Contrastar cada valor con su fuente primaria en la revisión (BCN, AFC,
      SII, SP).

### Fase 2 — Migración del motor y las calculadoras

- [ ] `CalculateMonthlyPayrollBase`, `CalculateNetSalary`,
      `CalculateApvComparison`, `EstimateUnemploymentCoverage` leen del registro;
      sin tasas hardcodeadas.
- [ ] `resultRenderer` deja de decidir la tasa patronal con un ternario.
- [ ] Los tipos de contrato y `parseContractType` se derivan del registro.
- [ ] La calculadora de cobertura (`seguro-cesantia.astro`,
      `EstimateUnemploymentCoverage`) gana `casa-particular` como tipo
      representable.
- [ ] Sin cambios de copy en esta fase.

### Fase 3 — Gate `check:payroll-consistency` (parcial, en curso)

- [ ] Extraer afirmaciones numéricas de la prosa (porcentajes, UF, meses, años).
- [ ] Asociarlas a una regla por contexto y fallar si contradicen el valor o
      omiten su condición.
- [ ] Lista explícita de lookalikes legítimos (costos de cierre, probabilidades,
      fechas) para evitar los falsos positivos que hundieron las guardas de
      texto.
- [ ] Verificar que **falla** contra el estado actual del clúster (debe señalar
      D3, D4, D6, D7, D13, D14) y que pasa tras la remediación.
- [ ] Integrarlo en `check:ci` **solo después** de la Fase 4: hoy falla a
      propósito contra el clúster (D2).

**Hallazgo de implementación (2026-10-27):** el gate cubre comisiones de AFP
(registro existente y validado contra Previred) y falla correctamente sobre D2.
No puede cubrir SIS ni la ventana de cambio de AFP con un registro plano:
"1,49%", "1,62%", "2,5%" y "1,87%" son conceptos distintos por régimen. Antes
de ampliarlo hay que modelar régimen y período, o se crea un nuevo error de
fuente única.

### Fase 4 — Remediación del clúster

- [ ] D1, D2, D7: resúmenes de leyes contra fuente vigente.
- [ ] D3, D4, D6, D8: `primer-empleo` contra registro y SP.
- [ ] D13, D14: `como-calcular-sueldo-liquido` contra el modelo de bases/topes.
- [ ] D16: completar la entrada de `correcciones.json` de #719.
- [ ] Re-auditoría de compliance del clúster completo (sesión y familia
      distintas de la redacción).

## 4. Criterios de aceptación

- [ ] Cero tasas de nómina hardcodeadas fuera del registro
      (`grep` de control en CI o prueba de imports).
- [ ] `check:content-consistency` en `check:ci` y en CI.
- [ ] D1–D8, D13, D14 y D16 cerrados con evidencia o reasignados por escrito.
- [ ] Re-auditoría del clúster con veredicto `PASS` o defectos justificados.
- [ ] `pnpm run test`, `astro check`, `pnpm run build` verdes.

## 5. Lo que este plan NO hace

- No templatiza los artículos ni mueve la prosa a un CMS.
- No centraliza las citas legales: cada una exige juicio propio (D15 fue una
  cita mal aplicada y ningún registro la habría detectado).
- No toca #719 ni reabre su auditoría.
- No cambia URLs, slugs ni canonical.

## 6. Riesgo y rollback

- **Riesgo principal:** un registro mal modelado se convierte en fuente única de
  error. Mitigación: pruebas por regla y contraste con fuente primaria en la
  revisión; cargas por fase, no todo de una vez.
- **Rollback:** el registro es aditivo. Revertir la Fase 2 devuelve las
  constantes al motor; la Fase 1 y la Fase 3 pueden quedarse sin efecto sobre
  producto.

## 7. Por qué ahora

Seis rondas de auditoría por un artículo demuestran que el problema no es la
página: es que el hecho vive en diecisiete lugares y ninguno verifica a los
demás. Centralizar el valor sin la condición ya se intentó a medias y produjo
seis de los diez defectos listados.
