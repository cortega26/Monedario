# PLAN — Reconciliación de auditorías externas (2026-10-20)

**Estado:** EN CURSO — paso 0 ejecutado; calibración 12/15 (11 confirmados + 1 conflicto; 3 fuentes bloqueadas).
**Origen:** 46 informes adversariales externos depositados en la carpeta
`Monedario-Audit-Inbox` de Google Drive.
**Autoridad:** Constitución > `AGENTS.md` > `context/` > código.
**Protocolo aplicable:** `docs/editorial/AI_AUDIT_PROTOCOL.md` v1 y
`docs/adr/ADR-20260929-ai-independent-audit-protocol.md`.

## 1. Contexto y problema

La generación de nuevas auditorías está suspendida por decisión del owner.
El ciclo acumuló 46 informes de los slots 1–48 de 53: faltan los slots 2 y 23;
los slots 49–53 aún no se ejecutan. Todos los informes revisados devuelven
`FAIL`; no hay `PASS`. La hoja canónica sigue en `PENDIENTE` y no hay cierres
con revisión independiente y firma humana.

Los informes son valiosos como **red-team**: contienen fuentes primarias,
recálculos y señales de riesgo. Pero no son artefactos de auditoría cerrables:
no usan el esquema `00-scope.json` / `02-result.json` que valida
`check:audit-artifacts`, y muchos declaran explícitamente que no sustituyen una
revisión independiente YMYL.

El problema inmediato no es “faltan auditorías”. Es que 46 informes, ~190
encabezados de error confirmado, 43 sospechas y 24 afirmaciones no verificables
no caben en un backlog accionable sin un filtro de evidencia.

## 2. Objetivo

Convertir los 46 informes en un inventario verificable y acotado:

1. snapshot inmutable y manifiesto por slug;
2. deduplicación contra auditorías previas y correcciones publicadas;
3. calibración de una muestra de hallazgos R4;
4. decisión explícita por hallazgo: corregir, aceptar riesgo, diferir o rechazar;
5. solo después, corrección por causa con gates YMYL.

## 3. Alcance

**En alcance:**

- `docs/backlog/PLAN-audit-inbox-reconciliation-2026-10-20.md`;
- `docs/reports/AUDIT-INBOX-RECONCILIATION-2026-10-20.md`;
- `docs/reports/AUDIT-INBOX-MANIFEST-2026-10-20.csv`;
- `docs/reports/AUDIT-CALIBRATION-WORKSHEET-2026-10-20.md`;
- lectura de `docs/reports/AUDIT-*`, `src/data/correcciones.json`,
  `docs/editorial/audits/**` y el registro de riesgo.

**Fuera de alcance:**

- editar artículos, calculadoras, componentes, rutas, slugs o metadatos;
- escribir en la hoja canónica o en GitHub;
- abrir o modificar PRs/Issues;
- marcar gates de publicación o firmar correcciones;
- re-auditar páginas ya corregidas;
- #652, #536 y cualquier trabajo de growth.

## 4. Definiciones operativas

- **Lead:** afirmación de un informe externo que aún no fue verificada.
- **Confirmado:** lead con fuente primaria citada, extracto comprobado y
  recálculo independiente cuando hay números.
- **Superseded:** el defecto fue corregido por un PR fusionado y el fix está en
  la superficie auditada; no se reabre.
- **No verificable:** no se encontró evidencia suficiente; no se corrige a
  ciegas.
- **Rechazado:** falso positivo documentado; se conserva la nota, no se toca
  el artículo.
- **Duplicado:** ya existe en una auditoría previa o en una corrección
  registrada.

Un encabezado “ERROR CONFIRMADO” del informe externo **no** equivale a
“confirmado” en este plan. La verificación es el paso que otorga esa etiqueta.

## 5. Paso 0 — snapshot y manifiesto

Ejecutado el 2026-10-20:

- 46 archivos descargados y hasheados (SHA-256 truncado a 16 caracteres para el
  manifiesto).
- 46 slugs únicos; no hay slugs duplicados entre informes.
- 8 slugs tienen auditorías previas en `docs/reports/AUDIT-*`.
- La hoja canónica no fue escrita; los informes declaran `PENDIENTE` o
  `REGISTRADO_SHEET=NO`.
- Distribución declarada: 28 R4, 10 R3, 6 R2, 2 sin nivel explícito.

El manifiesto incluye `drive_id`, hash, slot, estado declarado, veredicto,
riesgo, severidad, conteos por encabezado, PRs citados, HEAD observado,
auditoría previa, corrección registrada, clúster y decisión.

## 6. Paso 1 — calibración

Antes de corregir se verifica una muestra de 15 hallazgos R4, priorizando
páginas distintas y hallazgos con fuente primaria concreta. La hoja de trabajo
está en `docs/reports/AUDIT-CALIBRATION-WORKSHEET-2026-10-20.md`.

Cada fila se completa con:

- extracto literal de la fuente primaria y fecha de consulta;
- recálculo independiente, si corresponde;
- comprobación de que el defecto no esté superseded;
- decisión: `confirmado`, `no_verificable`, `rechazado` o `duplicado`.

Regla de decisión:

- **≥70% confirmado:** usar el corpus como backlog y corregir por causa.
- **30–70%:** corregir solo R4 con fuente primaria directa; re-auditar el resto
  con el protocolo del repo.
- **≤30%:** descartar el corpus como evidencia y re-auditar los slugs R4 con
  `AI_AUDIT_PROTOCOL`.

La precisión se registra en el informe; no se declara “auditoría cerrada”.

## 7. Paso 2 — decisión por hallazgo

No se clasifican los ~190 encabezados. Se clasifica el 100% de los R4 y una
muestra del resto. Cada fila del ledger de decisión tiene:

`slug | finding | severidad | riesgo | estado | causa | owner | fecha | decisión | evidencia`

Decisiones permitidas: `fix`, `accept-risk`, `defer`, `reject`, `duplicate`.
No existe “PASS candidate”. El cierre es `PASS` del protocolo +
`humanSignoff`.

## 8. Paso 3 — corrección por causa

Se agrupa por causa, no por tema amplio:

- AFC / seguro de cesantía;
- parámetros volátiles y frescura;
- tratamiento tributario del ahorro;
- derechos DICOM / boletín;
- fraude Ley 20.009;
- UF / IPC / reajuste;
- registro de riesgo (R2/R3 → R4).

Cada causa exige:

1. un PR acotado, con una causa y no cinco páginas heterogéneas;
2. barrido de las seis superficies del protocolo (§5): cuerpo, metadatos,
   JSON-LD, catálogo/LLM, contenido relacionado y motor/tests;
3. guarda de regresión;
4. entrada en `src/data/correcciones.json` si es material;
5. auditoría independiente en sesión/modelo distinto;
6. `humanSignoff` antes de divulgar.

## 9. Gobernanza y gates

- `pnpm run check:docs` — estructura documental.
- `pnpm run check:audit-artifacts` — esquema de artefactos de auditoría.
- `pnpm run check:correcciones` — registro de correcciones.
- `pnpm run check:risk-tiers` — coherencia del registro de riesgo.
- `pnpm run check:editorial` — warn-only local; CI con `EDITORIAL_ENFORCE=1`.

No se marca ningún gate `[X]`. No se publica una corrección R4 sin revisor
independiente y firma humana.

## 10. WIP y anti-backlog muerto

- Máximo **2 causas en vuelo**.
- Cada fila sin decisión durante 7 días pasa a `defer` o `accept-risk` por
  escrito.
- Fecha de congelamiento del ledger: **2026-11-02**, alineada con el foco
  estricto.
- Lista explícita de riesgos aceptados, firmada por el owner; mejor 6 fixes
  reales y 20 aceptaciones documentadas que 46 filas vivas.
- Antecedente a evitar: `docs/editorial/audits/plan-115-correctitud/` sigue
  `PENDIENTE DE EJECUCIÓN` desde 2026-09-29.

## 11. Criterios de aceptación

- [ ] Manifiesto de 46 filas con hash y `drive_id`.
- [ ] 46 slugs únicos y mapeo de auditorías previas/correcciones.
- [ ] 15 hallazgos R4 con verificación y decisión.
- [ ] Precisión de la muestra registrada.
- [ ] 3 causas priorizadas con issue/PR propuesto.
- [ ] Ningún cambio de contenido, ruta, gate o hoja en este paso.
- [ ] `check:docs` verde.

## 12. Change Control Record

1. **Scope:** documentación de reconciliación; no producto ni contenido.
2. **Módulos:** `docs/backlog`, `docs/reports`; sin imports ni runtime.
3. **Invariantes:** `URL.PUBLIC.NO_POST_ID`, rutas, RSS, separación editorial
   y gates humanos preservados.
4. **Contratos:** sin cambios de API, esquema ni frontmatter.
5. **Fronteras:** sin cambios de capas.
6. **Tests:** `check:docs`; sin tests de runtime porque no hay código.
7. **Rollback:** revertir los archivos de este plan y sus anexos.
8. **Riesgo:** bajo; el riesgo principal es tratar un lead como verdad. Se
   mitiga con calibración y decisión explícita.

## 13. Próxima acción

Completar la muestra de 15 hallazgos de
`docs/reports/AUDIT-CALIBRATION-WORKSHEET-2026-10-20.md` y registrar la
precisión. Con ese dato se decide si se corrige el corpus o se re-audita con el
protocolo.

La primera causa está preparada para una sesión de redacción distinta:
`docs/backlog/PLAN-handoff-descuentos-sueldo-2026-10-20.md`. No se redacta en
esta sesión: la separación de funciones exige que el draft y la auditoría
ocurran en sesiones/modelos distintos.
