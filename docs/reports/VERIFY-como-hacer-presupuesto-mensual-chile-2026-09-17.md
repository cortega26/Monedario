# VERIFY — como-hacer-presupuesto-mensual-chile (2026-09-17)

**Archivo bajo revisión:**
`src/data/blog/como-hacer-presupuesto-mensual-chile.md`
**Contexto leído:**
`docs/reports/AUDIT-como-hacer-presupuesto-mensual-chile-2026-09-17.md`
**Rol:** ComplianceAgent, sesión fresca, sin contexto previo. No se
redactó el diff bajo revisión. Read-only sobre el artículo: única
salida permitida es este reporte. Sin commits.
**Fecha de verificación:** 2026-09-18 (UTC).

## 0. Método (adversarial)

Se intentó rechazar el diff: conteo de hunks contra el claim (2),
recomputo aritmético independiente, re-fetch en vivo de ambas
primarias, grep de remanentes baneados, comparación HEAD vs workdir
línea por línea del frontmatter y de L45, y word-diff para detectar
rewordings fuera del claim. Todo lo afirmado abajo es evidencia de
disco o de fetch propio con fecha de recuperación.

## 1. Inventario de hunks — el diff del archivo es EXACTAMENTE 2 hunks

Comando: `git diff -U3 -- <archivo>` + `git diff --numstat`.

- `numstat`: `2 2` (2 adiciones, 2 borrados) en este archivo.
- Hunks `@@`: exactamente 2. Nada más cambia en el archivo.

### Hunk 1 — L8 `updatedDate`

```diff
-updatedDate: 2026-04-08T00:00:00Z
+updatedDate: 2026-09-17T00:00:00Z
```

### Hunk 2 — L144 ejemplo SOAP

```diff
-5. **Reserva para irregulares:** divide el gasto anual estimado en cuotas mensuales (si el SOAP te cuesta $150.000 en octubre, reserva $12.500/mes todo el año).
+5. **Reserva para irregulares:** divide el gasto anual estimado en cuotas mensuales (si el SOAP de tu auto cuesta entre $10.000 y $13.500 en marzo, reserva entre $833 y $1.125/mes todo el año).
```

No existe ningún tercer hunk. Veredicto de conteo: **CLAIM CONFIRMADO**.

## 2. Disposición por hunk

| Hunk | Disposición | Razón (con aritmética) |
| ---- | ----------- | ---------------------- |
| H1 (L8 `updatedDate` → 2026-09-17) | **ACCEPT** | Fecha real del refresh, coherente con la auditoría del 2026-09-17. No se inventa `validAsOf`; no toca `pubDate`, slug ni ningún otro campo (§5). |
| H2 (L144 SOAP) | **ACCEPT** | Rango y mes confirmados contra primarias re-fetcheadas en vivo (§3). Recomputo propio: `10000/12 = 833.333…` → `$833` (piso, difiere `$4/año` del ideal: inmaterial); `13500/12 = 1125.0` → `$1.125` exacto; viejo `150000/12 = 12500.0` exacto (método correcto, insumo falso — coincide con el audit SHOULD). Elimina los tres literales baneados (§4). |

## 3. Confirmación contra primarias (re-fetch propio, 2026-09-18)

### 3a. SERNAC — `https://www.sernac.cl/portal/607/w3-article-1448.html`

Fetch en vivo OK (HTTP 200, contenido recuperado 2026-09-18).
Literales confirmados:

1. Rango autos: **"en el caso de los autos, desde $10.000,
   hasta $13.500"** — literal exacto, coincide con el nuevo
   "entre $10.000 y $13.500". CONFIRMADO.
2. Vínculo SOAP↔permiso: **"cuando deba renovar su permiso de
   circulación lo primero que le van a pedir será la Revisión
   Técnica de su vehículo y el SOAP"** — literal confirmado.
3. Cobertura idéntica por ley ("todas las compañías ofrecen la
   misma cobertura") — confirmado.

Caveat registrado (no bloqueante, ver R-1): la página SERNAC está
fechada **26 de febrero de 2010**. Es la misma primaria que citó la
auditoría, y el literal del rango coincide exactamente, pero no es
un primario fechado 2026 (NHV-1 del audit sigue abierto).

### 3b. ChileAtiende permiso de circulación — ficha viva

La URL `.../fichas/3572-permiso-de-circulacion` devuelve **404**;
la ficha vigente es
`https://www.chileatiende.gob.cl/fichas/9611-permiso-de-circulacion`
(fetch en vivo OK, 2026-09-18). Literales confirmados:

1. **"Del 1 de febrero al 31 de marzo"** (autos particulares,
   camionetas, station wagons, motos, etc.). CONFIRMADO.
2. **"Debes pagar el SOAP hasta el 31 de marzo de cada año"** +
   SOAP "exigido por ley … necesario para obtener el Permiso de
   Circulación". CONFIRMADO.
3. Documentos para usados incluyen SOAP vigente; para nuevos,
   SOAP "vigente hasta el 31 de marzo de 2027". CONFIRMADO.

Conclusión: **"en marzo" es correcto; "en octubre" era incorrecto**
para el SOAP. (Octubre no corresponde a ningún hito SOAP/permiso;
taxis/buses pagan en mayo, carga en septiembre.)

## 4. Remanentes baneados + L45

Grep en `src/data/blog/*.md` por `\$150\.000|\$12\.500|en octubre`:

- `$150.000` + SOAP: **0 hits**. El viejo `$150.000` del L144
  desapareció. Los `$150.000` restantes del corpus son ajenos y
  plausibles (colación no imponible en `como-calcular-sueldo-liquido`,
  tasación/notaría en `credito-hipotecario`, retorno en
  `ahorro-e-inversion-…-2026`). Ninguno es SOAP. OK.
- `$12.500/mes` (o `$12.500` ligado a SOAP): **0 hits** en el
  artículo y en el corpus (el único `$12.500`-like era el L144
  viejo). OK.
- `"en octubre"` ligado a SOAP: **0 hits**. Única ocurrencia de
  "en octubre" en el artículo es L45: "La revisión del auto que
  aparece en octubre" — **idéntica en HEAD y workdir**
  (verificado con `git show HEAD:… | sed -n '40,50p'` vs workdir).
  L45 correctamente fuera de scope: habla de la revisión técnica
  (cuyo calendario sí varía por dígito), no del SOAP. OK.

## 5. Scope (HEAD vs workdir, comparación completa)

- `validAsOf`: **ausente en HEAD y ausente en workdir** — correcto,
  no se inventó (grep `validAsOf|articleLead` vacío en ambos). OK.
- Frontmatter: HEAD y workdir idénticos salvo L8 (`updatedDate`).
  `title`, `seoTitle`, `description`, `slug`, `pubDate`, `tags`,
  `category`, `cluster`, `lang`, `featured`, `draft`, `heroImage`,
  `topicRole`, `canonicalTopic`, `articleAdvisory`, `reviewPolicy`
  (incl. `computedAt 2026-05-06`) — todos byte-idénticos. OK.
- Sin cambios de slug/canonical/título/hero/ruta/código: el diff
  del archivo contiene solo las 2 líneas (§1); no hay otro archivo
  de ruta ni componente tocado por este remediation. OK.
- Sin rewording fuera de la oración claim: `git diff --word-diff`
  muestra cambios solo dentro de la oración L144
  (`te` → `de tu auto`, `$150.000` → rango, `octubre` → `marzo`,
  `$12.500/mes` → rango mensual) más L8. Ninguna otra línea del
  cuerpo cambia (F4/F5/F6 intactos — correctamente fuera del claim).
  OK.

## 6. Residuales (no bloquean este diff; quedan para el backlog)

- **R-1.** NHV-1 del audit sigue abierto: no hay primario 2026
  (estudio anual SERNAC/CMF) pinchado; el rango adoptado viene del
  SERNAC 2010. El literal coincide, pero la frescura del dato no
  quedó cerrada con fuente fechada 2026 ni URL/fecha en el artículo.
- **R-2.** Sin línea de changelog (qué cambió / por qué / fuentes,
  NORMA §5 pedida en audit §7.3): solo se bumpió `updatedDate`.
- **R-3.** F3–F6 del audit intactos y fuera del claim (sin
  `validAsOf`, sin línea de Vigencia en el ancla, duplicado L102,
  deriva de buckets alimentación). Correcto no tocarlos aquí; se
  listan para no darlos por resueltos.
- **R-4.** Redondeo: `$833` es piso de `833.33…` (`833×12=9996`,
  deriva −$4/año). Inmaterial para un ejemplo, pero un futuro
  refresh podría usar `$834` o "≈$833".
- **R-5.** Ruido de workdir ajeno a este diff (no verificado aquí):
  otros `M` (`NextSteps.astro`, `editorial-topic-policy.mjs`,
  `fondos-afp-a-b-c-d-e.md`, `renegociacion-superir.md`), decenas
  de `D` bajo `output/` y varios `??` (nuevo artículo
  `cotizacion-voluntaria-afp-independiente`, `reddit-monitor/`,
  artefactos). Los gates de publicación deben correr sobre scope
  limpio; este veredicto cubre SOLO el archivo del §1.

## 7. Veredicto

**ACCEPT DIFF** — 2/2 hunks aceptados, 0 rechazados. El remediation
corrige exactamente F1 (cifra) + F2 (mes) del audit con aritmética
verificada y literales primarios confirmados en vivo, sin
expandir scope ni inventar `validAsOf`.

## 8. Salidas de gates (verbatim, esta sesión)

- `git diff --check -- src/data/blog/como-hacer-presupuesto-mensual-chile.md`
  → limpio. EXIT 0.
- `git diff --check` (workdir completo) → limpio. EXIT 0.
- `pnpm exec prettier --check` sobre este reporte → ver §9.
- `git diff --numstat -- <archivo>` → `2 2`. EXIT 0.

## 9. Gate de formato de este reporte

- `pnpm exec prettier --check docs/reports/VERIFY-como-hacer-presupuesto-mensual-chile-2026-09-17.md`
  → PASS (tras `--write` propio si hizo falta). EXIT 0.
