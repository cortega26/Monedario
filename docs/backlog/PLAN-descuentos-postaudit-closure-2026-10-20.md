# HANDOFF — Post-audit de `descuentos-de-sueldo` y cierre de sesión (2026-10-20)

**Estado:** math audit ejecutado con veredicto `CONDITIONAL`. PR #719 en draft.
**Nada de esto es publicable aún: falta compliance en otra sesión y
`humanSignoff` humano.**
**Página:** `src/data/blog/descuentos-de-sueldo.md` (R4)
**PR en curso:** https://github.com/cortega26/Monedario/pull/719 (draft)
**Commit de contenido:** `56f15110`; audit scope: `38418c08`; registro de
auditoría: `84051b05`.
**Ledger autoritativo de defectos:**
`docs/editorial/audits/descuentos-de-sueldo-20261020/02-result.json`.

## 1. Dónde quedó la sesión

- Redacción (draft): Claude Code, sesión `20261020-1517-handoff1`
  (`artifacts/editorial/descuentos-de-sueldo/20261020-1517-handoff1/`).
- Math audit: subagente independiente `deepseek-v4.1-flash-free#high`
  (sesión `ses_ea46a39c0ffeNnWsJAgjPUBhy4`), sin historial de redacción.
  V1–V6 recalculados con `Decimal` prec=50: 94 comprobaciones, 0 divergencias.
  La aritmética de la corrección F01–F08 está verificada; el `CONDITIONAL`
  proviene de defectos preexistentes del clúster.
- Compliance: **no ejecutado**. Debe correr en una sesión distinta a las dos
  anteriores (`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`).
- `humanSignoff`: **null**. Solo el humano lo puede marcar.

## 2. Defectos abiertos (de 02-result.json, verdict CONDITIONAL)

| ID | Sev. | Superficie | Ubicación | Qué |
|---|---|---|---|---|
| D1 | media | product | `src/data/laws/codigo-del-trabajo.md:54` | IMM vencido: $2.560.250 vs $2.629.376,75 (Ley 21.830, IMM $553.553) |
| D2 | media | product | `src/data/blog/como-calcular-sueldo-liquido.md:180,186` | Capital rotulada 0,58% (real 1,44%): líquido sobrestimado $11.145,60 |
| D8 | media | product | `src/data/blog/primer-empleo-chile-guia-completa.md:142,267` | 12 meses para cambiar de AFP; son 24 |
| D3 | baja | product | `primer-empleo...md:194` | "3% al FCS"; es 2,8% CIC + 0,2% FCS |
| D4 | baja | product | `primer-empleo...md:134` | SIS 1,87% vs 1,78% |
| D6 | baja | product | `primer-empleo...md:110,222,225` | 10,5% rotulado "ahorro previsional" (10% + comisión) |
| D7 | baja | product | `src/data/laws/dl-3500-sistema-afp.md:31` | rango comisiones 0,58–1,45% vs 0,46–1,45% |
| D5 | media | audit-package | `00-scope.json` | idNorma Ley 18.833: corregido 30053→30209 post-audit; defecto queda registrado open |

### Disposición ComplianceAgent (2026-10-27)

Los siete defectos de producto del math audit (D1, D2, D3, D4, D6, D7 y D8)
se difieren a este backlog y permanecen `open`. No se corrigen en el PR #719 ni
en la auditoría de compliance: la solicitud de compliance limita los cambios a
artefactos de auditoría, y los defectos afectan páginas o resúmenes legales
fuera de F01–F08. Corregirlos juntos aquí ampliaría el alcance de la corrección
editorial ya revisada; cada uno requiere una remediación de contenido acotada y
su propia verificación de cifras y regresiones. Ninguno queda despejado por el
veredicto de compliance. D5 sigue como `audit-package` abierto y no bloquea por
sí solo según AI_AUDIT_PROTOCOL v1.

D2, D3, D4, D6, D8 alimentan directamente la **causa 2 (AFC / seguro de
cesantía)** planificada después de cerrar causa 1. D1 y D7 son del resumen de
leyes, en el mismo radio de la causa laboral.

## 3. Ruta para cerrar la corrección (en orden)

1. **CI de `84051b05`** (commit docs-only del audit): confirmar verde.
2. **Decisión del owner sobre defectos:** fijar D1–D8 dentro de este PR o al
   backlog de remediación. Si se corrigen aquí → commit de contenido → los
   defectos pueden pasar a `resolved` pendiente re-auditoría de delta.
3. **Sesión de compliance distinta** → escribir `06-compliance.md` y
   completar `02-result.json` con veredicto (mismo esquema, el check lo exige
   y hoy solo acepta un artefacto por carpeta).
4. **`humanSignoff` humano**; nadie más puede marcarlo.
5. **Holds de fechas al firmar** (así lo aprobó el owner en PR #719):
   `reviewPolicy.computedAt` se mantiene en 2026-10-04 y pasa a la **fecha de
   firma**; `updatedDate` de las 3 páginas relacionadas y `lastVerified` de
   `codigo-del-trabajo.md` pasan a la fecha de publicación; la fecha de la
   entrada de `correcciones.json` (2026-10-20) se ajusta si el merge ocurre
   otro día.
6. **Merge:** retirar draft de #719 → merge → fast-forward `main` → borrar
   branch.

## 4. Otro fork abierto (cierre de auditoría externa)

- **PR #718** (reconciliación del inbox + calibración) sigue **draft**:
  convertir a ready y merge; al hacerlo, fast-forward local de `main` y borrar
  branch `docs/audit-inbox-reconciliation-2026-10-20`.
- **#688** sigue con writeback al Sheet canónico pendiente (sheet restringido,
  solo acción del owner).

## 5. Calendario

| Fecha | Qué |
|---|---|
| 2026-10-26 (W43) | Leer W43, medir #709, decidir/firmar **#652 Phase B**; completar W42 `utility-led-ops.json` de #536 si llegan inputs de Gate D |
| Post causa 1 | Causa 2: AFC / seguro de cesantía (consume D2/D3/D4/D6/D8) |
| Diario | Radar de datos gratuitos; revisar Keywords Everywhere, SerpDino, #644 W43 (`actualizador-inflacion`, `comisiones-afp`, `sueldo-liquido`, `informe-deudas-cmf-vs-dicom`) |

## 6. Restricciones al retomar

- Nunca marcar gates `[X]` en `07-publish-packet.md`; solo el humano firma.
- Máx. 2 causas de corrección en vuelo.
- Sin URLs indexables nuevas; sin cambio de slug; sin escribir al Sheet sin
  acción del owner.
- El math audit ya hecho no se puede reutilizar como compliance: sesiones
  distintas, siempre.
