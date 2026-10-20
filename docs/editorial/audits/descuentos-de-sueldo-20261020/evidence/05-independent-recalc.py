#!/usr/bin/env python3
"""Independent recalculation of V1-V6 and cross-surface numbers (R3/R5).

Written from scratch for this audit (does not import or copy
recalc_audit.py). Every number is computed with Decimal at prec=50; no
floating point, no mental arithmetic. CLP amounts are rounded half-up to the
peso, UF amounts to 4 decimals, only for presentation. The exact Decimal is
printed next to the rounded value so rounding can be audited separately.

Run: python3 05-independent-recalc.py
Exit code 1 if any published value fails to match.
"""

from __future__ import annotations

import json
from decimal import Decimal as D, ROUND_HALF_UP, getcontext

getcontext().prec = 50

# ---------------------------------------------------------------- parameters
# Snapshot src/infrastructure/economic/economic-parameters.snapshot.json
UF = D("41189.24")
UTM_OCT = D("72151")
UTM_MAR_ABR = D("69889")
CAP_PREV_UF = D("90")
CAP_AFC_UF = D("135.2")
IMM_2026 = D("553553")  # DT consulta 60141, Ley 21.830, from 2026-05-01
IMM_STALE = D("539000")  # value printed in src/data/laws/codigo-del-trabajo.md

# SII table, October 2026 (monthly): (lower bound, rate, rebaja)
SII_OCT = [
    (D("974038.50"), D("0.04"), D("38961.54")),
    (D("2164530.00"), D("0.08"), D("125542.74")),
    (D("3607550.00"), D("0.135"), D("323957.99")),
    (D("5050570.00"), D("0.23"), D("803762.14")),
    (D("6493590.00"), D("0.304"), D("1284287.80")),
    (D("8658120.00"), D("0.35"), D("1682561.32")),
    (D("22366810.00"), D("0.40"), D("2800901.82")),
]
# SII table, April 2026 (monthly)
SII_APR = [
    (D("943501.50"), D("0.04"), D("37740.06")),
    (D("2096670.00"), D("0.08"), D("121606.86")),
    (D("3494450.00"), D("0.135"), D("313801.61")),
    (D("4892230.00"), D("0.23"), D("778563.46")),
    (D("6290010.00"), D("0.304"), D("1244024.20")),
    (D("8386680.00"), D("0.35"), D("1629811.48")),
    (D("21665590.00"), D("0.40"), D("2713090.98")),
]

RESULTS: list[tuple[str, bool, str]] = []


def clp(x: D) -> D:
    return x.quantize(D("1"), rounding=ROUND_HALF_UP)


def uf(x: D) -> D:
    return x.quantize(D("0.0001"), rounding=ROUND_HALF_UP)


def check(label: str, computed: D, published: D | None, note: str = "") -> D:
    if published is None:
        ok = True
        verdict = "INFO"
    else:
        ok = computed == published
        verdict = "MATCH" if ok else "MISMATCH"
    RESULTS.append((label, ok, verdict))
    pub = "" if published is None else f" | published={published}"
    print(f"[{verdict}] {label}: computed={computed}{pub}{(' | ' + note) if note else ''}")
    return computed


def tax(rli: D, table: list[tuple[D, D, D]]) -> D:
    """IUSC by the SII table: highest bracket whose lower bound is <= rli."""
    if rli <= table[0][0]:
        return D("0")
    for lower, rate, rebaja in reversed(table):
        if rli >= lower:
            return rate * rli - rebaja
    return D("0")


def capped(base: D, cap: D) -> D:
    return base if base <= cap else cap


print("=== INDEPENDENT RECALCULATION (Decimal prec=50) ===")
print(f"UF={UF} UTM_oct={UTM_OCT} UTM_mar_abr={UTM_MAR_ABR} cap_prev={CAP_PREV_UF} UF cap_afc={CAP_AFC_UF} UF IMM={IMM_2026}")
print()

# ---------------------------------------------------------------------- V1
print("--- V1 | Salud 7% sobre tope de 90 UF ---")
v1 = CAP_PREV_UF * D("0.07")
check("V1 90 UF * 7% (UF)", v1, D("6.30"))
check("V1 6,3 UF en CLP", clp(v1 * UF), D("259492"))
for base in ("89.99", "90", "90.01", "120", "135.2", "150"):
    b = D(base)
    eff = capped(b, CAP_PREV_UF)
    check(
        f"V1 borde imponible={base} UF -> base 7%={eff} UF -> 7%={eff * D('0.07')} UF",
        eff * D("0.07"),
        None,
    )
# Linearity: capping in UF then converting equals capping in CLP then 7%.
check(
    "V1 linealidad (7% de 90 UF en CLP == 7% del tope en CLP)",
    clp(v1 * UF),
    clp(capped(CAP_PREV_UF * UF, CAP_PREV_UF * UF) * D("0.07")),
)
print()

# ---------------------------------------------------------------------- V2
print("--- V2 | Tramo exento IUSC octubre 2026 ---")
v2 = D("13.5") * UTM_OCT
check("V2 13,5 * 72.151", v2, D("974038.50"))
check("V2 30 * 72.151 (limite superior tramo 4%)", D("30") * UTM_OCT, D("2164530.00"))
check("V2 rebaja 4% == 0,04 * 974.038,50", D("0.04") * v2, D("38961.54"))

# Rebuild every rebaja from the previous bracket and compare with the SII table.
# Continuity: rate_i*lower_i - rebaja_i == rate_{i-1}*lower_i - rebaja_{i-1}
# => rebaja_i == (rate_i - rate_{i-1})*lower_i + rebaja_{i-1}
print("  V2 consistencia interna de la tabla SII (rebaja = (tasa_i - tasa_prev)*limite_i + rebaja_prev):")
prev_rate, prev_rebaja = D("0"), D("0")
for lower, rate, rebaja in SII_OCT:
    implied = (rate - prev_rate) * lower + prev_rebaja
    check(f"  V2 rebaja implicita en {lower} ({rate})", implied, rebaja)
    prev_rate, prev_rebaja = rate, rebaja

for rli in ("974038.50", "974038.51", "1000000", "2164530"):
    t = tax(D(rli), SII_OCT)
    check(f"V2 IUSC octubre RLI={rli} (exacto)", t, None, f"CLP={clp(t)}")
check(
    "V2 continuidad 4%->8% en 2.164.530",
    D("0.08") * D("2164530") - D("125542.74"),
    D("0.04") * D("2164530") - D("38961.54"),
)
check("V2 13,5 * 69.889 (marzo/abril 2026)", D("13.5") * UTM_MAR_ABR, D("943501.50"))
check("V2 30 * 69.889 (marzo/abril 2026)", D("30") * UTM_MAR_ABR, D("2096670"))
print()

# ---------------------------------------------------------------------- V3
print("--- V3 | Cesantia trabajador 0,6% de $800.000 ---")
v3 = D("800000") * D("0.006")
check("V3 800.000 * 0,6%", v3, D("4800"))
check("V3 anualizado si se aplica por error a plazo fijo", D("12") * v3, D("57600"))
check("V3 empleador indefinido 2,4% (1,6 CIC + 0,8 FCS)", D("800000") * D("0.024"), D("19200"))
check("V3 empleador plazo fijo 3,0% (2,8 CIC + 0,2 FCS)", D("800000") * D("0.030"), D("24000"))
check("V3 brecha trabajador == 0,6%", D("800000") * (D("0.030") - D("0.024")), v3)
afc_max_uf = CAP_AFC_UF * D("0.006")
check("V3 0,6% de 135,2 UF (UF)", afc_max_uf, D("0.8112"))
check("V3 0,6% de 135,2 UF (CLP)", clp(afc_max_uf * UF), D("33413"))
print()

# ---------------------------------------------------------------------- V4
print("--- V4 | Topes art. 58 sobre remuneracion total ---")
rem = D("1000000")
check("V4 15% de 1.000.000", rem * D("0.15"), D("150000"))
check("V4 30% de 1.000.000", rem * D("0.30"), D("300000"))
check("V4 45% de 1.000.000", rem * D("0.45"), D("450000"))
check(
    "V4 no aditividad: 15% + 30% = 45% (no 60%)",
    rem * D("0.15") + rem * D("0.30"),
    rem * D("0.45"),
)
check(
    "V4 suma ingenua 15% + 45% = 60% excede el tope conjunto",
    rem * (D("0.15") + D("0.45")),
    D("600000"),
    "600.000 > 450.000: no son sumables",
)
# Base: total gross pay, not imponible.
bruto, imponible = D("1500000"), D("1350000")
check("V4 15% sobre bruto (1.500.000)", bruto * D("0.15"), D("225000"))
check("V4 15% sobre imponible (1.350.000)", imponible * D("0.15"), D("202500"))
check("V4 diferencia de base 15%", bruto * D("0.15") - imponible * D("0.15"), D("22500"))
check("V4 45% sobre bruto", bruto * D("0.45"), D("675000"))
# Cooperatives (DT ORD. 3456/37): extra 25% still subject to the 45% joint cap.
check("V4 cooperativas 15% + 25% (convenido)", rem * (D("0.15") + D("0.25")), D("400000"))
check(
    "V4 cooperativas + vivienda 15+30+25 = 70% -> tope 45%",
    min(rem * D("0.70"), rem * D("0.45")),
    D("450000"),
)
print()

# ---------------------------------------------------------------------- V5
print("--- V5 | AFC 135,2 UF vs tope previsional 90 UF ---")
check("V5 tope AFP/salud en CLP", clp(CAP_PREV_UF * UF), D("3707032"))
check("V5 tope AFC en CLP", clp(CAP_AFC_UF * UF), D("5568785"))
check("V5 diferencia de topes (UF)", CAP_AFC_UF - CAP_PREV_UF, D("45.2"))
check("V5 diferencia de topes (CLP)", clp((CAP_AFC_UF - CAP_PREV_UF) * UF), D("1861754"))
check("V5 11 anios * 12 meses", D("11") * D("12"), D("132"), "AFC declara 'cumplido con la cotizacion N.133'")
for base in ("90", "120", "135.2", "150"):
    b = D(base)
    check(
        f"V5 borde imponible={base} UF -> AFP/salud={capped(b, CAP_PREV_UF)} UF, AFC={capped(b, CAP_AFC_UF)} UF, 0,6% AFC={capped(b, CAP_AFC_UF) * D('0.006')} UF",
        capped(b, CAP_AFC_UF) * D("0.006"),
        None,
    )
print()

# ---------------------------------------------------------------------- V6
print("--- V6 | Multa 25% diaria vs topes convenidos ---")
check("V6 25% == 1/4", D("0.25"), D("1") / D("4"))
daily = rem / D("30")
check("V6 remuneracion diaria de 1.000.000/30", daily, None, f"CLP={clp(daily)}")
check("V6 multa maxima 25% de la diaria", daily * D("0.25"), None, f"CLP={clp(daily * D('0.25'))}")
check("V6 multa como fraccion del tope 15% mensual", (daily * D("0.25")) / (rem * D("0.15")), None, "5,56% del tope mensual")
print()

# --------------------------------------------------------- cross-surface
print("--- Cross-surface: comisiones AFP ---")
spread = D("0.0145") - D("0.0046")
check("CS spread 1,45% - 0,46% (pp)", spread * D("100"), D("0.99"))
check("CS spread sobre 1.000.000", rem * spread, D("9900"))
check("CS spread anual (12 meses)", D("12") * rem * spread, D("118800"))
check("CS spread sobre 1.350.000", imponible * spread, D("13365"))
check("CS spread anual sobre 1.350.000", D("12") * imponible * spread, D("160380"))

print()
print("--- Cross-surface: ejemplo completo como-calcular-sueldo-liquido.md ---")
imp = D("1350000")
cot = imp * D("0.10")
com_058 = imp * D("0.0058")
com_144 = imp * D("0.0144")
salud = imp * D("0.07")
afc = imp * D("0.006")
total_058 = cot + com_058 + salud + afc
total_144 = cot + com_144 + salud + afc
check("CS cotizacion 10%", cot, D("135000"))
check("CS comision 0,58%", com_058, D("7830"))
check("CS comision 1,44% (Capital real)", com_144, D("19440"))
check("CS sobrecosto de la comision mal rotulada", com_144 - com_058, D("11610"))
check("CS salud 7%", salud, D("94500"))
check("CS cesantia 0,6%", afc, D("8100"))
check("CS total cotizaciones con 0,58%", total_058, D("245430"))
check("CS total cotizaciones con 1,44%", total_144, D("257040"))
check("CS RLI con 0,58%", imp - total_058, D("1104570"))
check("CS RLI con 1,44%", imp - total_144, D("1092960"))
t058 = tax(imp - total_058, SII_APR)
t144 = tax(imp - total_144, SII_APR)
check("CS IUSC abril con 0,58%", clp(t058), D("6443"), f"exacto={t058}")
check("CS IUSC abril con 1,44%", clp(t144), D("5978"), f"exacto={t144}")
liq058 = D("1500000") - total_058 - t058
liq144 = D("1500000") - total_144 - t144
check("CS liquido con 0,58%", clp(liq058), D("1248127"), "publicado ~$1.248.000")
check("CS liquido con 1,44%", clp(liq144), D("1236982"))
check("CS efecto neto en el liquido (incluye menor IUSC)", clp(liq058) - clp(liq144), D("11145"))
check("CS descuentos totales con 0,58%", clp(total_058 + t058), D("251873"), "publicado ~$252.000")
check("CS total AFP declarado 10,58% == 10% + 0,58%", D("10") + D("0.58"), D("10.58"))
check("CS total AFP correcto para Capital 11,44%", D("10") + D("1.44"), D("11.44"))

print()
print("--- Cross-surface: primer-empleo, suma de descuentos ---")
check("CS 10,5 + 7,0 + 0,6 (publicado 18,1%)", D("10.5") + D("7.0") + D("0.6"), D("18.1"))
check("CS rango real con comision minima", D("10") + D("0.46") + D("7.0") + D("0.6"), D("18.06"))
check("CS rango real con comision maxima", D("10") + D("1.45") + D("7.0") + D("0.6"), D("19.05"))
check("CS desviacion maxima vs 18,1% (pp)", D("19.05") - D("18.1"), D("0.95"))
for imp2 in ("1500000", "2000000", "3000000", "5000000"):
    b = D(imp2)
    cot2 = b * (D("0.1046") + D("0.07") + D("0.006"))
    t2 = tax(b - cot2, SII_APR)
    check(
        f"CS carga total con IUSC sobre imponible {imp2}",
        (cot2 + t2) / b * D("100"),
        None,
        f"CLP impuesto={clp(t2)}",
    )

print()
print("--- Cross-surface: tope de gratificacion (art. 50) ---")
cap_stale = IMM_STALE * D("4.75")
cap_real = IMM_2026 * D("4.75")
check("CS 4,75 * 539.000 (publicado)", cap_stale, D("2560250"))
check("CS 4,75 * 553.553 (IMM vigente)", cap_real, D("2629376.75"))
check("CS subestimacion absoluta", cap_real - cap_stale, D("69126.75"))
check(
    "CS subestimacion % del valor correcto",
    (cap_real - cap_stale) / cap_real * D("100"),
    None,
    f"{((cap_real - cap_stale) / cap_real * 100).quantize(D('0.0001'))}%",
)
check(
    "CS subestimacion % del valor publicado",
    (cap_real - cap_stale) / cap_stale * D("100"),
    None,
    f"{((cap_real - cap_stale) / cap_stale * 100).quantize(D('0.0001'))}%",
)
check("CS 4,75 == cuatro y tres cuartos", D("4.75"), D("19") / D("4"))
print()

# ------------------------------------------------------------------ summary
fails = [r for r in RESULTS if not r[1]]
print("=== SUMMARY ===")
print(f"checks={len(RESULTS)} mismatches={len(fails)}")
for label, _, verdict in fails:
    print(f"  {verdict}: {label}")

# Machine-readable twin for the audit package.
summary = {
    "checks": len(RESULTS),
    "mismatches": len(fails),
    "failed": [label for label, ok, _ in RESULTS if not ok],
    "params": {
        "UF": str(UF),
        "UTM_oct": str(UTM_OCT),
        "UTM_mar_abr": str(UTM_MAR_ABR),
        "cap_prev_uf": str(CAP_PREV_UF),
        "cap_afc_uf": str(CAP_AFC_UF),
        "imm_2026": str(IMM_2026),
    },
}
print(json.dumps(summary, ensure_ascii=False))

raise SystemExit(1 if fails else 0)
