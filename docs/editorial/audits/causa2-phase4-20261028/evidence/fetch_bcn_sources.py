"""Fetch the three official LeyChile JSON text snapshots requested in the audit."""
from html import unescape
from pathlib import Path
import json
import re
from urllib.request import Request, urlopen

BASE = Path(__file__).resolve().parent
NORMS = {"207436": "Codigo del Trabajo", "7147": "DL 3500", "184979": "Ley 19728"}


def collect_t(value, found):
    if isinstance(value, dict):
        if isinstance(value.get("t"), str):
            found.append(value["t"])
        for nested in value.values():
            collect_t(nested, found)
    elif isinstance(value, list):
        for nested in value:
            collect_t(nested, found)


for norm, label in NORMS.items():
    url = f"https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma={norm}"
    referer = f"https://www.bcn.cl/leychile/navegar?idNorma={norm}"
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            "Referer": referer,
        },
    )
    with urlopen(request, timeout=30) as response:
        raw = response.read()
        status = response.status
    parsed = json.loads(raw)
    target = BASE / f"bcn-{norm}.json"
    target.write_bytes(raw)
    fragments = []
    collect_t(parsed, fragments)
    text = unescape(re.sub(r"<[^>]+>", " ", "\n".join(fragments)))
    text = re.sub(r"\s+", " ", text).strip()
    text_path = BASE / f"bcn-{norm}-text.txt"
    text_path.write_text(text + "\n", encoding="utf-8")
    print(f"{label}: HTTP {status}; bytes={len(raw)}; t_nodes={len(fragments)}; text_chars={len(text)}; saved={target.name},{text_path.name}")
