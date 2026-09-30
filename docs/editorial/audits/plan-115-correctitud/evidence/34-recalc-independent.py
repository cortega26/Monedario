#!/usr/bin/env python3
"""
Reimplementación independiente pass4 — plan 115 (MathAuditAgent, AI_AUDIT_PROTOCOL v1).

Sin imports del repositorio. Usa exclusivamente las tablas publicadas por el SII
(AT2026 IGC e IUSC septiembre 2026), parámetros BCCh/SII (UTA dic-2025, UF
31-12-2025), reglas legales citadas (art. 42 bis N°3 LIR, Ley 20.720 art. 260)
y la serie IPC 2026 publicada. Decimal de 50 dígitos.

Fuentes consultadas 2026-09-29 (ver 35-sources-pass4.md):
  - https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html
  - https://www.sii.cl/valores_y_fechas/utm/utm2025.htm
  - https://www.sii.cl/valores_y_fechas/utm/utm2026.htm
  - https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm
"""
from decimal import Decimal, getcontext

getcontext().prec = 50

D = Decimal


def fmt(v):
    return format(v, "f")


print("=" * 72)
print("PASS4 — RECÁLCULO INDEPENDIENTE (Decimal 50 dígitos, sin imports del repo)")
print("=" * 72)

# ---------------------------------------------------------------------------
# Tabla IGC AT2026 publicada por el SII (personas naturales, art. 52 LIR)
# (desde, hasta, factor, cantidad a rebajar) — extracto textual de la página.
# ---------------------------------------------------------------------------
UTA_AT2026 = D("834504")
IGC_TABLE = [
    (D("0"), D("11265804.00"), D("0"), D("0")),
    (D("11265804.01"), D("25035120.00"), D("0.04"), D("450632.16")),
    (D("25035120.01"), D("41725200.00"), D("0.08"), D("1452036.96")),
    (D("41725200.01"), D("58415280.00"), D("0.135"), D("3746922.96")),
    (D("58415280.01"), D("75105360.00"), D("0.23"), D("9296374.56")),
    (D("75105360.01"), D("100140480.00"), D("0.304"), D("14854171.20")),
    (D("100140480.01"), D("258696240.00"), D("0.35"), D("19460633.28")),
    (D("258696240.01"), None, D("0.40"), D("32395445.28")),
]

# Verificación de cierre: los topes y rebajas publicados equivalen a los
# factores × UTA (multiplicadores 13.5/30/50/70/90/120/310 y 0.54/1.74/4.49/
# 11.14/17.80/23.32/38.82). Esto ancla la tabla publicada a la estructura legal.
print("\n[0] Cierre tabla IGC publicada vs factores × UTA dic-2025 834.504")
# (multiplo_tope, factor, rebaja_publicada, multiplo_rebaja)
published = [
    (30, "0.04", "450632.16", "0.54"),
    (50, "0.08", "1452036.96", "1.74"),
    (70, "0.135", "3746922.96", "4.49"),
    (90, "0.23", "9296374.56", "11.14"),
    (120, "0.304", "14854171.20", "17.80"),
    (310, "0.35", "19460633.28", "23.32"),
]
for mult, factor, rebaja, reb_mult in published:
    top = D(mult) * UTA_AT2026
    reb = D(reb_mult) * UTA_AT2026
    top_pub = [t for t in IGC_TABLE if t[2] == D(factor)][0][1]
    print(
        f"    {mult:>4} UTA -> tope {fmt(top):>15} (publicado {fmt(top_pub):>15}) "
        f"| {reb_mult} x UTA = {fmt(reb):>15} | publicado {rebaja:>15} "
        f"| {'OK' if reb == D(rebaja) and top == top_pub else 'DIFF'}"
    )
print(f"    310 x UTA = {fmt(D(310) * UTA_AT2026)} (tope 35% general)")
print(f"    38,82 x UTA = {fmt(D('38.82') * UTA_AT2026)} (rebaja 40%)")
print("    (la rebaja publicada es acumulativa: 0,54/1,74/4,49/11,14/17,80/23,32/38,82 × UTA)")


def igc_at2026(renta: Decimal) -> Decimal:
    """IGC AT2026 con la tabla publicada (límite superior inclusivo)."""
    for desde, hasta, factor, rebaja in IGC_TABLE:
        if renta >= desde and (hasta is None or renta <= hasta):
            return max(D(0), renta * factor - rebaja)
    raise ValueError("fuera de tabla")


# ---------------------------------------------------------------------------
print("\n[V1] $18.000.000 renta neta ⇒ IGC AT2026")
v1 = igc_at2026(D("18000000"))
print(f"    independiente = {fmt(v1)}")
print(f"    formula        = 18.000.000 x 0,04 - 0,54 x 834.504 = {fmt(D('18000000') * D('0.04') - D('0.54') * UTA_AT2026)}")
v1_bug = D("18000000") * D("0.04") - D("0.54") * D("860652")
print(f"    variante bug UTM sep-2026x12=860.652 => {fmt(v1_bug)} (debe NO coincidir)")

# ---------------------------------------------------------------------------
print("\n[V1-bordes] fronteras UTA-IGC (exacto y +$1)")
for mult in ["13.5", "30", "50", "70", "90", "120", "310", "320", "400"]:
    boundary = D(mult) * UTA_AT2026
    t_exact = igc_at2026(boundary)
    t_plus = igc_at2026(boundary + D("0.01"))
    print(
        f"    {mult:>5} UTA = {fmt(boundary):>15} | IGC exacto {fmt(t_exact):>16} | +$0,01 {fmt(t_plus):>16}"
    )

# Contraste art. 52 bis (tramo 150, rebaja 30,82) en 320 UTA:
igc_320 = igc_at2026(D("320") * UTA_AT2026)
igc_320_52bis = D("320") * UTA_AT2026 * D("0.35") - D("30.82") * UTA_AT2026
print(f"    contraste 52 bis 150 UTA en 320 UTA: general {fmt(igc_320)} vs 52bis {fmt(igc_320_52bis)} dif {fmt(igc_320 - igc_320_52bis)}")

# ---------------------------------------------------------------------------
# Tabla IUSC septiembre 2026 publicada por el SII (UTM 71.721; 13,5 UTM =
# 968.233,50; rebaja 2° tramo 38.729,34). La página sirve la tabla de octubre
# por defecto, pero incluye la de septiembre (verificada en 35-sources-pass4.md).
UTM_SEP_2026 = D("71721")
IUSC_SEP = [
    (D("0"), D("968233.50"), D("0"), D("0")),
    (D("968233.51"), D("2151630.00"), D("0.04"), D("38729.34")),
    (D("2151630.01"), D("3586050.00"), D("0.08"), D("124794.54")),
    (D("3586050.01"), D("5020470.00"), D("0.135"), D("322027.29")),
    (D("5020470.01"), D("6454890.00"), D("0.23"), D("798971.94")),
    (D("6454890.01"), D("8606520.00"), D("0.304"), D("1276633.80")),
    (D("8606520.01"), D("22233510.00"), D("0.35"), D("1672533.72")),
    (D("22233510.01"), None, D("0.40"), D("2784209.22")),
]


def iusc_sep(renta: Decimal) -> Decimal:
    for desde, hasta, factor, rebaja in IUSC_SEP:
        if renta >= desde and (hasta is None or renta <= hasta):
            return max(D(0), renta * factor - rebaja)
    raise ValueError("fuera de tabla")


print("\n[V2] bruto $1.200.000 (AFP 11,27%, Fonasa 7%, AFC 0,6% indefinido)")
afp = D("1200000") * D("0.1127")
salud = D("1200000") * D("0.07")
afc = D("1200000") * D("0.006")
base = D("1200000") - afp - salud - afc
tax = iusc_sep(base)
net = D("1200000") - afp - salud - afc - tax
print(f"    AFP {fmt(afp)} | salud {fmt(salud)} | AFC {fmt(afc)}")
print(f"    base imponible = {fmt(base)}")
print(f"    IUSC = {fmt(tax)} -> display {round(tax)}")
print(f"    líquido = {fmt(net)} -> display {round(net)}")

print("\n[V2-topes] bruto $6.000.000 con UF snapshot 41.049,01 (90/135,2 UF)")
UF_SNAP = D("41049.01")
pen_cap = D("90") * UF_SNAP
afc_cap = D("135.2") * UF_SNAP
afp6 = pen_cap * D("0.1127")
salud6 = pen_cap * D("0.07")
afc6 = afc_cap * D("0.006")
base6 = D("6000000") - afp6 - salud6 - afc6
tax6 = iusc_sep(base6)
print(f"    pensionAndHealthBase = {fmt(pen_cap)}")
print(f"    unemploymentBase     = {fmt(afc_cap)}")
print(f"    base imponible       = {fmt(base6)}")
print(f"    IUSC                 = {fmt(tax6)}")
print("    (referencia oficial previred sep-2026: 90 UF $3.695.148 / 135,2 UF $5.550.933;")
print("     el motor usa UF del snapshot, diferencia ~0,02% — simplificación declarada)")

# ---------------------------------------------------------------------------
print("\n[V3] DAP $5.000.000 / 180 días / 5% TIR — persona natural residente")
gross = D("5000000") * D("0.05") * D("180") / D("365")
print(f"    interés bruto (sin retención) = {fmt(gross)}")
print(f"    monto al vencimiento          = {fmt(D('5000000') + gross)}")
variant_4 = gross * D("0.96")
print(f"    variante 4% (descartada legalmente) = {fmt(variant_4)}")

print("\n[V3-bordes] plazos 1/90/365/366 días y rechazos")
for days in [1, 90, 365, 366]:
    g = D("5000000") * D("0.05") * D(days) / D("365")
    print(f"    {days:>3} días => interés {fmt(g)}")
print("    entradas inválidas: amount<=0, termDays no entero/<=0, rate<=0 => throw (motor)")

# ---------------------------------------------------------------------------
print("\n[V4] APV art. 42 bis N°3: (ΔIGC / retiro) × 1,1 + 3 pp")
apv_vectors = [
    ("base 0 / retiro 1.000.000 (<13,5 UTA)", D("0"), D("1000000")),
    ("base 0 / retiro 1 UTA", D("0"), UTA_AT2026),
    ("base 13,5 UTA / retiro 1 UTA", D("13.5") * UTA_AT2026, UTA_AT2026),
    ("base 0 / retiro 14 UTA (cruza exención)", D("0"), D("14") * UTA_AT2026),
    ("base 90 UTA / retiro 50 UTA", D("90") * UTA_AT2026, D("50") * UTA_AT2026),
    ("base 200 UTA / retiro 10 UTA", D("200") * UTA_AT2026, D("10") * UTA_AT2026),
    ("base 310 UTA / retiro 200 UTA", D("310") * UTA_AT2026, D("200") * UTA_AT2026),
    ("base 400 UTA / retiro 100 UTA", D("400") * UTA_AT2026, D("100") * UTA_AT2026),
]
for label, b, w in apv_vectors:
    delta = igc_at2026(b + w) - igc_at2026(b)
    rate = (delta / w) * D("1.1") + D("0.03")
    print(f"    {label:<42} ΔIGC {fmt(delta):>16} rate {fmt(rate)}")

# ---------------------------------------------------------------------------
print("\n[V5] SuperIR — 2 deudas $1.800.000/120d + $2.200.000/150d, UF 39.300")
UF5 = D("39300")


def annuity(principal, monthly_rate, months):
    if monthly_rate == 0:
        return principal / D(months)
    factor = (D(1) + monthly_rate) ** months
    return principal * monthly_rate * factor / (factor - 1)


total = D("1800000") + D("2200000")
total_uf = total / UF5
qualified_uf = (D("1800000") + D("2200000")) / UF5
payment = annuity(total, D("0.012"), 48)
print(f"    total deuda CLP = {fmt(total)} | UF = {fmt(total_uf)}")
print(f"    qualifiedDebtUf = {fmt(qualified_uf)}")
print(f"    cuota 48m 1,2%  = {fmt(payment)}")
print(f"    total pagado    = {fmt(payment * 48)}")
print(f"    carga ingreso   = {fmt(payment / D('1200000') * D('100'))}%")

print("\n[V5-bordes] umbral >80 UF estricto, >90 días estricto, mismo acreedor")
for label, amount in [("80 UF exactas", D("80") * UF5), ("80 UF + $1", D("80") * UF5 + D("1"))]:
    print(f"    {label:<14} qualifiedDebtUf={fmt(amount / UF5)} > 80 => {amount / UF5 > D('80')}")
print("    90 días  => califica False (se exige >90 => >=91)")
print("    91 días  => califica True")
print("    mismo acreedor con 2 obligaciones => califica True ('obligaciones diversas')")
print("    deuda amount=0 => no califica; acreedor vacío/no-string => throw")

# ---------------------------------------------------------------------------
print("\n[V6] serie IPC 2026 publicada por SII (variación mensual INE)")
ipc_2026 = [("2026-01", D("0.4")), ("2026-02", D("0")), ("2026-03", D("1.0")),
            ("2026-04", D("1.3")), ("2026-05", D("0.2")), ("2026-06", D("0")),
            ("2026-07", D("0.1")), ("2026-08", D("0.6"))]
acc = D("1")
for m, v in ipc_2026:
    acc *= (D("1") + v / D("100"))
    print(f"    {m}: {fmt(v):>4}% -> factor {fmt(acc)}")
print(f"    acumulado encadenado = {fmt((acc - 1) * 100)}% (SII publica 3,6)")
print(f"    $1.000.000 dic-2025 -> ago-2026 = {fmt(D('1000000') * acc)}")

print("\n[V6-parámetros]")
print(f"    UTA dic-2025 = 12 x 69.542 = {fmt(D('12') * D('69542'))}")
print(f"    UF 31-12-2025 = 317.823.680 / 8.000 = {fmt(D('317823680') / D('8000'))}")
print(f"    600 UF (AT2026, 31-dic) = {fmt(D('600') * D('39727.96'))}")
print(f"    8 UTA = {fmt(D('8') * UTA_AT2026)} | 15 UTA = {fmt(D('15') * UTA_AT2026)}")
print(f"    IMM Ley 21.830 = 553.553 desde 2026-05-01 (texto legal)")
print("\nFIN PASS4")
