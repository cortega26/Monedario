#!/usr/bin/env python3
"""
MathAuditAgent — plan 115 pass 3 (2026-09-29).

Reimplementación independiente de V1–V6 + bordes. NO importa código del repo:
usa las tablas publicadas por el SII y las fórmulas legales (LeyChile) con
Decimal de 50 dígitos. Cada parámetro está anotado con su fuente primaria y la
salida cruda se archiva como evidencia (R1/R2/R3/R5).

Commit auditado: 9e19574367ecacebac70f9d834cf8ddcc1c32653
"""

from decimal import Decimal, getcontext

getcontext().prec = 50

D = Decimal

# ---------------------------------------------------------------------------
# Parámetros anclados a fuente primaria (consulta 2026-09-29)
# ---------------------------------------------------------------------------
UTA_DIC2025 = D("834504")  # SII utm2025.htm (diciembre) y SII renta 2026
UTM_SEP2026 = D("71721")  # SII utm2026.htm (septiembre)
UTM_OCT2026 = D("72151")  # SII utm2026.htm (octubre)
UTM_DIC2025 = D("69542")  # SII utm2025.htm (diciembre)
UF_DIC31_2025 = D("39727.96")  # SII renta 2026: 8.000 UF al 31.12.2025
UF_2026_09_29 = D("41049.01")  # snapshot repo (mindicador.cl) verificado
IMM_2026_05 = D("553553")  # Ley 21.830 art. 1

# Tabla IGC AT2026 publicada (SII personas_naturales 2026). Tuplas:
# (límite inf, límite sup, tasa, rebaja CLP). Rebajas verificadas por código.
IGC_AT2026 = [
    (D("0"), D("11265804"), D("0"), D("0")),
    (D("11265804"), D("25035120"), D("0.04"), D("450632.16")),
    (D("25035120"), D("41725200"), D("0.08"), D("1452036.96")),
    (D("41725200"), D("58415280"), D("0.135"), D("3746922.96")),
    (D("58415280"), D("75105360"), D("0.23"), D("9296374.56")),
    (D("75105360"), D("100140480"), D("0.304"), D("14854171.20")),
    (D("100140480"), D("258696240"), D("0.35"), D("19460633.28")),
    (D("258696240"), None, D("0.40"), D("32395445.28")),
]

# Tabla IUSC mensual septiembre 2026 publicada (SII impuesto2026).
IUSC_SEP2026 = [
    (D("0"), D("968233.50"), D("0"), D("0")),
    (D("968233.50"), D("2151630.00"), D("0.04"), D("38729.34")),
    (D("2151630.00"), D("3586050.00"), D("0.08"), D("124794.54")),
    (D("3586050.00"), D("5020470.00"), D("0.135"), D("322027.29")),
    (D("5020470.00"), D("6454890.00"), D("0.23"), D("798971.94")),
    (D("6454890.00"), D("8606520.00"), D("0.304"), D("1276633.80")),
    (D("8606520.00"), D("22233510.00"), D("0.35"), D("1672533.72")),
    (D("22233510.00"), None, D("0.40"), D("2784209.22")),
]


def tax_from_table(income: D, table) -> tuple[D, D]:
    """Impuesto por tabla publicada (límite superior inclusivo)."""
    if income < 0:
        raise ValueError("income < 0")
    for lo, hi, rate, rebate in table:
        if hi is None or income <= hi:
            tax = income * rate - rebate
            return (tax if tax > 0 else D("0")), rate
    raise AssertionError("tabla sin tramo")


def float_of(x: D) -> float:
    return float(x)


out: list[str] = []


def p(line: str = "") -> None:
    out.append(line)
    print(line)


def check(label: str, independent, engine, tol=1e-9):
    """Comparación exacta: igualdad Decimal/float o |diff| <= tol relativo."""
    if isinstance(independent, D) and isinstance(engine, (int, float)):
        delta = abs(float(independent) - float(engine))
        rel = delta / max(1.0, abs(float(independent)))
        ok = delta <= tol or rel <= D("1e-12")
    else:
        delta = abs(independent - engine) if isinstance(independent, (int, float)) else None
        ok = independent == engine
    flag = "OK  " if ok else "FAIL"
    p(f"{flag} {label}: independiente={independent!r} motor={engine!r}"
      + (f" delta={delta}" if isinstance(delta, float) else ""))
    if not ok:
        global failures
        failures += 1
    return ok


failures = 0

p("=" * 78)
p("RECÁLCULO INDEPENDIENTE — plan 115 pass 3 — HEAD 9e195743")
p("Reimplementación propia (Decimal 50 dígitos) con tablas publicadas SII.")
p("=" * 78)

# ---------------------------------------------------------------------------
# Coherencia interna de las tablas publicadas con los parámetros oficiales
# ---------------------------------------------------------------------------
p()
p("## 0. Coherencia tabla publicada ↔ parámetros (R1)")
checks = [
    ("IGC 2º tramo rebaja 0,54 × UTA", D("0.54") * UTA_DIC2025, D("450632.16")),
    ("IGC 3º tramo rebaja 1,74 × UTA", D("1.74") * UTA_DIC2025, D("1452036.96")),
    ("IGC 4º tramo rebaja 4,49 × UTA", D("4.49") * UTA_DIC2025, D("3746922.96")),
    ("IGC 5º tramo rebaja 11,14 × UTA", D("11.14") * UTA_DIC2025, D("9296374.56")),
    ("IGC 6º tramo rebaja 17,80 × UTA", D("17.8") * UTA_DIC2025, D("14854171.20")),
    ("IGC 7º tramo rebaja 23,32 × UTA", D("23.32") * UTA_DIC2025, D("19460633.28")),
    ("IGC 8º tramo rebaja 38,82 × UTA", D("38.82") * UTA_DIC2025, D("32395445.28")),
    ("IGC tope 35% = 310 × UTA", D("310") * UTA_DIC2025, D("258696240")),
    ("IGC exención = 13,5 × UTA", D("13.5") * UTA_DIC2025, D("11265804")),
    ("IUSC exención = 13,5 × UTM sep", D("13.5") * UTM_SEP2026, D("968233.50")),
    ("IUSC rebaja 4% = 0,54 × UTM sep", D("0.54") * UTM_SEP2026, D("38729.34")),
    ("IUSC tope 35% = 310 × UTM sep", D("310") * UTM_SEP2026, D("22233510")),
    ("IUSC rebaja 40% = 38,82 × UTM sep", D("38.82") * UTM_SEP2026, D("2784209.22")),
    ("UTA dic-2025 = 12 × UTM dic-2025", 12 * UTM_DIC2025, UTA_DIC2025),
    ("UF 31-12-2025 = 317.823.680 / 8.000", D("317823680") / 8000, UF_DIC31_2025),
]
for label, a, b in checks:
    check(label, a, float(b))

# ---------------------------------------------------------------------------
# V1 — IGC AT2026 por $18.000.000 y variante con UTM vigente
# ---------------------------------------------------------------------------
p()
p("## V1 — $18.000.000 renta neta ⇒ IGC (AT2026, UTA dic-2025 $834.504)")
v1_tax, v1_rate = tax_from_table(D("18000000"), IGC_AT2026)
p(f"tramo: 18.000.000 cae en 11.265.804,01–25.035.120 ⇒ tasa 4% (marginal {v1_rate})")
p(f"18.000.000 × 0.04 − 450.632,16 = {v1_tax}")
check("V1.igc independiente vs valor publicado del claim (269.367,84)",
      v1_tax, 269367.84, tol=1e-9)
v1_bug, _ = tax_from_table(D("18000000"), [
    (D("0"), D("13.5") * D("860652"), D("0"), D("0")),
    (D("13.5") * D("860652"), D("30") * D("860652"), D("0.04"), D("0.54") * D("860652")),
])
p(f"variante bug (UTA = 12 × UTM sep-2026 = 860.652): {v1_bug} (debe ser 255.247,92)")
check("V1.repro-bug", v1_bug, 255247.92, tol=1e-9)

# Bordes del tramo exento/4%
for label, income in [
    ("13,5 UTA exactas", D("13.5") * UTA_DIC2025),
    ("13,5 UTA + $1", D("13.5") * UTA_DIC2025 + 1),
    ("30 UTA exactas", 30 * UTA_DIC2025),
    ("30 UTA + $1", 30 * UTA_DIC2025 + 1),
]:
    tax, rate = tax_from_table(income, IGC_AT2026)
    p(f"borde IGC {label}: impuesto={tax} tasa={rate}")
p(f"IGC(30 UTA) vs IGC(30 UTA + $1): salto continuo ≤ 0,04 "
  f"({float(tax_from_table(30 * UTA_DIC2025 + 1, IGC_AT2026)[0] - tax_from_table(30 * UTA_DIC2025, IGC_AT2026)[0]):.6f})")

# ---------------------------------------------------------------------------
# V2 — sueldo líquido $1.200.000 (AFP 11,27% / Fonasa 7% / AFC 0,6%)
# ---------------------------------------------------------------------------
p()
p("## V2 — bruto $1.200.000 ⇒ líquido (supuestos del ejemplo publicado)")
gross = D("1200000")
afp = gross * D("0.1127")
health = gross * D("0.07")
afc = gross * D("0.006")
base = gross - afp - health - afc
v2_tax, v2_rate = tax_from_table(base, IUSC_SEP2026)
v2_net = gross - afp - health - afc - v2_tax
p(f"AFP 11,27% = {afp}; Fonasa 7% = {health}; AFC 0,6% = {afc}")
p(f"base = {base}; IUSC 4% = {v2_tax}; líquido = {v2_net}")
p(f"display: base ${base:.0f}, impuesto ${v2_tax:.0f}, líquido ${v2_net:.0f}")
check("V2.base", base, 973560.0)
check("V2.tax", v2_tax, 213.06, tol=1e-9)
check("V2.net", v2_net, 973346.94, tol=1e-9)
p(f"con UTM octubre 72.151 el impuesto sería {base * D('0.04') - D('0.54') * UTM_OCT2026} "
  f"(≤0 ⇒ exento; el ejemplo sigue con UTM septiembre)")

# Tope previsional 90 UF y AFC 135,2 UF (UF del snapshot 41.049,01)
cap_ph = D("90") * UF_2026_09_29
cap_afc = D("135.2") * UF_2026_09_29
p(f"topes con UF 41.049,01: previsional 90 UF = {cap_ph}; AFC 135,2 UF = {cap_afc}")
for g in (D("1200000"), D("3694411"), cap_ph, cap_ph + 1, D("6000000")):
    b_ph = min(g, cap_ph)
    b_afc = min(g, cap_afc)
    b_tax = g - b_ph * D("0.1127") - b_ph * D("0.07") - b_afc * D("0.006")
    rpm = b_ph * D("0.1127") + b_ph * D("0.07") + b_afc * D("0.006")
    p(f"bruto {g}: base previsional={b_ph} AFC={b_afc} baseImp={b_tax} descuentos={rpm}")

# ---------------------------------------------------------------------------
# V3 — DAP simple
# ---------------------------------------------------------------------------
p()
p("## V3 — DAP $5.000.000 / 180 días / 5% (sin retención del banco)")
gross_int = D("5000000") * D("0.05") * (D("180") / D("365"))
final = D("5000000") + gross_int
p(f"interés = 5.000.000 × 0,05 × 180/365 = {gross_int}")
p(f"monto final = {final}; variante 4% rechazada = {gross_int * D('0.96')}")
check("V3.grossInterest", gross_int, 123287.6712328767)
check("V3.finalAmount", final, 5123287.6712328765)
for days in (1, 90, 180, 365, 366):
    gi = D("5000000") * D("0.05") * (D(days) / D("365"))
    eff = (gi / D("5000000")) * (D("365") / D(days))
    p(f"plazo {days}d: interés={gi} tasaEfectivaAnual={eff * 100}%")

# ---------------------------------------------------------------------------
# V4 — APV art. 42 bis N°3: (ΔIGC / retiro) × 1,1 + 3 pp
# ---------------------------------------------------------------------------
p()
p("## V4 — tasa retiro APV (art. 42 bis N°3 LIR; retiro reajustado = nominal aquí)")


def igc(income: D) -> D:
    return tax_from_table(income, IGC_AT2026)[0]


def apv_rate(base_income: D, withdrawal: D) -> tuple[D, D]:
    if withdrawal <= 0:
        raise ValueError("withdrawal debe ser > 0")
    delta = igc(base_income + withdrawal) - igc(base_income)
    return delta / withdrawal * D("1.1") + D("0.03"), delta


for base_u, w_u in [
    (D("90"), D("50")),
    (D("200"), D("10")),
    (D("0"), D("5")),
    (D("10"), D("5")),
    (D("30"), D("0.1")),
    (D("29.9"), D("0.2")),
    (D("310"), D("200")),
]:
    rate, delta = apv_rate(base_u * UTA_DIC2025, w_u * UTA_DIC2025)
    p(f"base {base_u} UTA, retiro {w_u} UTA: ΔIGC={delta} CLP; tasa={rate} "
      f"({rate * 100}%)")
rate_90_50, delta_90_50 = apv_rate(90 * UTA_DIC2025, 50 * UTA_DIC2025)
check("V4.90U/50U ΔIGC", delta_90_50, 13452204.48)
check("V4.90U/50U tasa", rate_90_50, 0.38464)
rate_200_10, _ = apv_rate(200 * UTA_DIC2025, 10 * UTA_DIC2025)
check("V4.200U/10U tasa (marginal 35%)", rate_200_10, 0.415)
rate_base0, _ = apv_rate(D("0"), D("5000000"))
check("V4.base0/retiro<13,5UTA tasa=3%", rate_base0, 0.03)
try:
    apv_rate(D("0"), D("0"))
    p("FAIL V4.retiro0 no lanza")
    failures += 1
except ValueError:
    p("OK   V4.retiro0 lanza (motor exige withdrawal > 0)")

# ---------------------------------------------------------------------------
# V5 — SuperIR (Ley 20.720 art. 260) y anualidad
# ---------------------------------------------------------------------------
p()
p("## V5 — SuperIR: ≥2 obligaciones vencidas >90 días, exigibles, total >80 UF")


def superir(debts, uf, minimum_overdue=91, minimum_uf=D("80"),
            docs=True, first_cat=False, notified=False):
    total_clp = sum(d[0] for d in debts)
    qualified = [d for d in debts if d[0] > 0 and d[1] >= minimum_overdue]
    q_uf = sum(d[0] for d in qualified) / uf
    basic = (len([d for d in debts if d[0] > 0]) >= 2 and len(qualified) >= 2
             and q_uf > minimum_uf and not first_cat and not notified)
    return {
        "total_clp": total_clp,
        "total_uf": total_clp / uf,
        "qualified_uf": q_uf,
        "qualified_count": len(qualified),
        "meets_basic": basic,
        "can_submit": basic and docs,
    }


UF_V5 = D("39300")
case1 = superir([(D("1800000"), 120), (D("2200000"), 150)], UF_V5)
case_ann = D("4000000") * D("0.012") * (1 + D("0.012")) ** 48 / ((1 + D("0.012")) ** 48 - 1)
p(f"caso1: totalUF={case1['qualified_uf']} cuota={case_ann} totalPagado={case_ann * 48} "
  f"carga={case_ann / D('1200000') * 100}%")
check("V5.qualifiedUf", case1["qualified_uf"], 101.78117048346056)
check("V5.cuota", case_ann, 110110.20773611861)
check("V5.totalPagado", case_ann * 48, 5285289.971333694)
check("V5.carga%", case_ann / D("1200000") * 100, 9.17585064467655)

edges = {
    "80 UF exactas": ([
        (D("40") * UF_V5, 200),
        (D("40") * UF_V5, 200),
    ], False),
    "80 UF + $1": ([
        (D("40") * UF_V5, 200),
        (D("40") * UF_V5 + 1, 200),
    ], True),
    "90 días (1 de 2 vencida)": ([
        (D("2000000"), 90),
        (D("2000000"), 91),
    ], False),
    "91 días ambas": ([
        (D("2000000"), 91),
        (D("2000000"), 91),
    ], True),
    "mismo acreedor (2 obligaciones)": ([
        (D("2000000"), 120),
        (D("2000000"), 130),
    ], True),
    "una sola deuda": ([
        (D("10000000"), 365),
    ], False),
    "deuda $0 no cuenta": ([
        (D("0"), 200),
        (D("4000000"), 200),
    ], False),
    "total apenas >100 UF, una sola calificada": ([
        (D("5000000"), 365),
        (D("500000"), 10),
    ], False),
}
for label, (debts, expected) in edges.items():
    r = superir(debts, UF_V5)
    p(f"borde SuperIR «{label}»: basic={r['meets_basic']} "
      f"(calificadas={r['qualified_count']}, UF={r['qualified_uf']}) esperado={expected}")
    if r["meets_basic"] != expected:
        failures += 1
        p("FAIL borde SuperIR")

r_docs = superir([(D("2000000"), 120), (D("2000000"), 120)], UF_V5, docs=False)
p(f"sin documentos: basic={r_docs['meets_basic']} canSubmit={r_docs['can_submit']}")
r_cat = superir([(D("2000000"), 120), (D("2000000"), 120)], UF_V5, first_cat=True)
p(f"con actividad 1ª categoría: basic={r_cat['meets_basic']}")
r_not = superir([(D("2000000"), 120), (D("2000000"), 120)], UF_V5, notified=True)
p(f"con juicio ejecutivo notificado: basic={r_not['meets_basic']}")

# ---------------------------------------------------------------------------
# V6 — serie IPC, UTA, UF y frescura
# ---------------------------------------------------------------------------
p()
p("## V6 — IPC 2026 / UTA dic-2025 / UF 31-12-2025")
ipc_sii = [D("0.4"), D("0"), D("1.0"), D("1.3"), D("0.2"), D("0"),
           D("0.1"), D("0.6")]
acc = D("1")
for v in ipc_sii:
    acc *= (1 + v / 100)
cumulative = (acc - 1) * 100
p(f"serie SII ene–ago 2026: {[str(v) for v in ipc_sii]}")
p(f"acumulado encadenado = {cumulative}% (SII publica 3,6 redondeado)")
p(f"$1.000.000 dic-2025 → ago-2026 = {D('1000000') * acc}")
p(f"UTA dic-2025 = 12 × 69.542 = {12 * UTM_DIC2025} (SII)")
p(f"UF 31-12-2025 = 317.823.680 / 8.000 = {D('317823680') / 8000} (SII)")
p(f"topes APV/intereses: 600 UF = {600 * UF_DIC31_2025}; 8 UTA = {8 * UTA_DIC2025}; "
  f"15 UTA = {15 * UTA_DIC2025}")

# ---------------------------------------------------------------------------
# Resumen
# ---------------------------------------------------------------------------
p()
p("=" * 78)
p(f"RESULTADO: {failures} divergencia(s) en la reimplementación independiente")
p("=" * 78)

with open("/tmp/opencode/plan115-pass3/independent-output.txt", "w") as fh:
    fh.write("\n".join(out) + "\n")
