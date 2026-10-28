from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
EVIDENCE = Path(__file__).resolve().parent
liquido = (ROOT / "src/data/blog/como-calcular-sueldo-liquido.md").read_text()
imponible = (ROOT / "src/data/blog/sueldo-imponible-chile.md").read_text()
voluntaria = (
    ROOT / "src/data/blog/cotizacion-voluntaria-afp-independiente.md"
).read_text()
primer_empleo = (
    ROOT / "src/data/blog/primer-empleo-chile-guia-completa.md"
).read_text()
snapshot = json_path = ROOT / (
    "src/infrastructure/economic/economic-parameters.snapshot.json"
)
import json

parameters = json.loads(json_path.read_text())
utm = Decimal(str(parameters["utm"]))


def d(value):
    return Decimal(value)


def pesos(value):
    return f"${value:,.2f} CLP"


gross_total = d("1500000")
allowance = d("150000")
taxable = gross_total - allowance
afp_saving = taxable * d("0.10")
capital_fee = taxable * d("0.0144")
health = taxable * d("0.07")
afc_worker = taxable * d("0.006")
contributions = afp_saving + capital_fee + health + afc_worker
rli = taxable - contributions
tax_exact = rli * d("0.04") - d("37740.06")
tax_rounded = tax_exact.quantize(d("1"), rounding=ROUND_HALF_UP)
net = gross_total - contributions - tax_rounded

required_d2_rows = (
    "| (-) AFP cotización 10%          | Imponible $1.350.000                 | × 10%",
    "| (-) AFP comisión 1,44%          | Imponible $1.350.000                 | × 1,44%",
    "| (-) Salud Fonasa 7%             | Imponible $1.350.000                 | × 7%",
    "| (-) Seguro cesantía 0,6%        | Imponible $1.350.000                 | × 0,6%",
)
for row in required_d2_rows:
    assert row in liquido, row
assert "sueldo bruto total $1.500.000, del cual $150.000 son colación no imponible" in liquido
assert "remuneración imponible $1.350.000" in liquido
d2_table = liquido.split("## Ejemplo completo: de bruto a líquido", 1)[1]
d2_table = d2_table.split("\n---", 1)[0]
assert "(+) Ingresos no imponibles" not in d2_table
assert "+$150.000" not in d2_table
assert [afp_saving, capital_fee, health, afc_worker] == list(
    map(d, ("135000", "19440", "94500", "8100"))
)
assert contributions == d("257040")
assert rli == d("1092960")
assert tax_exact == d("5978.34")
assert tax_rounded == d("5978")
assert net == d("1236982")
assert f"${int(net):,}".replace(",", ".") in d2_table

sis_example = d("560000") * d("0.0178")
assert sis_example == d("9968")
assert "1,78% × $560.000" in voluntaria
assert "$9.968" in voluntaria

capital_example = d("1200000")
capital_saving = capital_example * d("0.10")
capital_fee_example = capital_example * d("0.0144")
health_example = capital_example * d("0.07")
afc_example = capital_example * d("0.006")
capital_total = capital_saving + capital_fee_example + health_example + afc_example
capital_rli = capital_example - capital_total
threshold = utm * d("13.5")
minimum_fee = capital_example * d("0.0046")
minimum_total = capital_saving + minimum_fee + health_example + afc_example
minimum_rli = capital_example - minimum_total
minimum_tax = minimum_rli * d("0.04") - utm * d("0.54")
minimum_net = capital_example - minimum_total - minimum_tax
assert (capital_saving, capital_fee_example, health_example, afc_example) == tuple(
    map(d, ("120000", "17280", "84000", "7200"))
)
assert capital_total == d("228480")
assert capital_rli == d("971520")
assert threshold == d("974038.5")
assert capital_rli < threshold
assert minimum_fee == d("5520")
assert minimum_total == d("216720")
assert minimum_rli == d("983280")
assert minimum_tax == d("369.66")
assert minimum_net == d("982910.34")
assert "[[utm * 13.5 | clp]]" in imponible
assert "[[983280 * 0.04 - utm * 0.54 | clp]]" in imponible

assert "validAsOf: 2026-10-28" in voluntaria
assert "Información vigente al 2026-10-28" in voluntaria
assert "primera afiliación al sistema previsional obligatorio" in primer_empleo
assert "desde el 1 de octubre de 2025 hasta el 30 de septiembre de 2027" in primer_empleo
assert "24 meses" in primer_empleo
assert "no hay un límite de un cambio por año" in primer_empleo
assert "30 días para rechazarlo" in primer_empleo

print("Recalculation evidence — 2026-10-28")
print(f"snapshot={json_path.relative_to(ROOT)}")
print(f"snapshot.utm={utm}; 13.5 UTM={pesos(threshold)}")
print("D2: bruto total=1,500,000; colación=150,000; imponible=1,350,000")
print(
    "D2: AFP 10%=135,000 + comisión 1.44%=19,440 + salud 7%=94,500 "
    "+ AFC 0.6%=8,100"
)
print(f"D2: cotizaciones={contributions}; RLI={rli}")
print(
    f"D2: IUSC exact={tax_exact}; rounded CLP={tax_rounded}; "
    f"líquido desde bruto total={net}"
)
print("D2 table: each deduction percentage uses taxable base 1,350,000")
print("D2 table: no non-taxable income row and no second +150,000")
print(f"D4: SIS 1.78% * 560,000={sis_example}")
print(
    "D13 Capital: 10%=120,000; fee 1.44%=17,280; health=84,000; "
    f"AFC=7,200; total={capital_total}; RLI={capital_rli}; "
    f"RLI < 13.5 UTM ({threshold}): exempt"
)
print(
    "D13 minimum fee: 0.46%=5,520; total deductions="
    f"{minimum_total}; RLI={minimum_rli}; ISC 4%={minimum_tax}; "
    f"net={minimum_net}"
)
print("D13 macros: [[utm * 13.5 | clp]]=974038.50; 4% formula=369.66")
print("All asserted article text and independent Decimal calculations: PASS")
