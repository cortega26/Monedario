#!/usr/bin/env python3
"""Show whether the structural AFC guard detects a broken APV type mapping."""

from pathlib import Path
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[5]
RELATIVE_FILES = [
    "tests/static-analysis/afc-casa-particular-guard.test.ts",
    "src/data/blog/seguro-de-cesantia.md",
    "src/data/blog/primer-empleo-chile-guia-completa.md",
    "src/data/blog/descuentos-de-sueldo.md",
    "src/data/laws/ley-19728-seguro-cesantia.md",
    "src/pages/calculadoras/sueldo-liquido.astro",
    "src/pages/calculadoras/apv.astro",
    "src/pages/calculadoras/operacion-renta.astro",
]

original = '''const contractType =
      contractTypeValue === "plazo-fijo"
        ? "plazo-fijo"
        : contractTypeValue === "casa-particular"
          ? "casa-particular"
          : "indefinido";'''
mutated = '''const contractType =
      contractTypeValue === "plazo-fijo" ? "plazo-fijo" : "indefinido";'''

with tempfile.TemporaryDirectory(prefix="r5-afc-guard-") as directory:
    temp_root = Path(directory)
    for relative in RELATIVE_FILES:
        source = ROOT / relative
        destination = temp_root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)

    apv = temp_root / "src/pages/calculadoras/apv.astro"
    source_text = apv.read_text()
    if source_text.count(original) != 1:
        raise SystemExit("expected exactly one current APV mapping to mutate")
    apv.write_text(source_text.replace(original, mutated, 1))

    (temp_root / "node_modules").symlink_to(
        ROOT / "node_modules", target_is_directory=True
    )
    (temp_root / "package.json").write_text('{"type":"module"}\n')
    print("mutation=APV home selection now falls through to indefinido")
    print(
        "selectorStillContainsCasaParticular="
        + str('value="casa-particular"' in apv.read_text())
    )
    result = subprocess.run(
        [
            str(ROOT / "node_modules/.bin/vitest"),
            "run",
            "--root",
            str(temp_root),
            "--reporter=verbose",
            "tests/static-analysis/afc-casa-particular-guard.test.ts",
        ],
        cwd=temp_root,
        text=True,
        capture_output=True,
        check=False,
    )
    print("mutatedGuardExitCode=" + str(result.returncode))
    print(result.stdout.rstrip())
    if result.stderr:
        print(result.stderr.rstrip())
    if result.returncode != 0:
        raise SystemExit("guard rejected the mutation; expected false negative")
    print("finding=FALSE_NEGATIVE: guard passed with broken APV mapping")
