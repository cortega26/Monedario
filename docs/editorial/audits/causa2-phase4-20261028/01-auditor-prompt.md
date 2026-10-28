Role: ComplianceAgent (adversarial) — AI_AUDIT_PROTOCOL v1.

## 0. Independencia — verifícala antes de trabajar

Vas a auditar el PR #750 de Monedario:
- Repo: https://github.com/cortega26/Monedario
- Rama: `fix/causa2-phase4-cluster-remediation`
- HEAD esperado: `7a001163`
- Base: `main` (`32ac7dc7`)
- Fecha de la remediación: 2026-10-27/28
- Sesión redactora: DeepSeek V4.1 Flash (`opencode-go/deepseek-v4.1-flash`)

**Requisito:** debes pertenecer a una familia de modelo distinta a la de la sesión redactora. Declara modelo, versión y sesión exactos en `auditor.model` / `auditor.session`. Si compartes familia, **detente** y reporta que la independencia no se cumple: no emitas veredicto.

No heredas conclusiones. El cuerpo del PR y el commit son **afirmaciones a verificar**, no evidencia. No leas esta auditoría como confirmación del trabajo: tu objetivo es encontrar el error que quedó.

## 1. Contexto

Monedario es un sitio YMYL de finanzas personales en Chile. El PR #750 cierra la fase 4 de causa 2: los defectos D1, D2, D3, D4, D6, D7, D8, D13, D14 y D16 que el waiver de #719 difirió, y activa `check:payroll-consistency` dentro de `check:ci`.

Riesgo: **R4** (YMYL, impacto económico directo en trabajadores que calculan su sueldo líquido o revisan su primera liquidación).

La pieza `descuentos-de-sueldo.md` **no se toca** en este PR: ya fue corregida y auditada. No la reabras.

## 2. Inputs — léelos completos antes de concluir

Plan y decisiones:
- `docs/backlog/PLAN-causa2-phase4-cluster-remediation-2026-10-27.md`
- `docs/adr/ADR-20261027-payroll-rules-single-source.md`
- `docs/editorial/audits/descuentos-de-sueldo-20261020/13-owner-waiver-2026-10-27.md`
- `docs/editorial/AI_AUDIT_PROTOCOL.md`
- `docs/editorial/NORMA_YMYL.md`

Registros y motor:
- `src/domain/payroll/PayrollRules.ts`
- `src/config/afpCommissions.ts`
- `src/infrastructure/economic/economic-parameters.snapshot.json`
- `scripts/check-payroll-consistency.mjs`
- `package.json` (`check:ci`)

Superficies corregidas:
- `src/data/blog/como-calcular-sueldo-liquido.md`
- `src/data/blog/primer-empleo-chile-guia-completa.md`
- `src/data/laws/codigo-del-trabajo.md`
- `src/data/laws/dl-3500-sistema-afp.md`
- `src/data/correcciones.json` (entradas `causa2-phase4-tasas-bases-cluster` y `descuentos-sueldo-clasificacion-bases-atrasos`)

Artefactos de portada (solo para verificar hashes/revisión, no calidad visual):
- `scripts/hero-images/manifest.json`
- `scripts/hero-images/briefs.json`
- `scripts/hero-images/prompts.json`
- `scripts/hero-images/asset-reviews.json`

Auditoría previa (entrada, no verdad):
- `docs/editorial/audits/descuentos-de-sueldo-20261020/02-result.json`
- `docs/editorial/audits/descuentos-de-sueldo-20261020/05-math-audit.md`
- `docs/editorial/audits/descuentos-de-sueldo-20261020/06-compliance.md`
- `docs/editorial/audits/descuentos-de-sueldo-20261020/evidence/`

Diff a auditar:
- `git diff 32ac7dc7..7a001163`

## 3. Alcance — qué auditas y qué NO

**Sí:**

1. Que D1, D2, D3, D4, D6, D7, D8, D13, D14 y D16 estén realmente cerrados, con fuente primaria.
2. Que las cifras publicadas coincidan con los registros del repo y con la aritmética.
3. Que D8 no sea un reemplazo ciego de 12 por 24: que la regla contextual esté bien explicada.
4. Que D4 no haya convertido el SIS en un valor único: que distinga régimen y período.
5. Que la tabla de bases de D13 no introduzca un error nuevo.
6. Que D14 distinga el tope de 90 UF del precio adicional del plan Isapre y del copago de uso.
7. Que la entrada de `correcciones.json` describa el cambio real de #719, sin minimizar ni exagerar.
8. Que `check:payroll-consistency` esté en `check:ci`, que sea verde, y que su cobertura declarada sea honesta (hoy solo cubre comisiones de AFP).
9. Que no se hayan cambiado slugs, URLs, canonical ni `topicRole`; que no se haya tocado `descuentos-de-sueldo.md`; que no se haya marcado ningún gate `[X]`.
10. Coherencia del clúster: que las páginas corregidas no contradigan a otras páginas de Monedario sobre las mismas tasas, bases o plazos.

**No:**

- No re-audites la calidad visual de las portadas. Solo verifica que los hashes y las revisiones correspondan al texto actual y que no se haya regenerado una imagen sin revisión.
- No audites build, Playwright ni accesibilidad, salvo que un fallo bloquee la reproducibilidad del audit.
- No firmes, no publiques, no marques gates `[X]`.
- No corrijas nada. R8.

## 4. Claims a verificar

Para cada uno: fuente primaria, extracto literal, fecha de consulta, comando y salida. Sin extracto → `UNVERIFIED`.

| ID | Afirmación publicada | Qué debes verificar |
|---|---|---|
| **D1** | `codigo-del-trabajo.md`: tope de gratificación = `$553.553 × 4,75 = $2.629.376,75` | IMM vigente desde 01-05-2026 en DT; 4,75 en BCN art. 50; aritmética exacta; que el texto no mezcle el IMM con el monto anual. |
| **D2** | `como-calcular-sueldo-liquido.md`: AFP Capital `1,44%`, total `11,44%`; cotizaciones `$257.040`; renta líquida `$1.092.960`; impuesto `$5.978`; líquido `$1.236.982` | Comisión en `afpCommissions.ts` y Previred/SP; recálculo completo del ejemplo; tabla IUSC de **abril 2026** del SII (tramo 4%, rebaja `$37.740,06`); que cada fila de la tabla sume. |
| **D3** | `primer-empleo…`: plazo fijo `2,8% CIC + 0,2% FCS`; indefinido `1,6% + 0,8%`; casa particular `2,2% + 0,8%` | BCN Ley 19.728 arts. 5 y 9; `PayrollRules` (`afc.employer`); que el artículo no diga “3% al FCS” ni duplique el 2,4% patronal. |
| **D4** | `primer-empleo…`: SIS dependiente `1,78% desde agosto de 2026`; `1,49%` de boletas es otro régimen | Ficha SIS de la SP; que la tasa corresponda al régimen **dependiente** y al período; que no se presente un SIS único. Verifica si `1,62%` es un régimen o una tasa anterior. |
| **D6** | `primer-empleo…`: 10% de ahorro + comisión `0,46%–1,45%`; total `18,06%–19,05%`; casa particular `17,46%–18,45%` | `afpCommissions.ts`; aritmética; que no quede “10,5% ahorro previsional” ni se sume el 10% con la comisión como si fueran lo mismo. |
| **D7** | `dl-3500…`: rango `0,46%–1,45%` | `afpCommissions.ts`; SP; que el mínimo sea AFP Uno. |
| **D8** | `primer-empleo…`: 24 meses en la primera afiliación (AFP Uno desde 01-10-2025), salvo alza de comisión o AFP más barata; después sin límite anual; traspaso por licitación con 30 días para rechazar | SP “Sistema de AFP” y “Traspaso a otra AFP”; BCN DL 3.500 arts. 160, 164 y 165. Verifica si la regla es contextual y si el texto la aplica a quien corresponde. |
| **D13** | `como-calcular…`: tabla de bases y topes por descuento | Contraste fila por fila con `descuentos-de-sueldo.md`, DT, SII, SP y AFC. Busca errores nuevos: base del impuesto único, tope de salud, 11 años, 15/30/45%. |
| **D14** | `como-calcular…`: Fonasa 7% hasta 90 UF (máx. 6,3 UF); precio adicional del plan Isapre ≠ copago | SP topes 2026; Superintendencia de Salud; que el ejemplo bajo/sobre el tope sea correcto. |
| **D16** | `correcciones.json`: la entrada de #719 consigna el cambio sobre pérdidas de caja, herramientas y mercadería | Diff `git show 1f939ae4^..1f939ae4 -- src/data/blog/descuentos-de-sueldo.md`; que `wrong`/`fixed` describan el cambio real y no una versión minimizada. |
| **Gate** | `check:payroll-consistency` verde y en `check:ci` | `package.json`; ejecuta el gate; verifica que falle si se reintroduce el error de D2 en una **copia temporal** (no modifiques el working tree); revisa que la cabecera declare que solo cubre comisiones de AFP. |
| **Metadatos** | `validAsOf` / `lastVerified` / `updatedDate` / `reviewPolicy.computedAt` | Que la fecha de corte corresponda a la verificación real; que no se publique una revisión humana no realizada; que `computedAt` no se use para afirmar `lastReviewed`. |
| **Invariantes** | Sin cambios de slug, URL, canonical, `topicRole`; sin tocar `descuentos-de-sueldo.md`; sin gates `[X]` | `git diff --stat`, `git diff`, `check:no-postid-urls`, `check:routes`, `check:rss`. |

## 5. Preguntas adversariales

Responde cada una con evidencia, no con opinión:

1. ¿La tasa SIS de 1,78% es la vigente para **trabajadores dependientes** en la fecha de corte del artículo, o es una tasa de otro régimen/período?
2. Si `1,62%` era la tasa de abril–julio de 2026 y `1,78%` rige desde agosto, ¿el PR dejó alguna página del clúster afirmando `1,62%` como vigente? ¿Eso es un defecto de producto de este PR o un follow-up aceptable? Justifícalo.
3. ¿La regla de 24 meses aplica a **todos** los nuevos afiliados o solo al proceso de licitación 2025–2027? ¿El artículo lo dice con precisión?
4. ¿El artículo afirma que “no hay límite anual” sin fuente que lo respalde? ¿O el DL 3.500 vigente efectivamente eliminó el límite de 12 meses?
5. ¿El ejemplo de sueldo líquido usa la tabla del mes que dice usar? ¿El tramo sigue siendo 4% después de cambiar la comisión?
6. ¿La tabla de D13 introduce una base incorrecta para el impuesto único o para los descuentos convenidos?
7. ¿El 7% de Fonasa está topado a 90 UF en la fuente, y el texto lo aplica también al ejemplo?
8. ¿La entrada de `correcciones.json` describe el cambio de #719 o lo suaviza?
9. ¿El gate es verde por convicción o porque su cobertura es estrecha? ¿Un error de SIS o de ventana de AFP pasaría inadvertido? ¿Está declarado?
10. ¿El PR cambió algo que no estaba en el alcance (slugs, canonical, `descuentos-de-sueldo.md`, gates `[X]`)?

## 6. Reglas obligatorias

1. **R1 — Nada de cifras de memoria.** Cada número se obtiene ejecutando código (node/python) o leyendo el registro del repo; adjunta salida cruda.
2. **R2 — Fuente primaria.** Jerarquía: BCN LeyChile > organismo (SP, SII, DT, AFC, Superintendencia de Salud) > medio. URL + extracto literal + fecha. Sin extracto → `UNVERIFIED`.
3. **R3 — Recálculo independiente.** Recalcula D1, D2, D6 y los totales de D3/D13 por tu cuenta; compara con lo publicado. Divergencia = defecto.
4. **R4 — Trazabilidad.** Cada claim apunta a `evidenceRef` + comando/salida.
5. **R5 — Adversarial y de bordes.** Busca el caso que rompe: sobre/bajo el tope de 90 UF, contrato a plazo fijo, casa particular, primer afiliado vs cambio posterior, imponible distinto del bruto, mes de la tabla IUSC.
6. **R6 — Veredicto explícito.** `PASS` / `CONDITIONAL` / `FAIL`, con defectos por severidad y superficie (`product` / `audit-package`).
7. **R7 — Reproducibilidad.** Commit SHA, entorno, comandos y fecha. Un tercero debe poder repetirlo.
8. **R8 — No arregles nada.** No modifiques `src/`, `package.json`, `scripts/`, tests, metadatos, fechas ni `correcciones.json`. Escribe solo bajo el directorio de auditoría.

## 7. Acceso a fuentes — notas prácticas

- **BCN LeyChile** es una SPA. Para obtener el texto, usa la API:
  `https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=<id>`
  con `User-Agent` de navegador y `Referer: https://www.bcn.cl/leychile/navegar?idNorma=<id>`.
  El JSON trae `html` anidado; recorre recursivamente las claves `t` para extraer el texto.
  IDs: Código del Trabajo `207436`; DL 3.500 `7147`; Ley 19.728 `184979`.
- **Superintendencia de Pensiones** puede no responder directo desde el entorno. Si falla, usa un snapshot de Wayback Machine y registra la URL del snapshot y la fecha. No rellenes la cita de memoria. La ficha SIS es `w3-propertyvalue-9917.html`; “Sistema de AFP” es `w3-propertyvalue-9897.html`.
- **SII**: la página `impuesto2026.htm` trae las tablas mensuales en secciones `#mes_abril`, etc. Usa la tabla de **abril de 2026** para el ejemplo, porque el artículo la declara.
- **DT**: IMM en `https://www.dt.gob.cl/portal/1628/w3-article-60141.html`.
- **AFC**: cotizaciones en `https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/`.
- **Superintendencia de Salud**: `https://www.superdesalud.gob.cl/tax-materias-isapres/cotizaciones-de-salud-3465/`.

Si una fuente no se puede consultar, el claim queda `UNVERIFIED` con la razón. No lo completes con conocimiento previo.

## 8. Salida

Crea `docs/editorial/audits/causa2-phase4-20261028/` con:

- `00-scope.json` — `auditId`, `protocolVersion: "v1"`, `createdAt`, `status`, `scope.commit: "7a001163"`, `scope.branch`, `scope.files`, `scope.vectors` (D1–D16 + gate + invariantes), `scope.sources`, `scope.recommendedCommands`.
- `01-auditor-prompt.md` — copia íntegra de este prompt.
- `02-result.json` — esquema de `AI_AUDIT_PROTOCOL.md` `3:
  - `auditor` con tu rol, modelo, sesión y fecha;
  - `method.commands` y `method.edgeCases`;
  - `claims[]` con `source.url`, `source.quote`, `source.retrievedAt`, `reproduction`, `independentValue`, `engineValue`, `status`;
  - `defects[]` con `id`, `severity`, `surface`, `description`, `evidence`, `status`;
  - `verdict` y `humanSignoff: null`.
- `03-report.md` — informe legible: método, claims con extracto, defectos con evidencia, veredicto, limitaciones.
- `evidence/` — salidas crudas de comandos y extractos literales

No completes `humanSignoff`. No declares la pieza publicable. No afirmes que el repositorio es público.

## 9. Prohibido

- Declarar “cumple” sin extracto de la fuente.
- Reutilizar un extracto heredado sin verificarlo contra la URL oficial.
- Emitir veredicto si la independencia de modelo no se cumple.
- Corregir la pieza, los tests, las fechas o `correcciones.json`.
- Marcar gates `[X]` o completar `humanSignoff`.
- Aceptar el cuerpo del PR como evidencia.
- Convertir una duda de fuente en una afirmación.

## 10. Criterio de veredicto

- **PASS**: 0 defectos `product` abiertos; todos los claims con fuente y extracto; el gate es verde y está en `check:ci`; no hay cambios de invariantes.
- **CONDITIONAL**: hay al menos un defecto `product` abierto, incluida una contradicción del clúster que afecte la superficie corregida. Bloquea publicación hasta corregir o hasta que el owner acepte el riesgo por escrito.
- **FAIL**: una afirmación central es falsa, no tiene fuente, o el gate no cubre lo que dice cubrir de forma engañosa.
- `UNVERIFIED` no es PASS: si no puedes verificar una fuente, el claim queda abierto y el veredicto no puede ser PASS.

Empieza declarando tu modelo, versión y sesión. Luego verifica el SHA. Si el SHA no es `7a001163`, detente y reporta que el objetivo cambió.
Si el modelo auditor no tiene acceso a red, el prompt lo obliga a dejar los claims como UNVERIFIED en vez de rellenar de memoria; en ese caso el veredicto no puede ser PASS.
