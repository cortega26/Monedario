from datetime import datetime
from hashlib import sha256
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
import json
import re
from urllib.request import Request, urlopen


BASE = Path(__file__).resolve().parent
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


class TextCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        text = " ".join(data.split())
        if text:
            self.parts.append(text)


def collect_t_nodes(value, found):
    if isinstance(value, dict):
        if isinstance(value.get("t"), str):
            found.append(value["t"])
        for nested in value.values():
            collect_t_nodes(nested, found)
    elif isinstance(value, list):
        for nested in value:
            collect_t_nodes(nested, found)


def article_text(parsed):
    fragments = []
    collect_t_nodes(parsed.get("html", []), fragments)
    collector = TextCollector()
    collector.feed(unescape("\n".join(fragments)))
    return re.sub(r"\s+", " ", " ".join(collector.parts)).strip()


def excerpt(text, needle, before=240, after=1250, last=False):
    matches = list(re.finditer(re.escape(needle), text, re.IGNORECASE))
    if not matches:
        raise ValueError(f"No se encontró el extracto: {needle}")
    match = matches[-1] if last else matches[0]
    return text[max(0, match.start() - before) : match.start() + after]


retrieved_at = datetime.now().astimezone().isoformat(timespec="seconds")
raw_records = {}
texts = {}
for norm_id in ("7147", "184979", "207436"):
    url = (
        "https://nuevo.leychile.cl/servicios/Navegar/get_norma_json"
        f"?idNorma={norm_id}"
    )
    request = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Referer": f"https://www.bcn.cl/leychile/navegar?idNorma={norm_id}",
        },
    )
    with urlopen(request, timeout=60) as response:
        raw = response.read()
        status = response.status
        content_type = response.headers.get("Content-Type", "")
        response_date = response.headers.get("Date", "")
    parsed = json.loads(raw)
    text = article_text(parsed)
    texts[norm_id] = text
    raw_records[norm_id] = {
        "url": url,
        "httpStatus": status,
        "contentType": content_type,
        "responseDate": response_date,
        "bytes": len(raw),
        "sha256": sha256(raw).hexdigest(),
        "textChars": len(text),
    }

assert "treinta días corridos" in texts["7147"]
assert "en cualquier oportunidad, de acuerdo a las reglas generales" in texts["7147"]
assert "0,6% de las remuneraciones imponibles, de cargo del trabajador" in texts[
    "184979"
]
assert "once años en cada relación laboral" in texts["184979"]
assert "paga directamente la cuota del mutuo o crédito" in texts["207436"]

lines = [
    "BCN LeyChile API fresh fetch evidence — 2026-10-28",
    f"retrievedAt={retrieved_at}",
    f"User-Agent: {USER_AGENT}",
    "API: https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=<idNorma>",
]
for norm_id, record in raw_records.items():
    lines.extend(
        [
            "",
            f"HTTP {record['httpStatus']} {record['url']}",
            f"Content-Type={record['contentType']}; Date={record['responseDate']}",
            f"bytes={record['bytes']}; sha256={record['sha256']}; full statute body not retained",
        ]
    )

lines.extend(
    [
        "",
        "DL 3.500, article 160 — fresh API text confirms a 30-calendar-day decision window:",
        'Quote: "no formar parte del grupo licitado en el plazo de treinta días corridos".',
        "DL 3.500, article 165 — paraphrase: eligible workers may transfer to another AFP at any time under general rules.",
        'Quote: "en cualquier oportunidad, de acuerdo a las reglas generales".',
        "",
        "Law 19.728, article 5 — paraphrase: employee 0.6% is limited to indefinite contracts; fixed-term and house-particular employee rates are zero.",
        'Quote: "0,6% ... de cargo del trabajador con contrato de duración indefinida".',
        "",
        "Law 19.728, article 9 — CIC limit applies separately to each employment relationship.",
        'Quote: "máximo de once años en cada relación laboral".',
        "",
        "Labour Code, article 58 — paraphrase: the 30% employer-loan deduction requires direct payment to the lender or education provider; written deductions are subject to 15% and a combined 45% ceiling.",
        'Quote: "paga directamente la cuota del mutuo o crédito a la institución financiera".',
    ]
)
output = BASE / "reaudit-bcn-api-extracts-20261028.txt"
output.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(output.read_text(encoding="utf-8"))
