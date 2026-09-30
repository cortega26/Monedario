import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1])
WINDOW = 400
RET = re.compile(r"retenci[oó]n(?:es)?|retiene|retener|retuvo|retendr[aá]|retendr[ií]a|se retiene", re.I)
DAP = re.compile(r"DAP|dep[oó]sito a plazo|dep[oó]sitos a plazo", re.I)
OKCLAR = re.compile(r"no residente|no domiciliad|Impuesto Adicional", re.I)

if ROOT.name == "llms-full.txt" or ROOT.is_file():
    files = [ROOT]
else:
    exts = {".html", ".md", ".mdx", ".astro", ".ts", ".json", ".txt"}
    files = sorted(f for f in ROOT.rglob("*") if f.is_file() and f.suffix in exts and "node_modules" not in f.parts)

total = flagged = clarified = 0
for f in files:
    try:
        text = f.read_text(encoding="utf-8")
    except Exception:
        continue
    for m in RET.finditer(text):
        ctx = text[max(0, m.start() - WINDOW) : m.end() + WINDOW]
        if not DAP.search(ctx):
            continue
        total += 1
        if OKCLAR.search(ctx):
            clarified += 1
        else:
            flagged += 1
            rel = f.relative_to(ROOT) if ROOT in f.parents else f
            line = text.count("\n", 0, m.start()) + 1
            print(f"FLAG {rel}:~{line} [{m.group(0)}] {re.sub(chr(10), ' ', ctx)[:260]}")

print(f"[sweep] archivos={len(files)} ret*junto_a_DAP={total} aclaradas={clarified} sin_aclarar={flagged}")
sys.exit(1 if flagged else 0)
