#!/usr/bin/env python3
"""05_latency_test.py — mide latencia, velocidad y validez del JSON de llama-server, con la MISMA peticion
que hara el asistente (assist_provider.call_openai_compat): streaming SSE, response_format json_schema estricto,
enable_thinking=false, temperature 0.2, max_tokens 900. Solo libreria estandar.

Uso local (paso 3):
    python3 "Claude outputs/05_latency_test.py"
Uso por el tunel (paso 6), con las credenciales SOLO en variables de entorno de tu terminal (no se imprimen):
    python3 "Claude outputs/05_latency_test.py" --base-url https://llm.monedario.cl/v1 --label tunel

Clave: variable LOCAL_LLM_API_KEY, o si no existe, el archivo ~/.config/llama-server.key.
Cabeceras de Cloudflare Access: CF_ACCESS_CLIENT_ID y CF_ACCESS_CLIENT_SECRET (solo si estan definidas).
Salida: pantalla + latency_<label>_result.txt junto a este script. Nunca se imprimen cabeceras ni claves.
Datos: 05_latency_data.json (system_prompt y output_schema copiados de assist.py; el hilo es SINTETICO).
"""
import argparse
import json
import os
import pathlib
import socket
import sys
import time
import urllib.error
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
DATA = json.load(open(HERE / "05_latency_data.json", encoding="utf-8"))
SYSTEM, SCHEMA, CATALOG = DATA["system_prompt"], DATA["output_schema"], DATA["catalogo_recursos"]
CATALOG_URLS = {c["url"] for c in CATALOG}


def build_body(system, user, model, max_tokens):
    return {
        "model": model, "stream": True, "stream_options": {"include_usage": True},
        "max_tokens": max_tokens, "temperature": 0.2,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "response_format": {"type": "json_schema", "json_schema": {"name": "triage", "strict": True, "schema": SCHEMA}},
        "chat_template_kwargs": {"enable_thinking": False},
    }


def make_headers(key_file):
    h = {"Content-Type": "application/json", "Accept": "text/event-stream"}
    key = os.environ.get("LOCAL_LLM_API_KEY")
    if not key and os.path.exists(key_file):
        key = open(key_file).read().strip()
    if key:
        h["Authorization"] = "Bearer " + key
    if os.environ.get("CF_ACCESS_CLIENT_ID") and os.environ.get("CF_ACCESS_CLIENT_SECRET"):
        h["CF-Access-Client-Id"] = os.environ["CF_ACCESS_CLIENT_ID"]
        h["CF-Access-Client-Secret"] = os.environ["CF_ACCESS_CLIENT_SECRET"]
    return h


def call(base_url, headers, body, timeout_s, total_timeout_s):
    """Devuelve dict con tiempos (s desde el envio), texto, usage y timings. Nunca incluye cuerpos de error."""
    req = urllib.request.Request(base_url.rstrip("/") + "/chat/completions",
                                 data=json.dumps(body).encode(), headers=headers, method="POST")
    r = {"parts": [], "usage": {}, "timings": {}, "finish": None, "error": None}
    t0 = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            r["t_headers"] = time.monotonic() - t0
            for raw in resp:
                now = time.monotonic() - t0
                if now > total_timeout_s:
                    r["error"] = "tiempo total agotado"
                    break
                line = raw.decode("utf-8", "replace").strip()
                if not line.startswith("data:"):
                    continue
                r.setdefault("t_first_data", now)
                payload = line[5:].strip()
                if payload == "[DONE]":
                    break
                try:
                    chunk = json.loads(payload)
                except ValueError:
                    r["error"] = "fragmento SSE no es JSON"
                    break
                if chunk.get("usage"):
                    r["usage"] = chunk["usage"]
                if chunk.get("timings"):
                    r["timings"] = chunk["timings"]
                for ch in chunk.get("choices") or []:
                    piece = (ch.get("delta") or {}).get("content") or ""
                    if piece:
                        r.setdefault("t_first_content", now)
                    r["parts"].append(piece)
                    r["finish"] = ch.get("finish_reason") or r["finish"]
    except urllib.error.HTTPError as e:
        r["error"] = f"HTTP {e.code}"
    except (urllib.error.URLError, socket.timeout, TimeoutError, ConnectionError, OSError) as e:
        r["error"] = f"{type(e).__name__}"
    r["t_total"] = time.monotonic() - t0
    r["text"] = "".join(r["parts"])
    return r


def validate(obj):
    """Validacion manual contra OUTPUT_SCHEMA (additionalProperties=false, enums, tipos)."""
    props, req = SCHEMA["properties"], SCHEMA["required"]
    if not isinstance(obj, dict):
        return ["la raiz no es un objeto"]
    errs = []
    if set(obj) - set(props):
        errs.append(f"claves extra: {sorted(set(obj) - set(props))}")
    if set(req) - set(obj):
        errs.append(f"claves faltantes: {sorted(set(req) - set(obj))}")
    for k in ("classification", "opportunity"):
        if k in obj and obj[k] not in props[k]["enum"]:
            errs.append(f"{k} fuera del enum: {obj[k]!r}")
    if "reason" in obj and not isinstance(obj["reason"], str):
        errs.append("reason no es string")
    if "context_sufficient" in obj and not isinstance(obj["context_sufficient"], bool):
        errs.append("context_sufficient no es booleano")
    for k in ("draft", "resource_url"):
        if k in obj and not (obj[k] is None or isinstance(obj[k], str)):
            errs.append(f"{k} no es string ni null")
    pv = obj.get("pending_verification")
    if "pending_verification" in obj and not (isinstance(pv, list) and all(isinstance(x, str) for x in pv)):
        errs.append("pending_verification no es lista de strings")
    return errs


def fmt(x, nd=1):
    return "n/d" if x is None else f"{x:.{nd}f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="http://127.0.0.1:8080/v1")
    ap.add_argument("--label", default="local")
    ap.add_argument("--key-file", default=os.path.expanduser("~/.config/llama-server.key"))
    ap.add_argument("--user-agent", default="monedario-reddit-assist-latency/1.0",
                    help="User-Agent de la prueba. Cloudflare rechaza (403, error 1010) el 'Python-urllib/x.y' por defecto; "
                         "usa --user-agent '' para enviar el de urllib y reproducir ese bloqueo")
    ap.add_argument("--only", default="", help="lista separada por comas de: warm,A,A2,C (por defecto todas)")
    # Modo MEDICION: esperas generosas para obtener el numero real aunque supere los limites del asistente
    # (90 s / 240 s en config.json). El resumen final compara contra esos umbrales.
    ap.add_argument("--timeout-s", type=float, default=300, help="espera entre bytes de esta corrida (el asistente usa %s)" % DATA["config_timeout_s"])
    ap.add_argument("--total-timeout-s", type=float, default=600, help="tope total por peticion de esta corrida (el asistente usa %s)" % DATA["config_total_timeout_s"])
    a = ap.parse_args()

    out_path = HERE / f"latency_{a.label}_result.txt"
    lines = []

    def log(s=""):
        print(s, flush=True)
        lines.append(s)

    headers = make_headers(a.key_file)
    if a.user_agent:
        headers["User-Agent"] = a.user_agent
    log(f"== Latencia [{a.label}] {a.base_url} | {time.strftime('%Y-%m-%d %H:%M:%S')} ==")
    log(f"cabeceras enviadas (solo nombres): {sorted(headers)}")
    log(f"asistente: timeout_s={DATA['config_timeout_s']} (entre bytes) total_timeout_s={DATA['config_total_timeout_s']}; "
        f"esta corrida usa timeout_s={a.timeout_s:g} total={a.total_timeout_s:g}")
    log("umbrales: 80 s = alerta del encargo | 90 s = timeout_s del asistente | ~100 s = corte de Cloudflare (524)")

    plan = [
        ("warm", "calentamiento (prompt minimo, sin system prompt real; solo carga pesos en cache de pagina)",
         "Responde solo con la palabra: ok", "Eres un asistente breve."),
        ("A", "hilo largo ~2.000 palabras (system+usuario), system prompt SIN cache (caso frio)", DATA["threads"]["A"], SYSTEM),
        ("A2", "mismo tamano, titulo distinto: comparte solo el system prompt (regimen normal con --cache-reuse)", DATA["threads"]["A2"], SYSTEM),
        ("C", "hilo corto no financiero (~200 palabras de hilo + system prompt): valida esquema con draft null", DATA["threads"]["C"], SYSTEM),
    ]
    wanted = {x.strip() for x in a.only.split(",") if x.strip()}
    results = []
    for key, desc, user, system in plan:
        if wanted and key not in wanted:
            continue
        log(f"\n-- [{key}] {desc}")
        words = len((system + " " + user).split())
        log(f"   prompt: {len(system) + len(user)} caracteres, ~{words} palabras")
        body = build_body(system, user, DATA["model"], DATA["max_output_tokens"] if key != "warm" else 8)
        if key == "warm":
            body.pop("response_format")
        r = call(a.base_url, headers, body, a.timeout_s, a.total_timeout_s)
        u, tm = r["usage"], r["timings"]
        ptok, ctok = u.get("prompt_tokens"), u.get("completion_tokens")
        cached = (u.get("prompt_tokens_details") or {}).get("cached_tokens")
        tfc = r.get("t_first_content")
        dec = None
        if ctok and tfc is not None and r["t_total"] > tfc:
            dec = (ctok - 1) / (r["t_total"] - tfc) if ctok > 1 else None
        pre = (ptok / tfc) if (ptok and tfc) else None
        log(f"   tiempos (s desde el envio): cabeceras={fmt(r.get('t_headers'))} | primer_dato_SSE={fmt(r.get('t_first_data'))} | "
            f"primer_token={fmt(tfc)} | total={fmt(r['t_total'])}")
        log(f"   tokens: prompt={ptok} (en cache: {cached}) salida={ctok} | prefill~{fmt(pre)} tok/s | decodificacion~{fmt(dec)} tok/s | finish={r['finish']}")
        if tm:
            log(f"   segun el servidor: prompt_n={tm.get('prompt_n')} a {fmt(tm.get('prompt_per_second'))} tok/s | "
                f"predicted_n={tm.get('predicted_n')} a {fmt(tm.get('predicted_per_second'))} tok/s")
        rec = {"key": key, "t_headers": r.get("t_headers"), "t_first_data": r.get("t_first_data"), "error": r["error"],
               "ptok": ptok, "cached": cached}
        if r["error"]:
            log(f"   ERROR: {r['error']}")
        elif key != "warm":
            try:
                obj = json.loads(r["text"])
                errs = validate(obj)
                log(f"   JSON valido: si | esquema: {'OK' if not errs else 'ERRORES ' + '; '.join(errs)}")
                if isinstance(obj, dict):
                    d = obj.get("draft")
                    ru = obj.get("resource_url")
                    log(f"   clasificacion={obj.get('classification')} oportunidad={obj.get('opportunity')} "
                        f"contexto_suficiente={obj.get('context_sufficient')} borrador_palabras={len(d.split()) if isinstance(d, str) else 0} "
                        f"url_en_catalogo={'n/a' if not ru else ru in CATALOG_URLS} pendientes={len(obj.get('pending_verification') or [])}")
                    log(f"   razon: {str(obj.get('reason'))[:200]}")
                    if isinstance(d, str):
                        log(f"   borrador: {d[:400]}")
                rec["schema_ok"] = not errs
            except ValueError:
                log(f"   JSON valido: NO (finish={r['finish']}, {len(r['text'])} caracteres recibidos)")
                rec["schema_ok"] = False
        results.append(rec)

    log("\n== Resumen frente a los umbrales ==")
    for rec in results:
        if rec["key"] in ("A", "A2"):
            fb = rec.get("t_first_data") if rec.get("t_first_data") is not None else rec.get("t_headers")
            if rec["error"]:
                log(f"[{rec['key']}] fallo: {rec['error']}")
            elif fb is None:
                log(f"[{rec['key']}] sin primer dato")
            else:
                v = "OK (<80 s)" if fb < 80 else ("ALERTA: >=80 s" if fb < 90 else "CRITICO: >=90 s (excede timeout_s del asistente)")
                if fb >= 100:
                    v += " y >=100 s: Cloudflare cortaria con 524"
                log(f"[{rec['key']}] primer dato SSE a {fb:.1f} s -> {v}")
                pt, ct = rec.get("ptok"), rec.get("cached")
                lim = 0.5 if rec["key"] == "A" else 0.9   # A debe ser (casi) frio; A2 solo debe compartir el system prompt
                if pt and ct is not None and ct / pt > lim:
                    log(f"    ATENCION: NO REPRESENTATIVO. {ct} de {pt} tokens del prompt ya estaban en la cache del servidor "
                        f"({100 * ct / pt:.0f} %), asi que este primer byte NO mide un prefill real. Para medir en frio: "
                        f"systemctl --user restart llama-server (espera /health=200) y repite con --only warm,A,A2")
    pathlib.Path(out_path).write_text("\n".join(lines) + "\n", encoding="utf-8")
    log(f"\nResultado guardado en: {out_path}")


if __name__ == "__main__":
    sys.exit(main())
