"""Independent Decimal recalculation; inputs are read from the target checkout and sourced evidence."""
from decimal import Decimal, ROUND_HALF_UP
import json
import re
from pathlib import Path

ROOT = Path.cwd()
EVIDENCE = ROOT / "docs/editorial/audits/causa2-phase4-20261028/evidence"
D = Decimal

def parse_percent(raw):
    return D(raw) / D(100)

def extract_percent(block, key):
    match = re.search(rf'{re.escape(key)}:\s*\{{\s*rate:\s*([0-9.]+)', block)
    if not match:
        raise ValueError(f"Missing PayrollRules rate for {key}")
    return D(match.group(1))

def thousands(raw):
    return D(raw.replace(".", ""))

source = json.loads((EVIDENCE / "audit-source-values.json").read_text())
snapshot = json.loads((ROOT / "src/infrastructure/economic/economic-parameters.snapshot.json").read_text())
article = (ROOT / "src/data/blog/como-calcular-sueldo-liquido.md").read_text()
related_article = (ROOT / "src/data/blog/sueldo-imponible-chile.md").read_text()
afp_text = (ROOT / "src/config/afpCommissions.ts").read_text()
rules_text = (ROOT / "src/domain/payroll/PayrollRules.ts").read_text()

# D1: IMM is read from the repository snapshot; 4.75 is recorded from BCN art. 50.
imm = D(str(snapshot["imm"]))
multiplier = D(source["gratificationImmMultiple"]["value"])
d1 = imm * multiplier

# D2: amounts are parsed from the exact worked example; AFP values from the registry.
assumption = re.search(
    r"sueldo bruto \$([\d.]+), imponible \$([\d.]+) \(incluye colación no imponible de \$([\d.]+)\)",
    article,
    re.I,
)
if not assumption:
    raise ValueError("Worked example assumption not found")
gross_total, taxable, colacion = map(thousands, assumption.groups())
registry = {
    name: (D(commission), D(total))
    for name, commission, total in re.findall(
        r'name:\s*"([^"]+)",\s*commission:\s*([\d.]+),\s*total:\s*([\d.]+)', afp_text
    )
}
capital_commission, capital_total = registry["Capital"]
mandatory_saving = capital_total - capital_commission
worker_block = re.search(r'id:\s*"afc.worker"([\s\S]*?)\n\s*\},\n\s*\{\n\s*id:\s*"afc.employer"', rules_text).group(1)
health_block = re.search(r'id:\s*"health.legal"([\s\S]*?)\n\s*\},\s*\]\s+as const', rules_text).group(1)
worker_afc_rate = extract_percent(worker_block, 'indefinido')
health_rate = extract_percent(health_block, 'indefinido')
afp_saving = taxable * mandatory_saving / D(100)
afp_fee = taxable * capital_commission / D(100)
health = taxable * health_rate
worker_afc = taxable * worker_afc_rate
contributions = afp_saving + afp_fee + health + worker_afc
rli = taxable - contributions
sii = source["siiApril2026"]
factor, rebate = D(sii["factor"]), D(sii["rebate"])
tax_exact = rli * factor - rebate
tax_whole_peso = tax_exact.quantize(D("1"), rounding=ROUND_HALF_UP)
net_from_gross = gross_total - contributions - tax_whole_peso
net_if_plus_row_applied = net_from_gross + colacion

# D3: published allocations are compared to contract-specific engine totals.
rule_worker = {k: extract_percent(worker_block, k) * 100 for k in ("indefinido", '"plazo-fijo"', '"casa-particular"')}
# Match contract keys in PayrollRules explicitly (the property names are quoted for hyphenated keys).
for label, key in (("plazo-fijo", '"plazo-fijo"'), ("casa-particular", '"casa-particular"')):
    rule_worker[label] = extract_percent(worker_block, key) * 100
employer_block = re.search(r'id:\s*"afc.employer"([\s\S]*?)\n\s*\},\n\s*\{\n\s*id:\s*"health.legal"', rules_text).group(1)
rule_employer = {
    "indefinido": extract_percent(employer_block, "indefinido") * 100,
    "plazo-fijo": extract_percent(employer_block, '"plazo-fijo"') * 100,
    "casa-particular": extract_percent(employer_block, '"casa-particular"') * 100,
}
allocations = source["afcAllocationPct"]
contract_totals = {}
for contract in ("indefinido", "plazo-fijo", "casa-particular"):
    row = allocations[contract]
    cic, fcs = D(row["employerCic"]), D(row["employerFcs"])
    worker, employer = rule_worker[contract], rule_employer[contract]
    contract_totals[contract] = (worker, employer, cic, fcs, worker + employer)
    assert cic + fcs == employer
    assert D(row["worker"]) == worker

# D6/D7: commission extrema from repository registry; health/AFC from payroll rules.
fees = [pair[0] for pair in registry.values()]
minimum_fee, maximum_fee = min(fees), max(fees)
minimum_afp = next(name for name, pair in registry.items() if pair[0] == minimum_fee)
maximum_afp = next(name for name, pair in registry.items() if pair[0] == maximum_fee)
health_pct = health_rate * 100
house_afc_pct = rule_worker["casa-particular"]
d6_indef_min = mandatory_saving + minimum_fee + health_pct + rule_worker["indefinido"]
d6_indef_max = mandatory_saving + maximum_fee + health_pct + rule_worker["indefinido"]
d6_house_min = mandatory_saving + minimum_fee + health_pct + house_afc_pct
d6_house_max = mandatory_saving + maximum_fee + health_pct + house_afc_pct

# D13: caps from repo snapshot; statutory limits and years from extracted primary-source data.
health_cap_uf = D(str(snapshot["previsionalTopes"]["pensionAndHealthMonthlyTaxableCapUf"]))
afc_cap_uf = D(str(snapshot["afcTopes"]["monthlyTaxableCapUf"]))
health_max_uf = health_cap_uf * health_rate
limits = source["writtenDeductionLimitsPct"]
base_example = D("1000000")

print(f"D1 source snapshot imm={imm} effective={snapshot['immEffectiveDate']}; BCN art.50 multiplier={multiplier}; result={d1}")
print(f"D2 article inputs gross_total={gross_total}; taxable={taxable}; non_taxable_colacion={colacion}")
print(f"D2 registry Capital commission={capital_commission}%; total={capital_total}%; derived_saving={mandatory_saving}%")
print(f"D2 payroll rules worker AFC={worker_afc_rate*100}%; health={health_rate*100}%")
print(f"D2 rows AFP saving={afp_saving}; AFP fee={afp_fee}; health={health}; AFC worker={worker_afc}; contributions={contributions}")
print(f"D2 RLI={rli}; SII April bracket={sii['firstTaxable']}..{sii['secondBracketMax']}; factor={factor}; rebate={rebate}")
print(f"D2 tax_exact={tax_exact}; nearest peso={tax_whole_peso}; in_4pct_bracket={D(sii['firstTaxable']) <= rli <= D(sii['secondBracketMax'])}")
print(f"D2 net_from_total_gross={net_from_gross}; if every displayed row is summed including +colacion={net_if_plus_row_applied}; divergence={net_if_plus_row_applied-net_from_gross}")
d2_rli_at_max_fee = taxable - (taxable * mandatory_saving / D("100")) - (taxable * maximum_fee / D("100")) - health - worker_afc
d2_rli_at_min_fee = taxable - (taxable * mandatory_saving / D("100")) - (taxable * minimum_fee / D("100")) - health - worker_afc
print(
    f"D2 bracket sensitivity across registry fees {minimum_fee}%..{maximum_fee}%: "
    f"RLI={d2_rli_at_max_fee}..{d2_rli_at_min_fee}; "
    f"entire_range_in_April_4pct="
    f"{D(sii['firstTaxable']) <= d2_rli_at_max_fee and d2_rli_at_min_fee <= D(sii['secondBracketMax'])}"
)
for contract, values in contract_totals.items():
    print(f"D3 {contract} worker={values[0]}%; employer={values[1]}%; CIC={values[2]}%; FCS={values[3]}%; total={values[4]}%; allocations_sum={values[2]+values[3]}%")
print(f"D6 indefinite deductions min={d6_indef_min}%; max={d6_indef_max}%; house-particular min={d6_house_min}%; max={d6_house_max}%")
print(f"D7 registry commissions min={minimum_fee}% ({minimum_afp}); max={maximum_fee}% ({maximum_afp})")
print(f"D13 repo caps AFP/health={health_cap_uf} UF; AFC={afc_cap_uf} UF; 7% health max={health_max_uf} UF")
for base_uf in (D("89"), health_cap_uf, D("100")):
    capped_health_uf = min(base_uf, health_cap_uf) * health_rate
    print(f"D14 health edge: imponible={base_uf} UF; legal 7% capped at {health_cap_uf} UF => {capped_health_uf} UF")
sample_imponible_uf = taxable / D(str(snapshot["uf"]))
print(f"D14 article example taxable=$1,350,000; UF snapshot={snapshot['uf']}; example_base={sample_imponible_uf} UF; below_90UF={sample_imponible_uf < health_cap_uf}; Fonasa_7%=${taxable*health_rate}")
print(f"D13 written discounts on $1,000,000 gross: general={base_example*parse_percent(limits['general'])}; employer-credit={base_example*parse_percent(limits['employerLoan'])}; combined={base_example*parse_percent(limits['combined'])}")
print(f"D13 AFC CIC maximum years per source={source['afcMaximumCicYears']['value']}; worker AFC exemption from LIR is stated by Ley 19.728 art.53")

# Cluster contradiction: the linked sueldo-imponible article applies the 4% tax
# bracket to gross imponible earnings before subtracting its own displayed
# pension, health and AFC contributions.
related_gross = thousands(re.search(r"sueldo bruto de \$([\d.]+)", related_article).group(1))
related_afp = thousands(re.search(r"Cotización obligatoria AFP \(~10,5%\): ~\$([\d.]+)", related_article).group(1))
related_health = thousands(re.search(r"Salud \(7%\): \$([\d.]+)", related_article).group(1))
related_afc = thousands(re.search(r"AFC \(0,6%; \$0 en casa particular\): \$([\d.]+)", related_article).group(1))
related_mandatory = related_afp + related_health + related_afc
related_rli = related_gross - related_mandatory
utm = D(str(snapshot["utm"]))
related_exempt = utm * D("13.5")
related_thirty_utm = utm * D("30")
assert related_exempt < related_rli < related_thirty_utm
related_tax_overstatement = related_mandatory * D("0.04")
print(f"Cluster sueldo-imponible example: gross={related_gross}; stated mandatory deductions before tax={related_mandatory}; derived RLI={related_rli}; UTM snapshot={utm}; within 4% tranche={related_exempt}..{related_thirty_utm}; tax base overstatement={related_mandatory}; tax overstatement at 4%={related_tax_overstatement} before omitted AFP fee")
related_correct_min_fee = related_gross * minimum_fee / D("100")
related_correct_max_fee = related_gross * maximum_fee / D("100")
related_correct_base_before_fee = related_gross * (
    D("1") - mandatory_saving / D("100") - health_rate - worker_afc_rate
)
related_correct_rli_low = related_correct_base_before_fee - related_correct_max_fee
related_correct_rli_high = related_correct_base_before_fee - related_correct_min_fee
related_capital_fee = related_gross * capital_commission / D("100")
print(
    f"Cluster corrected RLI range using 10% saving + current AFP fee "
    f"{minimum_afp}..{maximum_afp} and PayrollRules health/AFC="
  f"{related_correct_rli_low}..{related_correct_rli_high}; "
  f"RLI at Capital {capital_commission}%={related_correct_base_before_fee-related_capital_fee}; "
    f"tax-base overstatement vs gross="
  f"{related_gross-related_correct_rli_high}..{related_gross-related_correct_rli_low}"
)
