#!/usr/bin/env python3
"""Fetch primary sources and print verbatim anchors used by 05-math-audit.md.

R2 of the auditor prompt requires, for every parameter: URL, literal quote and
retrieval date. This script records HTTP status, byte size and SHA256 for each
retrieval, then prints a short window around the anchor so the quote can be
checked against the live page. It never writes outside evidence/.

Run: python3 04-fetch-source-extracts.py > 04-source-extracts-2026-10-20.txt
"""

from __future__ import annotations

import hashlib
import html
import re
import ssl
import sys
import time
import urllib.request
from datetime import datetime, timezone

UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)

# (id, url, anchor regex, encoding, note)
SOURCES = [
    (
        "S1",
        "https://www.spensiones.cl/portal/institucional/594/w3-article-16921.html",
        r"tope imponible mensual para calcular las cotizaciones obligatorias",
        "utf-8",
        "Topes 2026: 90,0 UF pensiones/salud; 135,2 UF cesantia; desde remuneraciones de febrero de 2026.",
    ),
    (
        "S2",
        "https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/",
        r"período máximo de pago de cotizaciones",
        "utf-8",
        "11 anos por relacion laboral, cumplido con la cotizacion N.133; 0,8% FCS despues.",
    ),
    (
        "S2b",
        "https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/",
        r"Cuenta Individual",
        "utf-8",
        "Aporte empleador: indefinido CIC 1,6% + FCS 0,8%; plazo fijo CIC 2,8% + FCS 0,2%.",
    ),
    (
        "S3",
        "https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm",
        r"Octubre 2026",
        "latin-1",
        "Tabla IUSC octubre 2026: exento hasta 974.038,50; tramo 4% rebaja 38.961,54.",
    ),
    (
        "S3b",
        "https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm",
        r"Abril 2026",
        "latin-1",
        "Tabla IUSC abril 2026: exento hasta 943.501,50; tramo 4% rebaja 37.740,06.",
    ),
    (
        "S3c",
        "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm",
        r"Octubre",
        "latin-1",
        "UTM octubre 2026 = 72.151; marzo y abril 2026 = 69.889.",
    ),
    (
        "S11",
        "https://www.spensiones.cl/portal/institucional/594/w3-article-2810.html",
        r"comisiones mensuales que actualmente cobran",
        "utf-8",
        "Comisiones vigentes por AFP: Capital 1,44; Modelo 0,58; Provida 1,45; Uno 0,46.",
    ),
    (
        "S12",
        "https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9897.html",
        r"tasa vigente del SIS",
        "utf-8",
        "SIS 1,78% desde agosto de 2026; rango de comisiones 0,46% a 1,45%.",
    ),
    (
        "S13",
        "https://www.dt.gob.cl/portal/1628/w3-article-60141.html",
        r"A contar del 01 de mayo de 2026",
        "utf-8",
        "IMM 553.553 desde 01/05/2026, Ley 21.830 (D.O. 22.06.2026).",
    ),
]

BCN = [
    ("S10-wrong", "30053", "URL usada por 00-scope.json/02-primary-sources.txt para 'Ley 18.833'"),
    ("S10", "30209", "Norma que realmente corresponde a la Ley 18.833 (art. 22)"),
]


def clean(raw: bytes, encoding: str) -> str:
    text = raw.decode(encoding, "replace")
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", text, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", "\n", text)
    text = html.unescape(text)
    lines = [" ".join(line.split()) for line in text.split("\n")]
    return "\n".join(line for line in lines if line)


def fetch(url: str) -> tuple[int, bytes]:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    last: Exception | None = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60, context=ctx) as resp:
                return resp.status, resp.read()
        except Exception as exc:  # noqa: BLE001 - retry transient resets
            last = exc
            time.sleep(2 * (attempt + 1))
    raise last  # type: ignore[misc]


def main() -> int:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print("=== PRIMARY SOURCE EXTRACTS (verbatim anchors) ===")
    print(f"RetrievedAt: {now}")
    print("Method: urllib GET with browser User-Agent; HTML stripped; anchors below are literal page text.")
    print("Caveat: AFC pages embed per-request tokens, so their SHA256 changes between fetches; the text anchors do not.")
    print()

    for sid, url, anchor, encoding, note in SOURCES:
        try:
            status, raw = fetch(url)
        except Exception as exc:  # noqa: BLE001 - evidence script
            print(f"=== {sid}: FETCH ERROR ===\nURL: {url}\nERROR: {exc}\n")
            continue
        text = clean(raw, encoding)
        m = re.search(anchor, text, re.I)
        print(f"=== {sid} ===")
        print(f"URL: {url}")
        print(f"HTTP: {status} | Bytes: {len(raw)} | SHA256: {hashlib.sha256(raw).hexdigest()}")
        print(f"Note: {note}")
        if not m:
            print("ANCHOR: NO MATCH")
            print()
            continue
        start = max(0, m.start() - 120)
        window = text[start : m.start() + 900].replace("\n", " | ")
        print(f'ANCHOR MATCH "{m.group(0)}":')
        print(f"  {window}")
        print()

    print("=== BCN metadata (title of each idNorma) ===")
    for sid, idn, note in BCN:
        url = f"https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma={idn}"
        try:
            status, raw = fetch(url)
        except Exception as exc:  # noqa: BLE001
            print(f"{sid} idNorma={idn}: ERROR {exc}")
            continue
        import json

        data = json.loads(raw.decode("utf-8", "replace"))
        meta = data.get("metadatos", {})
        tipos = meta.get("tipos_numeros", [{}])[0]
        print(f"{sid} idNorma={idn} | HTTP {status} | {tipos.get('compuesto')} | {meta.get('titulo_norma')}")
        print(f"  note: {note}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
