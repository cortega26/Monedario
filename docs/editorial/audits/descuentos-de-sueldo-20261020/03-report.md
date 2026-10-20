# 03 — Reporte humano: auditoría matemática `descuentos-de-sueldo`

- **auditId:** `descuentos-de-sueldo-20261020`
- **Protocolo:** `AI_AUDIT_PROTOCOL v1`
- **Rol:** `MathAuditAgent` (adversarial, sesión independiente)
- **Modelo:** DeepSeek V4.1 Flash (OpenCode)
- **Commit de contenido:** `56f15110a0558dd6a23ed83076488d2578ec3294`
- **Commit de alcance (HEAD):** `38418c0841e7ad28e69c825537976aed32531485`
- **Fecha:** 2026-10-20
- **Veredicto:** **CONDITIONAL**
- **Firma humana:** pendiente (`humanSignoff: null`)

---

## 1. Qué se auditó

La corrección F01–F08 de `descuentos-de-sueldo` y la aritmética del clúster que
la rodea: vectores V1–V6, topes (90 UF / 135,2 UF / 4,75 IMM / 15-30-45%),
bases (bruto vs imponible), redondeos, límites de tramo, no aditividad de los
topes y consistencia entre las seis superficies del protocolo (§5).

**Fuera de alcance:** interpretación normativa (compliance), build/Playwright,
firma humana y publicación.

## 2. Resultado en una línea

La corrección **F01–F08 es aritméticamente correcta**: los seis vectores se
recalcularon de forma independiente y coinciden exactamente. El `CONDITIONAL`
viene de **siete defectos de producto arrastrados** en páginas del mismo clúster
(más un defecto del paquete de auditoría), no de los vectores corregidos.

- Reimplementación independiente: **94 comprobaciones, 0 divergencias**, exit 0.
- Evidencia heredada: reejecutada y **byte-idéntica** (`diff` exit 0).
- Tabla SII octubre 2026: las 7 rebajas se reconstruyen desde el tramo anterior;
  impuesto continuo en cada límite.

## 3. Defectos

| ID | Sev. | Superficie | Estado | Archivo | Hallazgo |
|---|---|---|---|---|---|
| D1 | media | `product` | abierto | `src/data/laws/codigo-del-trabajo.md:54` | Tope de gratificación con IMM vencido: `$539.000 × 4,75 = $2.560.250`. Con IMM `$553.553` el tope es **$2.629.376,75**; subestima **$69.126,75** (2,63%). Contradice `gratificacion-legal-chile.md:108` y el motor. |
| D2 | media | `product` | abierto | `src/data/blog/como-calcular-sueldo-liquido.md:180,186` | Rotula **AFP Capital con 0,58%** (tasa de Modelo). Capital cobra **1,44%** (misma página, línea 123). Comisión `$7.830` vs `$19.440`; líquido sobrestimado en **$11.145,60**. |
| D8 | media | `product` | abierto | `src/data/blog/primer-empleo-chile-guia-completa.md:142,267` | Dice **12 meses** para cambiarse de AFP; la SP exige **24 meses** de permanencia al afiliarse por primera vez. |
| D3 | baja | `product` | abierto | `src/data/blog/primer-empleo-chile-guia-completa.md:194` | Plazo fijo: “3% al FCS”. Son **2,8% CIC + 0,2% FCS**; el trabajador sí acumula CIC (contradice la línea 191 del mismo artículo). |
| D4 | baja | `product` | abierto | `src/data/blog/primer-empleo-chile-guia-completa.md:134` | SIS “1,87%”; la tasa vigente desde agosto 2026 es **1,78%**. Costo del empleador: no altera el líquido. |
| D6 | baja | `product` | abierto | `src/data/blog/primer-empleo-chile-guia-completa.md:110,222,225` | Rotula **10,5% como “ahorro previsional”** (10% + comisión). El total 18,1% solo es exacto para la AFP más barata; el rango es **18,06%–19,05%**. |
| D7 | baja | `product` | abierto | `src/data/laws/dl-3500-sistema-afp.md:31` | Rango de comisiones **0,58%–1,45%**; el mínimo vigente es **0,46%** (Uno). |
| D5 | media | `audit-package` | abierto | `00-scope.json:103`, `evidence/02-primary-sources.txt:118-125` | `idNorma=30053` rotulado como Ley 18.833; 30053 es la **Ley 18.667** (Código de Justicia Militar). Ley 18.833 = **30209**. No contamina el texto publicado; rompe la trazabilidad del paquete. |

**Regla de cierre aplicada:** `PASS` exige cero defectos `product` abiertos
(`AI_AUDIT_PROTOCOL.md` §3). Hay siete, por eso `CONDITIONAL`.

## 4. Qué quedó verificado (sin divergencia)

| Vector | Claim | Independiente | Publicado |
|---|---|---|---|
| V1 | 7% de 90 UF | 6,30 UF | 6,3 UF |
| V2 | 13,5 UTM oct-2026 | $974.038,50 | $974.038,50 |
| V2 | rebaja 4% / límite 30 UTM | $38.961,54 / $2.164.530 | idem |
| V3 | 0,6% de $800.000 | $4.800 | $4.800 |
| V4 | 15% y 45% de $1.000.000 | $150.000 / $450.000 | idem |
| V5 | tope AFC 135,2 UF → 0,6% | 0,8112 UF = $33.412,71 | 135,2 UF |
| V6 | multa 25% diaria | 0,25 = 1/4 exacto | “25% / cuarta parte” |

Bordes ejecutados: 89,99/90,00/90,01 UF; 120 y 150 UF para AFC; 150 UF para
AFP/salud; IUSC en $974.038,50 y $974.038,51; límite 4%→8% en $2.164.530;
15%+30% y 15%+45% (no sumables); base bruto vs imponible; cooperativas
15%+25% y 15%+30%+25% bajo el tope 45%.

La frase “20–22% o más” de `primer-empleo` se verificó con IUSC y es plausible
(18,82% a $1,5M; 20,56% a $3M; 22,85% a $5M). **No es defecto.**

## 5. Reproducibilidad

### Offline (sin red)

```bash
# desde la raíz del repo (el script heredado usa rutas relativas a la raíz)
python3 docs/editorial/audits/descuentos-de-sueldo-20261020/evidence/recalc_audit.py
python3 docs/editorial/audits/descuentos-de-sueldo-20261020/evidence/05-independent-recalc.py
pnpm exec vitest run tests/static-analysis/descuentos-clasificacion-guard.test.ts
pnpm run check:correcciones
pnpm run check:audit-artifacts
```

- `05-independent-recalc.py` usa `Decimal` (prec=50) y solo la biblioteca
  estándar: reproducible sin red.
- El único insumo de red es `04-fetch-source-extracts.py`; su salida ya está
  congelada en `evidence/04-source-extracts-2026-10-20.txt`.

### Online (verificación de fuentes)

| Fuente | URL | Estado |
|---|---|---|
| SP topes 2026 | `spensiones.cl/.../w3-article-16921.html` | 200, cita verificada |
| AFC cotizaciones | `afc.cl/empleadores/.../cotizaciones-cuanto-y-como-se-paga/` | 200, cita verificada; SHA256 varía por tokens |
| SII IUSC 2026 | `sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm` | 200, cita verificada |
| SII UTM 2026 | `sii.cl/valores_y_fechas/utm/utm2026.htm` | 200, cita verificada |
| SP comisiones | `spensiones.cl/.../w3-article-2810.html` | 200, cita verificada |
| SP sistema AFP / SIS | `spensiones.cl/.../w3-propertyvalue-9897.html` | 200, cita verificada |
| DT IMM | `dt.gob.cl/portal/1628/w3-article-60141.html` | 200, cita verificada |
| BCN art. 50 CT | `bcn.cl/leychile/navegar?idNorma=207436` | 200, cita verificada |
| BCN Ley 18.833 | `bcn.cl/leychile/navegar?idNorma=30209` | 200, metadata correcta |
| DT ORD. 680 / 262 | `dt.gob.cl/legislacion/1624/w3-article-111170.html` / `-100110.html` | 200, citas verificadas |

Notas de acceso: BCN `get_norma_json` requiere User-Agent de navegador. Las
páginas de AFC embeben tokens por request, así que su SHA256 cambia entre
descargas; la cita textual es estable.

## 6. Observaciones (no defectos)

- **O1** “AFP Chile Personas” (`primer-empleo:141`): sin fuente primaria que la
  acredite → escalar a compliance/verificación factual.
- **O2** “11 años” vs “cotización N°133”: la fuente oficial usa esa frase;
  sugerencia editorial, no error.
- **O3** “4,75 IMM anuales” en `codigo-del-trabajo:54`: el art. 50 dice “4,75
  ingresos mínimos mensuales”.
- **O4** `reviewPolicy.computedAt: 2026-10-04` se mantiene hasta el
  `humanSignoff` por decisión documentada en el publish packet.
- **O5** Hashes AFC inestables por tokens (usar citas).
- **O6** SIS: 1,54% (Circular 2409, ene-2026) → 1,78% (ago-2026); 1,87% no
  corresponde a ninguna vigencia.
- **O7** Diferidos del dossier (0,6% “universal” en `liquidacion-de-sueldo` y
  `seguro-de-cesantia`) quedan como deuda editorial declarada.

## 7. Artefactos

Todos bajo `docs/editorial/audits/descuentos-de-sueldo-20261020/`:

| Archivo | Contenido |
|---|---|
| `00-scope.json` | alcance (contiene D5 en S10) |
| `01-auditor-prompt.md` | prompt del auditor |
| `02-result.json` | resultado estructurado (17 claims, 8 defectos, veredicto) |
| `03-report.md` | este reporte |
| `05-math-audit.md` | auditoría completa (método, vectores, bordes, defectos) |
| `evidence/01-env.txt` | entorno y commits (heredado) |
| `evidence/02-primary-sources.txt` | descargas y hashes (heredado; D5) |
| `evidence/02b-source-quotes.txt` | citas DT/BCN (heredado) |
| `evidence/03-recalc-vectors-and-edges.txt` | recálculo heredado |
| `evidence/04-fetch-source-extracts.py` | fetcher de fuentes |
| `evidence/04-source-extracts-2026-10-20.txt` | URL + HTTP + SHA256 + cita |
| `evidence/05-independent-recalc.py` | reimplementación independiente |
| `evidence/06-independent-recalc.txt` | 94 checks, 0 mismatches |
| `evidence/07-inherited-evidence-verification.txt` | rerun + idNorma |
| `evidence/08-gates.txt` | Vitest guarda 8/8 + `check:correcciones` |
| `evidence/09-defects-evidence.txt` | `archivo:línea` + impacto D1–D6/D8 |
| `evidence/10-surface-sweep.txt` | barrido §5 (origen de D7) |

## 8. Condición para pasar a PASS

1. Corregir D1–D4, D6–D8 en el producto (una pasada de cifras del clúster) y
   D5 en el paquete de auditoría.
2. Repetir la verificación de los puntos corregidos y actualizar este artefacto
   en una **re-auditoría**, no editando el veredicto.
3. Completar `humanSignoff` con fecha y responsable antes de cualquier
   divulgación pública.

**No se modificó** `src/`, tests, rutas, metadatos, fechas ni contenido. No se
hizo commit ni push.
