# ADR-20261027-payroll-rules-single-source

Date: 2026-10-27
Status: Proposed

## Context

La corrección de `descuentos-de-sueldo` (PR #719) requirió **seis rondas de
auditoría** y produjo ~20 defectos. Ninguno era un error de cálculo del motor:
eran divergencias entre copias del mismo hecho.

El caso testigo: el aporte de **0,6% al seguro de cesantía**. La Ley 19.728
(art. 5) exceptúa de él a los trabajadores de casa particular, donde el 3% es
íntegramente del empleador. Ese hecho —número **más** condición— estaba
replicado en:

- `CalculateMonthlyPayrollBase.ts:95` (`0.6` hardcodeado),
  `:108` (`0.07` de salud);
- `resultRenderer.ts:300` (`0.024` / `0.03` de costo patronal), donde vivía el
  defecto que calculaba 2,4% para casa particular;
- tres calculadoras (`sueldo-liquido`, `apv`, `operacion-renta`), cada una con
  su propio ternario de tipo de contrato;
- copy, FAQ, FAQ estructurada (`CalculatorJsonLd`), notas metodológicas,
  glosarios, resúmenes de ley y `config/sueldoClusterLinks.ts`.

Diecisiete archivos mencionan "0,6%"; varios por motivos ajenos (costos de
cierre, probabilidades). Esa ambigüedad hizo fracasar dos intentos de guarda
basada en texto: una pasaba una afirmación falsa (`"casa particular: 0,6%"`) y
la otra producía falsos positivos sobre prosa correcta.

**Contraste empírico:** los parámetros económicos (UF, UTM, IMM) **no
divergieron ni una vez** en las seis rondas. No es suerte: están centralizados,
effective-dated y consumidos por el motor vía `economicParameters`
(`ADR-20260929-effective-dated-economic-parameters`). Las tasas de nómina son
la única familia que quedó hardcodeada.

El patrón del defecto no es "el número está en dos lugares", sino **"el número
viajó sin su condición"**. D3, D4, D6, D7, D13 y D14 comparten esa forma.

## Decision

1. **Registro `PayrollRules` effective-dated** en `src/domain/payroll/`, con la
   misma semántica que `EffectiveDatedParameters`: período explícito, vigencia
   `[effectiveFrom, effectiveTo)`, `publicationDate` separada de la vigencia y
   **fallo cerrado** si un concepto o período no está registrado. Nunca se
   asume el valor vigente.

2. **La unidad de conocimiento es la regla, no el número.** Cada entrada
   declara valor, base, tope, contratos a los que aplica, excepciones con su
   fundamento legal y vigencia:

   ```ts
   {
     id: "afc.worker",
     rate: 0.006,
     base: "taxable",
     cap: { kind: "uf", value: 135.2 },
     appliesTo: ["indefinido"],
     exceptions: [
       { contractType: "casa-particular", rate: 0, legalBasis: "Ley 19.728 art. 5" }
     ],
     effectiveFrom: "2026-04-26",
     source: "https://www.bcn.cl/leychile/navegar?idNorma=184979"
   }
   ```

   Una regla sin `exceptions` declaradas es una afirmación de que no las tiene,
   no un olvido.

3. **El conjunto de tipos de contrato sale del registro.** Añadir uno nuevo es
   un cambio en un lugar, no tres ternarios en tres páginas. `parseContractType`
   (introducido en #719) pasa a derivarse del registro en vez de enumerar
   valores.

4. **El motor y el renderizador no hardcodean tasas.** `CalculateMonthlyPayrollBase`,
   `CalculateNetSalary`, `CalculateApvComparison`,
   `EstimateUnemploymentCoverage` y `resultRenderer` leen del registro. Las tres
   calculadoras consumen el mismo modelo.

5. **La prosa NO se templatiza.** El copy YMYL necesita contexto y matices; un
   CMS de plantillas produce texto robótico y pierde precisamente lo que hizo
   pasar F01–F08. Se sigue escribiendo a mano.

6. **Se verifica cada mención, no solo la fuente.** Nuevo gate
   `check:payroll-consistency`: contrasta las cifras publicadas en prosa contra
   el registro que las gobierna.

   **Alcance corregido tras la implementación (2026-10-27).** El diseño original
   prometía cubrir D3/D4/D6/D7/D13/D14. Al construir el gate se comprobó que un
   registro plano solo puede verificar los hechos que **tienen** fuente única:

   | Hecho | ¿Verificable hoy? |
   |---|---|
   | Comisiones de AFP (D2, D7) | **Sí** — `afpCommissions.ts`, validado contra Previred |
   | Tasas de nómina (AFC, salud) | **Sí** — `PayrollRules` |
   | SIS (D4) | **No** — el clúster usa 1,49% (boletas/SII), 1,62% (independientes), 2,5% (CEV patronal) y 1,87% (dependiente, erróneo): son conceptos distintos por régimen, no un número |
   | Ventana de cambio de AFP (D8) | **No** — distingue primer cambio, cambios posteriores y licitación |
   | Bases y topes en prosa (D13, D14) | **No** — dependen del motor, no de una tabla |

   Registrar "SIS" como valor único habría creado un nuevo error de fuente
   única, exactamente el riesgo que este ADR advierte. Por eso el gate declara
   su cobertura en la cabecera y el registro debe modelar **régimen y período**
   antes de incorporarlos. Un exit 0 significa "las comisiones de AFP son
   coherentes", no "el clúster es correcto".

7. **Las citas legales no se centralizan.** Cada cita es un juicio sobre qué
   prueba una fuente; D15 fue exactamente una cita mal aplicada y ningún
   registro lo habría detectado.

## Consequences

- Un cambio de tasa toca un archivo y todas las superficies quedan cubiertas;
  el gate señala las menciones que no coinciden.
- El registro obliga a declarar la excepción al definir la regla, que es donde
  se perdió en las seis rondas.
- Costo: migrar tasas existentes, reescribir el clúster contra el registro y
  construir el gate. Es trabajo de causa 2, no de un PR de corrección.
- Riesgo: un registro mal modelado puede volverse una fuente única de error.
  Se mitiga con pruebas por regla (valor, base, tope, excepción vigente) y con
  el contraste contra la fuente primaria en la revisión.
- El patrón queda disponible para otras familias (impuesto único, topes
  previsionales) sin duplicar el dataset.

## Alternatives considered

- **Templatizar los artículos desde un CMS o JSON.** Rechazado: destruye la
  voz editorial y la capacidad de matizar, que es lo que la auditoría de
  compliance evalúa.
- **Un `include` de markdown compartido entre artículos.** Rechazado: mantiene
  la duplicación (cada artículo sigue teniendo su copia) y rompe el contexto de
  cada página.
- **Guarda estática de texto.** Rechazada tras dos intentos: una pasó una
  afirmación falsa (3/3) y la otra generó falsos positivos sobre prosa correcta.
  Un guard ruidoso se desactiva y deja de proteger.
- **No hacer nada y confiar en la auditoría.** Rechazado: seis rondas y ~20
  defectos por el mismo patrón es el coste empírico de esa opción.
- **Centralizar solo los números.** Rechazado: es exactamente lo que ya estaba
  a medias y produjo D3/D4/D6/D7/D13/D14, donde el número es correcto y la
  condición falta.

## Verification

- `pnpm exec vitest run tests/domain/payroll/` — una prueba por regla: valor,
  base, tope, excepciones por contrato y fallo cerrado ante período no
  registrado.
- `pnpm run check:content-consistency` — debe fallar contra el estado previo del
  clúster (D3, D4, D6, D7, D13, D14) y pasar tras la remediación.
- Contraste manual contra fuente primaria en la primera carga del registro
  (BCN Ley 19.728 arts. 5 y 9; AFC; SII; SP).
- `pnpm run test`, `astro check`, `pnpm run build`.

## Follow-ups

- Cerrar D1–D8, D13, D14 y D16 al migrar el clúster (ver
  `docs/backlog/PLAN-causa2-afc-consistency-2026-10-27.md`).
- Evaluar la migración de las tasas de impuesto único y topes previsionales al
  mismo registro una vez estabilizado.
- Retirar la guarda estructural `afc-casa-particular-guard.test.ts` cuando el
  gate de consistencia cubra su caso; mantener mientras tanto la prueba de
  mapeo `tests/utils/contractType.test.ts`.
