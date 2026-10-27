# 05 — Auditoría matemática y de consistencia: `descuentos-de-sueldo` (corrección F01–F08)

- **auditId:** `descuentos-de-sueldo-20261020`
- **Protocolo:** `AI_AUDIT_PROTOCOL v1`
- **Rol:** `MathAuditAgent` (adversarial), sesión independiente de la redacción.
- **Commit auditado (contenido):** `56f15110a0558dd6a23ed83076488d2578ec3294`
- **Commit de alcance:** `38418c0841e7ad28e69c825537976aed32531485` (= HEAD de la rama `fix/descuentos-de-sueldo-art58-2026-10-20`)
- **Fecha de auditoría:** 2026-10-20
- **Modelo auditor:** DeepSeek V4.1 Flash (OpenCode)
- **Veredicto:** **CONDITIONAL** (ver §8)
- **`humanSignoff`:** `null` — esta auditoría es un pre-gate, no reemplaza la firma humana.

---

## 1. Resumen ejecutivo

La aritmética de la corrección F01–F08 es correcta. Los seis vectores del alcance
(V1–V6) se recalcularon de forma independiente con `Decimal` (prec=50) y **coinciden
exactamente** con el texto publicado. La reimplementación completa ejecutó **94
comprobaciones con 0 divergencias** (`evidence/06-independent-recalc.txt`, exit 0).

Las divergencias que impiden un `PASS` **no están en los vectores corregidos**, sino
en números y plazos de páginas del mismo clúster que la corrección tocó o que citan
los mismos hechos:

| # | Superficie | Hallazgo | Severidad |
|---|---|---|---|
| D1 | producto | Tope de gratificación con IMM vencido (`$539.000` en vez de `$553.553`): subestima el tope en **$69.126,75** | media |
| D2 | producto | Ejemplo de sueldo líquido rotula a **Capital con 0,58%** (la tasa de Modelo; Capital es 1,44%): comisión subestimada en **$11.610** | media |
| D8 | producto | Guía del primer empleo dice **12 meses** para cambiarse de AFP; la SP fija **24 meses** | media |
| D3 | producto | Plazo fijo: “3% al FCS”; en realidad **2,8% CIC + 0,2% FCS** | baja |
| D4 | producto | SIS “1,87%”; la tasa vigente desde agosto de 2026 es **1,78%** | baja |
| D6 | producto | Tabla de presupuesto rotula **10,5% como “ahorro previsional”** (10% + comisión) | baja |
| D7 | producto | `dl-3500-sistema-afp.md` da el rango de comisiones como **0,58%–1,45%**; es **0,46%–1,45%** | baja |
| D5 | paquete de auditoría | `idNorma=30053` etiquetado como Ley 18.833; ese id es la **Ley 18.667** (Código de Justicia Militar). La Ley 18.833 es **30209** | media |

Ninguno de estos defectos exige rehacer la corrección: F01–F08 queda
matemáticamente validada. Pero `PASS` exige **cero defectos de producto abiertos**
(`docs/editorial/AI_AUDIT_PROTOCOL.md` §3), y hay siete.

---

## 2. Método y reproducibilidad (R1, R4, R7)

### 2.1 Entorno

| Dato | Valor |
|---|---|
| SO | Linux 7.0.0-38-generic x86_64 |
| Node | v24.19.0 |
| pnpm | 11.7.0 |
| Python | 3.13.12 |
| Precisión decimal | `Decimal` con `prec=50`; CLP redondeado half-up al peso solo para presentación |
| Worktree | `/tmp/claude-1000/wt-descuentos` |
| HEAD | `38418c0841e7ad28e69c825537976aed32531485` |

### 2.2 Comandos exactos

```bash
# 1. Reproducir la evidencia heredada (debe correr desde la raíz del repo:
#    recalc_audit.py abre el snapshot con ruta relativa a la raíz)
python3 docs/editorial/audits/descuentos-de-sueldo-20261020/evidence/recalc_audit.py \
  > /tmp/recalc_rerun.txt
diff -u docs/editorial/audits/descuentos-de-sueldo-20261020/evidence/03-recalc-vectors-and-edges.txt \
        /tmp/recalc_rerun.txt          # exit 0, byte-idéntico

# 2. Reimplementación independiente (script nuevo, no importa el heredado)
python3 docs/editorial/audits/descuentos-de-sueldo-20261020/evidence/05-independent-recalc.py

# 3. Extractos literales de fuentes primarias (HTTP + SHA256 + cita)
python3 docs/editorial/audits/descuentos-de-sueldo-20261020/evidence/04-fetch-source-extracts.py

# 4. Gates estáticos del repo (solo lectura)
pnpm exec vitest run tests/static-analysis/descuentos-clasificacion-guard.test.ts
pnpm run check:correcciones
pnpm run check:audit-artifacts
```

### 2.3 Evidencia producida

| Archivo | Contenido |
|---|---|
| `evidence/01-env.txt` | entorno y commits (heredado) |
| `evidence/02-primary-sources.txt` | descargas y hashes (heredado; ver D5) |
| `evidence/02b-source-quotes.txt` | extractos literales DT/BCN (heredado) |
| `evidence/03-recalc-vectors-and-edges.txt` | salida del recálculo heredado |
| `evidence/04-fetch-source-extracts.py` | fetcher reproducible de fuentes |
| `evidence/04-source-extracts-2026-10-20.txt` | URL + HTTP + SHA256 + cita literal por fuente |
| `evidence/05-independent-recalc.py` | reimplementación independiente V1–V6 + cruces |
| `evidence/06-independent-recalc.txt` | salida cruda: **94 checks, 0 mismatches** |
| `evidence/07-inherited-evidence-verification.txt` | rerun byte-idéntico + verificación del `idNorma` |
| `evidence/08-gates.txt` | Vitest de la guarda y `check:correcciones` (exit 0) |
| `evidence/09-defects-evidence.txt` | `archivo:línea` + impacto calculado de cada defecto |
| `evidence/10-surface-sweep.txt` | barrido de superficies §5 del protocolo |

### 2.4 Verificación de la evidencia heredada

- `recalc_audit.py` se reejecutó y su salida es **byte-idéntica** a
  `03-recalc-vectors-and-edges.txt` (`diff` vacío, exit 0; SHA256
  `c0dd6c7f…` en ambos). La evidencia heredada es confiable.
- **Caveat de reproducibilidad:** el script heredado solo funciona con cwd = raíz
  del repo. Ejecutado desde `evidence/` falla con `FileNotFoundError`. Queda
  documentado en `07-inherited-evidence-verification.txt`.
- Los hashes SHA256 de las páginas de AFC cambian entre descargas porque el HTML
  embebe tokens por request. Las citas textuales son estables; los hashes no
  deben usarse como prueba de identidad byte a byte en ese dominio.

---

## 3. Parámetros y fuentes primarias (R2)

Todos consultados el **2026-10-20** con User-Agent de navegador. Extractos
literales en `evidence/04-source-extracts-2026-10-20.txt`.

| Parámetro | Valor | Fuente | Cita literal (extracto) |
|---|---|---|---|
| Tope AFP/salud 2026 | 90,0 UF | SP, topes 2026 (S1) | “el tope imponible mensual para calcular las cotizaciones obligatorias del sistema de AFP, de salud y de ley de accidentes del trabajo será de 90,0 UF, mientras que, en el caso del seguro de cesantía, quedará en 135,2 UF” |
| Tope cesantía 2026 | 135,2 UF | SP, topes 2026 (S1) | ídem |
| Vigencia de topes | remuneraciones de febrero 2026 | SP (S1) | “se aplicarán a partir del pago de las cotizaciones previsionales correspondientes a las remuneraciones de febrero de 2026” |
| UTM octubre 2026 | $72.151 | SII, UTM 2026 (S3c) | fila “Octubre 72.151 865.812” |
| UTM marzo/abril 2026 | $69.889 | SII, UTM 2026 (S3c) | filas “Marzo 69.889”, “Abril 69.889” |
| Tramo exento IUSC oct-2026 | $974.038,50 (13,5 UTM) | SII, tabla IUSC (S3) | “MENSUAL -.- $ 974.038,50 Exento … $ 974.038,51 $ 2.164.530,00 0,04 $ 38.961,54” |
| Tramo exento IUSC abr-2026 | $943.501,50 | SII, tabla IUSC (S3b) | “$ 943.501,50 Exento … $ 2.096.670,00 0,04 $ 37.740,06” |
| Cesantía trabajador | 0,6% | AFC (S2) | “*El trabajador aporta 0,6% para su Cuenta Individual.” |
| Límite cesantía trabajador | 11 años / N°133 | AFC (S2) | “11 años por cada relación laboral, cumplido con la cotización N°133. Después de ese período, usted debe continuar aportando un 0,8% … al Fondo de Cesantía Solidario” |
| Aporte empleador indefinido | 1,6% CIC + 0,8% FCS | AFC (S2b) | tabla “Cuenta Individual 1,6%* … Fondo de Cesantía Solidario 0,8%” |
| Aporte empleador plazo fijo | 2,8% CIC + 0,2% FCS | AFC (S2b) | tabla “Cuenta Individual … 2,8% … Fondo de Cesantía Solidario … 0,2%” |
| Comisiones AFP 2026 | 0,46%–1,45% | SP, comisiones (S11) | “Las comisiones mensuales que actualmente cobran las administradoras son las siguientes: AFP Capital: 1,44% … AFP Modelo: 0,58% … AFP Provida: 1,45% … AFP Uno: 0,46%” |
| SIS desde ago-2026 | 1,78% | SP, sistema AFP (S12) | “Desde agosto de 2026, la tasa vigente del SIS para empleadores, afiliadas y afiliados independientes y voluntarios es de 1,78%” |
| IMM desde 01-05-2026 | $553.553 | DT, consulta 60141 (S13) | “A contar del 01 de mayo de 2026 el Ingreso Mínimo Mensual es de: $553.553 … De acuerdo con lo establecido por la Ley N°21.830 (Diario Oficial de fecha 22.06.2026)” |
| Tope gratificación | 4,75 IMM | BCN, art. 50 CT (S9) | “la gratificación de cada trabajador no excederá de cuatro y tres cuartos (4,75) ingresos mínimos mensuales” |
| Tope 15% / 45% | 15% / 45% de la remuneración total | DT ORD. 680 (S4) | “no podrán exceder del quince por ciento de la remuneración total del trabajador”; “en ningún caso aquéllas podrán exceder, en conjunto, del 45% de la remuneración total” |
| Tope 30% vivienda/educación | 30% | DT ORD. 680 (S4) | “podrá hacerse pago deduciendo hasta el 30% del total de la remuneración mensual” |
| Multa reglamento | 25% de la remuneración diaria | DT ORD. 680 / BCN (S4) | “multa de hasta el veinticinco por ciento de la remuneración diaria”; “no podrá exceder de la cuarta parte de la remuneración diaria del infractor” |
| CCAF fuera del 45% | obligatorio, inciso 1 | DT ORD. 262/4 (S6) | “no procede por tanto considerarlos en el tope del 45% … que rige únicamente para el conjunto de los descuentos facultativos o permitidos de los incisos 2º y 3º” |
| Ley 18.833 art. 22 | crédito social | BCN `idNorma=30209` (S10) | “deberá ser deducido de la remuneración por la entidad empleadora afiliada, retenido y remesado a la Caja acreedora, y se regirá por las mismas normas de pago y de cobro que las cotizaciones previsionales” |

**UF ($41.189,24):** proviene del snapshot interno
(`src/infrastructure/economic/economic-parameters.snapshot.json`, `mindicador.cl`,
`provenance` SII para UTM). Se usa **solo** para conversiones informativas a CLP;
ningún claim publicado depende de ese valor en pesos, por lo que no se le exige
ancla primaria adicional. Las conversiones están marcadas como referencia en §4.

---

## 4. Vectores V1–V6: recálculo independiente vs. publicado

Salida completa: `evidence/06-independent-recalc.txt`. Resumen:

| ID | Claim publicado | Valor independiente | Valor publicado | Resultado |
|---|---|---|---|---|
| V1 | 7% de 90 UF = 6,3 UF | `90 × 0,07 = 6,30 UF` | 6,3 UF | **MATCH** |
| V1 | (referencia CLP) | `6,30 × 41.189,24 = 259.492,212` | no publicado | 259.492 CLP |
| V2 | 13,5 UTM oct-2026 = $974.038,50 | `13,5 × 72.151 = 974.038,50` | $974.038,50 | **MATCH** |
| V2 | tramo 4% | `0,04 × 974.038,50 = 38.961,54` (rebaja) | $38.961,54 | **MATCH** |
| V2 | límite 30 UTM | `30 × 72.151 = 2.164.530` | $2.164.530,00 | **MATCH** |
| V3 | 0,6% de $800.000 = $4.800 | `800.000 × 0,006 = 4.800` | $4.800 | **MATCH** |
| V3 | anualizado (borde) | `12 × 4.800 = 57.600` | no publicado | 57.600 CLP |
| V4 | 15% de $1.000.000 = $150.000 | `1.000.000 × 0,15 = 150.000` | $150.000 | **MATCH** |
| V4 | 45% de $1.000.000 = $450.000 | `1.000.000 × 0,45 = 450.000` | $450.000 | **MATCH** |
| V4 | 30% vivienda/educación | `1.000.000 × 0,30 = 300.000` | $300.000 (implícito) | **MATCH** |
| V5 | 0,6% del tope AFC | `135,2 × 0,006 = 0,8112 UF` = $33.412,71 | no publicado | 0,8112 UF / 33.413 CLP |
| V5 | 11 años | `11 × 12 = 132` meses; AFC declara “cotización N°133” | “11 años (cotización N°133)” | **MATCH** (frase de la fuente) |
| V6 | 25% diario = 1/4 | `0,25 = 1/4` exacto | 25% / “cuarta parte” | **MATCH** |
| V6 | multa sobre $1.000.000/mes | diaria `33.333,33`; multa `8.333,33` | no publicado | 8.333 CLP |

### 4.1 Bordes ejecutados (R5)

| Borde | Resultado | Lectura |
|---|---|---|
| Imponible 89,99 UF → 7% | 6,2993 UF | sin tope, proporcional |
| Imponible 90,00 UF → 7% | 6,30 UF | justo en el tope |
| Imponible 90,01 UF → 7% | 6,30 UF | tope aplicado (no 6,3007) |
| Imponible 135,2 UF → 7% | 6,30 UF | el tope de salud **no** sigue al de cesantía |
| Imponible 120 UF → AFC 0,6% | 0,720 UF | AFC usa su propio tope (120 < 135,2) |
| Imponible 150 UF → AFC 0,6% | 0,8112 UF | AFC topa en 135,2 UF |
| Imponible 150 UF → AFP/salud | base 90 UF | 45,2 UF quedan fuera de cotización |
| IUSC RLI $974.038,50 | $0 | borde exento exacto |
| IUSC RLI $974.038,51 | $0,0004 → $0 | continuidad en el borde |
| IUSC RLI $2.164.530 (4%→8%) | $47.619,66 por ambas ramas | tabla SII internamente consistente |
| No aditividad 15%+30% | $450.000 = tope conjunto | no son 60% |
| Suma ingenua 15%+45% | $600.000 > $450.000 | no son sumables |
| Base bruto vs imponible (15%) | $225.000 vs $202.500; Δ $22.500 | la base es la remuneración **total** |
| Cooperativas 15%+25% | $400.000 ≤ 45% | regla adicional respeta el 45% |
| Cooperativas + vivienda 15+30+25 | tope $450.000 (no $700.000) | el 45% manda |
| Comisión mínima vs máxima ($1.000.000) | $9.900/mes; $118.800/año | coincide con el texto |
| Comisión mínima vs máxima ($1.350.000) | $13.365/mes; $160.380/año | no publicado; referencia |

### 4.2 Consistencia interna de la tabla SII

Se reconstruyó cada “cantidad a rebajar” desde el tramo anterior
(`rebaja_i = (tasa_i − tasa_{i−1}) × límite_i + rebaja_{i−1}`). Las **siete**
rebajas de octubre 2026 coinciden exactamente con la tabla oficial, y el impuesto
es continuo en cada límite. No hay error de tabla ni de UTM.

---

## 5. Cruces entre superficies

### 5.1 Ejemplo completo de `como-calcular-sueldo-liquido.md`

Con imponible $1.350.000 y los valores publicados:

| Concepto | Con 0,58% (publicado) | Con 1,44% (Capital real) |
|---|---|---|
| AFP 10% | $135.000 | $135.000 |
| Comisión | $7.830 | $19.440 |
| Salud 7% | $94.500 | $94.500 |
| Cesantía 0,6% | $8.100 | $8.100 |
| **Total cotizaciones** | **$245.430** | **$257.040** |
| RLI | $1.104.570 | $1.092.960 |
| IUSC abril 2026 (4%, rebaja $37.740,06) | $6.442,74 → $6.443 | $5.978,34 → $5.978 |
| **Líquido** | **$1.248.127,26** | **$1.236.981,66** |

- La aritmética **con 0,58% es internamente correcta** (por eso el ejemplo “cuadra”).
- El problema es el rótulo: 0,58% es la comisión de **Modelo**, no de **Capital**
  (1,44%, tabla de la misma página y SP). El líquido queda sobrestimado en
  **$11.145,60** (comisión $11.610 menos $464,40 de menor IUSC).

### 5.2 Suma de descuentos de `primer-empleo`

`10,5 + 7,0 + 0,6 = 18,1%` es aritméticamente correcto, pero:
- 10,5% mezcla 10% de ahorro con ~0,46–1,45 pp de comisión;
- el total real va de **18,06%** (Uno) a **19,05%** (Provida);
- para un afiliado nuevo (asignado a la AFP más barata) 18,1% es la cifra
  correcta, así que el error es de **rótulo**, no de suma.

### 5.3 Carga con IUSC (verificación de “20–22%”)

Sobre imponible, con comisión mínima y tabla de abril 2026:

| Imponible | Descuentos legales | IUSC | Carga total |
|---|---|---|---|
| $1.500.000 | 18,06% | $11.424 | 18,82% |
| $2.000.000 | 18,06% | $27.812 | 19,45% |
| $3.000.000 | 18,06% | $75.049 | 20,56% |
| $5.000.000 | 18,06% | $239.293 | 22,85% |

La frase “puede llegar a 20-22% o más dependiendo del rango de ingreso” es
plausible y está cubierta por “o más”. **No es defecto.**

### 5.4 Tope de gratificación (`codigo-del-trabajo.md`)

| Cálculo | Resultado |
|---|---|
| `4,75 × 539.000` | $2.560.250 (lo publicado; la multiplicación es correcta) |
| `4,75 × 553.553` | **$2.629.376,75** (IMM vigente desde 01-05-2026) |
| Diferencia | **$69.126,75** |
| Subestimación relativa | **2,6290%** del valor correcto (2,7000% del publicado) |

La página hermana `gratificacion-legal-chile.md:108` ya usa
`$553.553 × 4,75 = $2.629.377`, y el motor (`resultRenderer.ts`) usa
`4,75 × IMM ÷ 12` con el IMM del snapshot. `codigo-del-trabajo.md` es el outlier.

### 5.5 Otros cruces verificados sin divergencia

- `descuentos-de-sueldo.md`: 90 UF / 135,2 UF / 6,3 UF / 11 años / 15% / 30% / 45%
  / $4.800 / $974.038,50 → todos coinciden con fuente y con cálculo.
- `liquidacion-de-sueldo.md`: 7% hasta 90 UF; 0,6% solo indefinido → consistente.
- `correcciones.json` entrada `descuentos-sueldo-clasificacion-bases-atrasos`:
  las cinco materias declaradas están implementadas en el cuerpo; el monto
  $974.038,50 coincide con SII octubre 2026.
- `cuanto-descuenta-la-afp-de-tu-sueldo.md`: $9.900 / $118.800 → coincide.
- `sueldo-imponible-chile.md` y glosario: 90 UF / 135,2 UF → coinciden.

---

## 6. Defectos

Formato: id, severidad, superficie, estado. Evidencia línea a línea e impacto en
`evidence/09-defects-evidence.txt`.

### D1 — Tope de gratificación con IMM vencido · **media** · `product` · abierto

**Archivo:** `src/data/laws/codigo-del-trabajo.md:54`

> “con un tope de **4,75 IMM anuales** (equivale a aproximadamente $539.000 × 4,75 =
> $2.560.250 al año con el IMM vigente a mayo de 2026)”

El IMM vigente a mayo de 2026 es **$553.553** (DT, Ley 21.830). El tope correcto es
**$2.629.376,75**; el texto lo subestima en **$69.126,75 (2,63%)**. La
multiplicación es correcta; el parámetro está vencido. Contradice a
`gratificacion-legal-chile.md:108` y al motor.
*Nota de redacción:* “4,75 IMM anuales” es impreciso (el art. 50 dice “4,75
ingresos mínimos mensuales”); el paréntesis en pesos desambigua. Ver O3.

### D2 — Capital rotulada con la comisión de Modelo · **media** · `product` · abierto

**Archivo:** `src/data/blog/como-calcular-sueldo-liquido.md:180,186` (tabla
correcta en `:123`)

> “afiliado a Capital AFP (comisión 0,58%, total AFP 10,58%)”
> “(-) AFP comisión 0,58% … -$7.830”

Capital cobra **1,44%** (SP; misma página, línea 123). 0,58% es Modelo. La comisión
real es **$19.440**, no $7.830: **$11.610** de diferencia; el líquido del ejemplo
queda sobrestimado en **$11.145,60** tras el ajuste de IUSC.

### D3 — Plazo fijo: “3% al FCS” · **baja** · `product` · abierto

**Archivo:** `src/data/blog/primer-empleo-chile-guia-completa.md:194`

> “Si tienes contrato a plazo fijo, solo cotiza el empleador (3% al FCS)”

La AFC distribuye el 3% en **2,8% CIC + 0,2% FCS**. El trabajador sí acumula CIC
(2,8%), como el propio artículo explica en `:191`. No cambia montos; cambia el
fondo de destino.

### D4 — SIS “1,87%” · **baja** · `product` · abierto

**Archivo:** `src/data/blog/primer-empleo-chile-guia-completa.md:134`

> “SIS … de aproximadamente 1,87 % de la remuneración”

La SP fija **1,78%** desde agosto de 2026. Diferencia: 0,09 pp ($900 por cada
$1.000.000 de remuneración). Es costo del empleador: **no altera el líquido**.

### D5 — `idNorma=30053` no es la Ley 18.833 · **media** · `audit-package` · abierto

**Archivos:** `00-scope.json:103` (S10) y `evidence/02-primary-sources.txt:118-125`

El paquete etiqueta `idNorma=30053` como “Ley 18.833”. El metadata de BCN dice:

- `30053` → **LEY-18667**, “MODIFICA EL CODIGO DE JUSTICIA MILITAR Y EL CODIGO DE
  PROCEDIMIENTO PENAL”.
- `30209` → **LEY-18833**, “ESTABLECE UN NUEVO ESTATUTO GENERAL PARA LAS CAJAS DE
  COMPENSACIÓN…”.

La cita del art. 22 usada en el artículo es correcta y ya estaba tomada desde
`30209` en `02b-source-quotes.txt:142-145`; el error es solo de rotulación/URL y no
contamina el texto publicado, pero rompe la trazabilidad del paquete. **Corregir la
URL en el scope y en `02-primary-sources.txt` a `idNorma=30209`.**

### D6 — “Ahorro previsional 10,5%” · **baja** · `product` · abierto

**Archivo:** `src/data/blog/primer-empleo-chile-guia-completa.md:110,222,225`

La fila “AFP (ahorro previsional) 10,5%” suma 10% de ahorro + ~0,46 pp de comisión.
Solo el 10% es ahorro; la comisión es costo. El total 18,1% es correcto para la AFP
más barata (afiliado nuevo), pero no para el rango completo (18,06–19,05%).

### D7 — Rango de comisiones 0,58%–1,45% · **baja** · `product` · abierto

**Archivo:** `src/data/laws/dl-3500-sistema-afp.md:31`

> “la comisión de la AFP (varía entre 0,58% y 1,45% aproximadamente según AFP)”

El mínimo vigente es **0,46%** (Uno, desde 01-10-2025). El rango correcto es
**0,46%–1,45%**. Subestima el diferencial máximo en 0,12 pp ($1.200/mes por cada
$1.000.000; $14.400/año). Es una variante del mismo hecho que la corrección
delimita en el artículo principal; apareció en el barrido §5.

### D8 — Plazo para cambiarse de AFP: 12 vs 24 meses · **media** · `product` · abierto

**Archivo:** `src/data/blog/primer-empleo-chile-guia-completa.md:142,267`

> “Tienes **12 meses** para cambiarte a otra AFP sin restricciones adicionales.”
> “¿Puedes elegir AFP? — Sí, dentro de los primeros 12 meses sin restricción.”

La SP es explícita: quien se afilia por primera vez “debe ingresar a la
administradora que cobra la menor comisión y **permanecer en ella por un período de
24 meses**” (salvo alza de comisión o de otra AFP más barata). El plazo publicado
está a la mitad. Afecta una decisión del lector, no un monto.

---

## 7. Observaciones (no cuentan como defecto)

- **O1 — “AFP Chile Personas”** (`primer-empleo:141`): no encontré fuente primaria
  que acredite esa administradora; la SP describe la asignación por licitación a la
  AFP de menor comisión (hoy Uno). **Escalar a compliance/verificación factual**;
  no lo clasifico como defecto porque no tengo fuente que pruebe su inexistencia.
- **O2 — 11 años vs N°133:** 11 años = 132 meses, pero la AFC declara el hito como
  “cotización N°133”. El artículo reproduce la frase oficial; no es un error de
  Monedario, pero un lector puede contar 133 meses. Sugerencia editorial: “132
  cotizaciones (la AFC lo describe como ‘cumplido con la cotización N°133’)”.
- **O3 — “4,75 IMM anuales”** (`codigo-del-trabajo:54`): el art. 50 dice “4,75
  ingresos mínimos mensuales”; “anuales” califica el monto de gratificación, no el
  IMM. El paréntesis en pesos evita la ambigüedad.
- **O4 — `reviewPolicy.computedAt: 2026-10-04`** en `descuentos-de-sueldo.md`:
  anterior a la corrección (2026-10-20). El publish packet documenta que se
  mantiene hasta el `humanSignoff` para no afirmar una revisión humana inexistente.
  Consistente con la decisión; no es defecto.
- **O5 — Hashes AFC:** el SHA256 de las páginas de AFC cambia entre requests por
  tokens embebidos. No usar el hash como prueba de estabilidad; usar la cita.
- **O6 — Tasa SIS 2026 en transición:** Circular SP N°2409 (feb-2026) informa
  1,54% desde enero 2026; la SP informa 1,78% desde agosto 2026. Cualquier valor
  intermedio (1,87%) no corresponde a ninguna de las dos. Refuerza D4.
- **O7 — Diferidos conocidos:** el dossier difiere a la causa AFC la línea del 0,6%
  “universal” de `liquidacion-de-sueldo` y `seguro-de-cesantia`. No los cuento como
  defectos nuevos; quedan registrados como deuda editorial declarada.

---

## 8. Veredicto

**CONDITIONAL.**

- **Lo que sí queda validado:** V1–V6, la tabla de bases/topes, la no aditividad
  15/30/45, la distinción 90 UF vs 135,2 UF, el tope AFC de 0,8112 UF, el tramo
  exento de octubre y la continuidad de la tabla SII. 94/94 comprobaciones
  independientes sin divergencia.
- **Por qué no `PASS`:** siete defectos de producto abiertos (D1, D2, D8 medias;
  D3, D4, D6, D7 bajas). El protocolo exige cero defectos de producto abiertos
  para `PASS`.
- **Por qué no `FAIL`:** ninguno de los defectos afecta los vectores corregidos ni
  invalida F01–F08; son parámetros/etiquetas arrastrados en páginas del clúster y
  una URL de evidencia. La corrección no necesita rehacerse, sí una pasada de
  cifras en las páginas relacionadas.
- **Bloqueo:** `CONDITIONAL` bloquea publicación hasta remediar los defectos de
  producto y repetir la verificación de los puntos D1–D8.

---

## 9. Matriz de superficies (§5)

Barrido en `evidence/10-surface-sweep.txt` (patrones `539.000`, `2.560.250`,
`0,58%`, `1,87`, `974.038`, `6,3 UF`, `135,2`, `4,75`, `18,1 %`, `118.800`).

| Superficie | Estado |
|---|---|
| Cuerpo | V1–V6 correctos; D2, D3, D4, D6, D8 en páginas relacionadas |
| Metadatos | `validAsOf` / `updatedDate` consistentes en el artículo principal; `computedAt` según decisión documentada (O4) |
| Datos estructurados | Sin JSON-LD manual con estas cifras; `FAQPage` no se emite en este post (preexistente) |
| Catálogo / LLM | Sin recurrencias de las cifras en `llms*.txt` ni `calculatorPortfolio.ts` |
| Contenido relacionado | D1 (`codigo-del-trabajo`), D7 (`dl-3500`), D2/D6/D8 (`primer-empleo`, `como-calcular`); `gratificacion-legal-chile` y `cuanto-descuenta-la-afp` ya tienen el valor correcto |
| Motor y tests | `resultRenderer.ts` usa `4,75 × IMM ÷ 12` con IMM 553.553 (correcto); la guarda `descuentos-clasificacion-guard.test.ts` pasa 8/8 pero **no cubre vectores numéricos** |

---

## 10. Limitaciones de esta auditoría

- No es compliance: no re-audité la interpretación normativa de F01–F08 (arts. 58,
  154, 157, Ley 18.833) más allá de comprobar que las citas y topes usados
  coinciden con la fuente.
- No ejecuté build ni Playwright: el alcance es numérico/estático. La verificación
  de HTML construido (JSON-LD, tablas renderizadas) queda para el HumanEditor.
- La UF en pesos es del snapshot, no de una fuente primaria; se usa solo para
  conversiones informativas.
- `humanSignoff` queda en `null`.
