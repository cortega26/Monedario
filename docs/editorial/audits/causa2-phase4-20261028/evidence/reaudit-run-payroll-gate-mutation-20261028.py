from pathlib import Path
import re
import shutil
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[5]
EVIDENCE = Path(__file__).resolve().parent
SCRIPT = ROOT / "scripts/check-payroll-consistency.mjs"
REGISTRY = ROOT / "src/config/afpCommissions.ts"
ARTICLE = ROOT / "src/data/blog/como-calcular-sueldo-liquido.md"
exact_claim = "Capital AFP (comisión 1,44%, total AFP 11,44%)"
assert exact_claim in ARTICLE.read_text(encoding="utf-8")

baseline = subprocess.run(
    ["node", str(SCRIPT)], cwd=ROOT, text=True, capture_output=True
)
baseline_text = baseline.stdout + baseline.stderr
assert baseline.returncode == 0, baseline_text

with tempfile.TemporaryDirectory(prefix="monedario-reaudit-payroll-") as temp:
    temp_root = Path(temp)
    (temp_root / "scripts").mkdir()
    (temp_root / "src/config").mkdir(parents=True)
    (temp_root / "src/data/blog").mkdir(parents=True)
    shutil.copy2(SCRIPT, temp_root / "scripts/check-payroll-consistency.mjs")
    shutil.copy2(REGISTRY, temp_root / "src/config/afpCommissions.ts")
    (temp_root / "src/data/blog/d2-example.md").write_text(
        exact_claim + ".\n", encoding="utf-8"
    )

    registry_copy = temp_root / "src/config/afpCommissions.ts"
    registry_text = registry_copy.read_text(encoding="utf-8")
    old = '{ name: "Capital", commission: 1.44, total: 11.44 }'
    new = '{ name: "Capital", commission: 0.58, total: 10.58 }'
    assert registry_text.count(old) == 1
    registry_copy.write_text(registry_text.replace(old, new), encoding="utf-8")

    mutated = subprocess.run(
        ["node", "scripts/check-payroll-consistency.mjs"],
        cwd=temp_root,
        text=True,
        capture_output=True,
    )
    mutated_text = mutated.stdout + mutated.stderr
    assert mutated.returncode == 1, mutated_text
    assert "FAIL: 2 afirmación(es)" in mutated_text, mutated_text

lines = [
    "Payroll consistency baseline and isolated mutation — 2026-10-28",
    "$ node scripts/check-payroll-consistency.mjs (audited checkout)",
    f"exit={baseline.returncode}",
    baseline_text.rstrip(),
    "",
    "Temporary copy: /tmp/monedario-reaudit-payroll-* (automatically removed on exit)",
    'Mutation: AFP Capital registry 1.44/11.44 -> 0.58/10.58',
    f"Fixture claim copied verbatim from the audited article: {exact_claim}",
    "$ node scripts/check-payroll-consistency.mjs (temporary copy)",
    f"exit={mutated.returncode} (expected 1)",
    mutated_text.rstrip(),
    "PASS: mutation caused exactly two mismatches, commission and total AFP.",
]
output = EVIDENCE / "reaudit-payroll-gate-mutation-20261028.txt"
output.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(output.read_text(encoding="utf-8"))
