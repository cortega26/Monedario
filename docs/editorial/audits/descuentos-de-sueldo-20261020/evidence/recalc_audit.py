#!/usr/bin/env python3
"""
Independent MathAuditAgent recalculation script (AI_AUDIT_PROTOCOL v1, R1/R3/R5).
Scope: descuentos-de-sueldo-20261020 (commit 56f15110)
Precision: decimal.Decimal with 50 significant digits.
"""
from decimal import Decimal, getcontext, ROUND_HALF_UP
import json

getcontext().prec = 50


def clp_round(val: Decimal) -> Decimal:
    return val.quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def clp_cent(val: Decimal) -> Decimal:
    return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


print("=== MATH AUDIT INDEPENDENT RECALCULATION (Decimal prec=50) ===")

# Load snapshot parameters
with open("src/infrastructure/economic/economic-parameters.snapshot.json", encoding="utf-8") as f:
    snap = json.load(f)

uf_oct20 = Decimal(str(snap["uf"]))
utm_oct2026 = Decimal(str(snap["utm"]))
utm_sep2026 = Decimal(str(snap["prev"]["utm"]["valor"]))
utm_apr2026 = Decimal("69889")  # SII utm2026.htm: Marzo/Abril 2026 = 69.889
cap_prev_uf = Decimal(str(snap["previsionalTopes"]["pensionAndHealthMonthlyTaxableCapUf"]))
cap_afc_uf = Decimal(str(snap["afcTopes"]["monthlyTaxableCapUf"]))

print(f"Snapshot parameters (2026-10-20): UF={uf_oct20}, UTM_oct={utm_oct2026}, UTM_sep={utm_sep2026}, cap_prev={cap_prev_uf} UF, cap_afc={cap_afc_uf} UF")

# ---------------------------------------------------------------------------
# V1: Tope de salud: 7% de 90 UF = 6,3 UF mensuales
# ---------------------------------------------------------------------------
print("\n--- V1: Tope de salud (7% de 90 UF) ---")
v1_rate = Decimal("0.07")
v1_cap_uf = Decimal("90")
v1_independent_uf = v1_cap_uf * v1_rate
v1_published_uf = Decimal("6.3")
print(f"90 UF * 0.07 = {v1_independent_uf} UF | Published: {v1_published_uf} UF | Exact match: {v1_independent_uf == v1_published_uf}")
print(f"90 UF in CLP (UF={uf_oct20}): {clp_cent(v1_cap_uf * uf_oct20)} (rounded CLP: {clp_round(v1_cap_uf * uf_oct20)})")
print(f"6.3 UF in CLP (UF={uf_oct20}): {clp_cent(v1_independent_uf * uf_oct20)} (rounded CLP: {clp_round(v1_independent_uf * uf_oct20)})")

# Edge cases V1: taxable base below, at, and above 90 UF
for base_uf in [Decimal("50"), Decimal("89.99"), Decimal("90"), Decimal("90.01"), Decimal("135.2"), Decimal("150")]:
    eff_base = min(base_uf, v1_cap_uf)
    salud_uf = eff_base * v1_rate
    print(f"  Edge V1: imponible={base_uf} UF -> base_efectiva={eff_base} UF -> 7% legal={salud_uf} UF")

# ---------------------------------------------------------------------------
# V2: Tramo exento octubre 2026: 13,5 UTM = $974.038,50 con UTM $72.151
# ---------------------------------------------------------------------------
print("\n--- V2: Tramo exento IUSC octubre 2026 (13,5 UTM * $72.151) ---")
v2_utm_units = Decimal("13.5")
v2_independent = v2_utm_units * utm_oct2026
v2_published = Decimal("974038.50")
v2_rebaja_tramo2 = clp_cent(v2_independent * Decimal("0.04"))
print(f"13.5 * {utm_oct2026} = {v2_independent:.2f} | Published & SII table: {v2_published:.2f} | Exact match: {v2_independent == v2_published}")
print(f"Tramo 2 (13.5 to 30 UTM) upper bound: 30 * {utm_oct2026} = {Decimal('30') * utm_oct2026:.2f} | Rebaja 4%: {v2_rebaja_tramo2}")

# Edge cases V2: boundary at $974.038,50 vs $974.038,51 and other months in scoped files
for rli in [Decimal("974038.50"), Decimal("974038.51"), Decimal("1000000")]:
    if rli <= v2_independent:
        iusc = Decimal("0")
    else:
        iusc = rli * Decimal("0.04") - v2_rebaja_tramo2
    print(f"  Edge V2 (Oct 2026): RLI=${rli} -> IUSC=${iusc:.4f} (rounded CLP: ${clp_round(iusc)})")

v2_apr_exento = Decimal("13.5") * utm_apr2026
v2_apr_tramo2_top = Decimal("30") * utm_apr2026
v2_apr_rebaja2 = clp_cent(v2_apr_exento * Decimal("0.04"))
print(f"  Edge V2 (Mar/Apr 2026, UTM={utm_apr2026}): 13.5 UTM = ${v2_apr_exento:.2f} | 30 UTM = ${v2_apr_tramo2_top:.2f} | Rebaja 4% = ${v2_apr_rebaja2}")

# ---------------------------------------------------------------------------
# V3: Cesantía trabajador: 0,6% de $800.000 = $4.800
# ---------------------------------------------------------------------------
print("\n--- V3: Cesantía trabajador (0,6% de $800.000) ---")
v3_base = Decimal("800000")
v3_rate = Decimal("0.006")
v3_independent = v3_base * v3_rate
v3_published = Decimal("4800")
print(f"800000 * 0.006 = {v3_independent:.2f} | Published: {v3_published:.2f} | Exact match: {v3_independent == v3_published}")
print(f"Annualized over-deduction if wrongly applied to plazo fijo: 12 * {v3_independent:.0f} = ${v3_independent * 12:.0f}")
print(f"Employer contribution on $800.000: indefinido (2.4%)=${v3_base * Decimal('0.024'):.0f} (1.6% CIC + 0.8% FCS); plazo fijo (3.0%)=${v3_base * Decimal('0.03'):.0f}")

# ---------------------------------------------------------------------------
# V4: Topes de descuentos convenidos: 15% de $1.000.000 = $150.000; 45% = $450.000
# ---------------------------------------------------------------------------
print("\n--- V4: Topes de descuentos convenidos sobre $1.000.000 ---")
v4_base = Decimal("1000000")
v4_15 = v4_base * Decimal("0.15")
v4_30 = v4_base * Decimal("0.30")
v4_45 = v4_base * Decimal("0.45")
print(f"15% = ${v4_15:.2f} (published: $150.000) | 30% = ${v4_30:.2f} | 45% = ${v4_45:.2f} (published: $450.000)")
print(f"Exact match 15% & 45%: {v4_15 == Decimal('150000') and v4_45 == Decimal('450000')}")
# Edge case V4: non-additive caps and base difference (bruto total vs imponible vs liquido)
print("  Edge V4 (non-additivity): max general ($150.000) + max housing/education ($300.000) = $450.000 <= joint cap $450.000 (not $150k + $450k = $600k)")
print("  Edge V4 (cooperatives ORD. 3456/37): 15% + 25% additional = 40% ($400.000); if combined with 30% housing ($300.000), capped at 45% ($450.000), not 70% ($700.000)")

# ---------------------------------------------------------------------------
# V5: AFC tope 135,2 UF y límite de 11 años vs tope previsional 90 UF
# ---------------------------------------------------------------------------
print("\n--- V5: AFC tope 135,2 UF y límite 11 años vs 90 UF ---")
v5_max_afc_uf = cap_afc_uf * Decimal("0.006")
v5_diff_uf = cap_afc_uf - cap_prev_uf
print(f"AFC cap={cap_afc_uf} UF vs AFP/Salud cap={cap_prev_uf} UF | Diff={v5_diff_uf} UF")
print(f"Max worker AFC (0.6% of 135.2 UF) = {v5_max_afc_uf} UF = ${clp_cent(v5_max_afc_uf * uf_oct20)} (rounded CLP: ${clp_round(v5_max_afc_uf * uf_oct20)})")
print(f"11 years * 12 months = {11 * 12} monthly contributions; ceiling fulfilled at contribution N°133 (after which worker=0%, employer=0.8% FCS)")
for imp_uf in [Decimal("90"), Decimal("120"), Decimal("135.2"), Decimal("150")]:
    afp_base = min(imp_uf, cap_prev_uf)
    afc_base = min(imp_uf, cap_afc_uf)
    print(f"  Edge V5: imponible={imp_uf} UF -> AFP/Salud base={afp_base} UF, AFC base={afc_base} UF, AFC 0.6%={afc_base * Decimal('0.006')} UF")

# ---------------------------------------------------------------------------
# V6: Multa reglamento interno (25% remuneración diaria) vs topes art. 58
# ---------------------------------------------------------------------------
print("\n--- V6: Multa reglamento interno (25% remuneración diaria) vs descuentos convenidos ---")
v6_monthly_example = Decimal("1000000")
v6_daily_example = v6_monthly_example / Decimal("30")
v6_max_fine_daily = v6_daily_example * Decimal("0.25")
print(f"25% == 1/4: {Decimal('0.25') == Decimal('1') / Decimal('4')}")
print(f"Example on $1.000.000/month (30 days): daily remuneration=${v6_daily_example:.2f}, max fine per day (25%)=${v6_max_fine_daily:.2f} (vs 15% monthly=${v4_15:.2f})")

# ---------------------------------------------------------------------------
# Additional numerical claims in descuentos-de-sueldo.md & scoped related files
# ---------------------------------------------------------------------------
print("\n--- Cross-surface numerical checks ---")
# 1. AFP commissions (0.46% to 1.45%)
afp_min = Decimal("0.0046")
afp_max = Decimal("0.0145")
spread_1m = Decimal("1000000") * (afp_max - afp_min)
print(f"AFP commission range: {afp_min*100:.2f}% (Uno) to {afp_max*100:.2f}% (ProVida)")
print(f"como-calcular-sueldo-liquido.md: spread on $1.000.000 = ${spread_1m:.0f}/mes (published: $9.900), annual = ${spread_1m*12:.0f}/año (published: $118.800)")

# 2. como-calcular-sueldo-liquido.md full worked example ($1.500.000 bruto, $1.350.000 imponible)
ex_bruto = Decimal("1500000")
ex_imponible = Decimal("1350000")
ex_no_imp = Decimal("150000")
ex_afp_10 = ex_imponible * Decimal("0.10")
ex_afp_com = ex_imponible * Decimal("0.0058")  # Note: 0.58% is Modelo, NOT Capital (1.44%)!
ex_salud = ex_imponible * Decimal("0.07")
ex_afc = ex_imponible * Decimal("0.006")
ex_tot_cot = ex_afp_10 + ex_afp_com + ex_salud + ex_afc
ex_rli = ex_imponible - ex_tot_cot
ex_iusc_apr = ex_rli * Decimal("0.04") - v2_apr_rebaja2
ex_iusc_apr_round = clp_round(ex_iusc_apr)
ex_liquido = ex_bruto - ex_tot_cot - ex_iusc_apr_round
ex_tot_desc = ex_tot_cot + ex_iusc_apr_round
print(f"Worked example como-calcular-sueldo-liquido.md:")
print(f"  AFP 10%={ex_afp_10:.0f}, Com 0.58%={ex_afp_com:.0f}, Salud 7%={ex_salud:.0f}, AFC 0.6%={ex_afc:.0f}")
print(f"  Total cotizaciones={ex_tot_cot:.0f} (published: $245.430) | RLI={ex_rli:.0f} (published: $1.104.570)")
print(f"  IUSC Apr 2026 exact={ex_iusc_apr:.2f}, rounded={ex_iusc_apr_round} (published: $6.443)")
print(f"  Total descuentos={ex_tot_desc} (published: ~$252.000) | Liquido exact={ex_liquido} (published: ~$1.248.000)")
ex_afp_com_capital_real = ex_imponible * Decimal("0.0144")
print(f"  [DEFECT CHECK] If Capital AFP (1.44%) were actually used: com=${ex_afp_com_capital_real:.0f} (diff +${ex_afp_com_capital_real - ex_afp_com:.0f})")

# 3. APV B example in como-calcular-sueldo-liquido.md ($200.000 * 8% = $16.000)
apv_saving = Decimal("200000") * Decimal("0.08")
print(f"APV B tax saving ($200.000 at 8% marginal rate): ${apv_saving:.0f} (published: $16.000)")

# 4. primer-empleo-chile-guia-completa.md table: 10.5% + 7.0% + 0.6% = 18.1%
pe_sum = Decimal("10.5") + Decimal("7.0") + Decimal("0.6")
print(f"primer-empleo table sum: 10.5% + 7.0% + 0.6% = {pe_sum}% (published: ~18,1%)")

# 5. codigo-del-trabajo.md art. 50 gratification cap: 4.75 IMM
imm_old = Decimal("539000")
imm_new = Decimal(str(snap["imm"]))
print(f"codigo-del-trabajo.md 4.75 * $539.000 = ${imm_old * Decimal('4.75'):.0f} (published: $2.560.250)")
print(f"  [STALENESS CHECK] Snapshot IMM from {snap['immEffectiveDate']} (Ley 21.830) is ${imm_new}: 4.75 * ${imm_new} = ${imm_new * Decimal('4.75'):.2f}")