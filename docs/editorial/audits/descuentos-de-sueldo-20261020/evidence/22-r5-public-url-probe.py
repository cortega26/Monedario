#!/usr/bin/env python3
"""Fresh, cache-bypassing fetch of every URL in the R5 surface inventory."""

from datetime import datetime, timezone
from html.parser import HTMLParser
import re
import sys
from urllib.request import Request, urlopen

URLS = [
    "https://monedario.cl/calculadoras/apv/",
    "https://monedario.cl/calculadoras/operacion-renta/",
    "https://monedario.cl/calculadoras/seguro-cesantia/",
    "https://monedario.cl/calculadoras/sueldo-liquido/",
    "https://monedario.cl/glosario/afc/",
    "https://monedario.cl/glosario/fondo-solidario/",
    "https://monedario.cl/glosario/sueldo-bruto/",
    "https://monedario.cl/leyes/ley-19728-seguro-cesantia/",
    "https://monedario.cl/posts/como-calcular-sueldo-liquido/",
    "https://monedario.cl/posts/descuentos-de-sueldo/",
    "https://monedario.cl/posts/interes-compuesto-nota-metodologica/",
    "https://monedario.cl/posts/liquidacion-de-sueldo/",
    "https://monedario.cl/posts/primer-empleo-chile-guia-completa/",
    "https://monedario.cl/posts/seguro-cesantia-cuenta-individual-vs-fondo-solidario/",
    "https://monedario.cl/posts/seguro-de-cesantia/",
    "https://monedario.cl/posts/sueldo-imponible-chile/",
    "https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/",
    "https://www.afc.cl/que-es-el-seguro-de-cesantia/preguntas-frecuentes/seguro-de-cesantia/",
    "https://www.bcn.cl/leychile/navegar?idNorma=184979",
]


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "noscript", "svg"}:
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript", "svg"} and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip and data.strip():
            self.parts.append(data.strip())


def normalized_text(payload):
    parser = TextExtractor()
    parser.feed(payload.decode("utf-8", errors="replace"))
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip()


print(f"R5 public URL probe startedAt={datetime.now(timezone.utc).isoformat()}")
print("method=urllib.request; Cache-Control=no-cache,no-store; Pragma=no-cache")
print(f"urlCount={len(URLS)}")
failures = 0
patterns = {
    "casa_particular": re.compile(r"casa\s+particular", re.IGNORECASE),
    "worker_0_6": re.compile(r"0[.,]6\s*%", re.IGNORECASE),
    "employer_2_4": re.compile(r"2[.,]4\s*%", re.IGNORECASE),
    "indefinido": re.compile(r"indefinido", re.IGNORECASE),
    "plazo_fijo": re.compile(r"plazo\s+fijo", re.IGNORECASE),
}

for index, url in enumerate(URLS, start=1):
    cache_buster = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    request_url = url + ("&" if "?" in url else "?") + "audit_r5=" + cache_buster
    request = Request(
        request_url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; Monedario-R5-audit/1.0)",
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache",
        },
    )
    try:
        with urlopen(request, timeout=30) as response:
            body = response.read(3_000_000)
            text = normalized_text(body)
            indicators = " ".join(
                f"{name}={len(pattern.findall(text))}"
                for name, pattern in patterns.items()
            )
            print(
                f"[{index:02d}] status={response.status} date="
                f"{response.headers.get('Date', 'UNKNOWN')} "
                f"cache={response.headers.get('Cache-Control', 'UNKNOWN')} "
                f"requested={request_url} final={response.geturl()} "
                f"indicators=({indicators})"
            )
            if response.status != 200:
                failures += 1
    except Exception as error:  # Record each URL and keep checking the full set.
        failures += 1
        print(f"[{index:02d}] ERROR url={request_url} error={type(error).__name__}: {error}")

print(f"result={'PASS' if failures == 0 else 'FAIL'} failures={failures}")
sys.exit(0 if failures == 0 else 1)
