"""
Adaptador minimo del proveedor de IA del asistente (assist.py): Anthropic
Messages API con salida estructurada. Es el UNICO archivo que habla con el
proveedor; assist.py recibe una funcion con la firma de `call_model`, asi que
las pruebas inyectan una falsa y nunca llegan a la red ni gastan dinero.

Hay dos adaptadores, elegidos por assist.provider: "anthropic" (SDK oficial) y
"openai_compat" (modelo local en un servidor compatible con OpenAI, solo urllib).
Sin herramientas: el modelo solo devuelve JSON. Sin prefill ni parametros de
muestreo (los modelos actuales los rechazan). La clave sale de la variable de
entorno ANTHROPIC_API_KEY (la lee el SDK); nunca se registra.

Docs: https://docs.claude.com/en/api/messages y
https://docs.claude.com/en/docs/build-with-claude/structured-outputs
"""
import json
import os
import socket
import time
import urllib.error
import urllib.request
from dataclasses import dataclass


class ProviderError(Exception):
    """Fallo no reintentable (auth, peticion invalida, negativa)."""


class ProviderTransient(ProviderError):
    """Fallo transitorio agotados los reintentos del SDK (red, 429, 5xx, timeout)."""


class ProviderUnavailable(ProviderTransient):
    """No se pudo llegar al modelo (tunel caido, PC apagado, 502/504/524, timeout de
    conexion). No es culpa del hilo: assist.py no gasta intentos y corta el lote."""


class ProviderInvalidOutput(ProviderError):
    """El proveedor respondio, pero no con JSON utilizable."""


@dataclass(frozen=True)
class ModelResult:
    data: dict
    input_tokens: int
    output_tokens: int


def call_model(*, system: str, user: str, schema: dict, model: str, max_output_tokens: int,
               timeout_s: float, max_retries: int) -> ModelResult:
    """Una llamada al modelo. Lanza ProviderError / ProviderTransient /
    ProviderInvalidOutput; el llamador conserva el hilo pendiente en los tres."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise ProviderError("falta ANTHROPIC_API_KEY en el entorno")
    import anthropic  # perezoso: solo el proceso del asistente lo necesita

    client = anthropic.Anthropic(timeout=timeout_s, max_retries=max_retries)
    try:
        resp = client.messages.create(
            model=model,
            max_tokens=max_output_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
            thinking={"type": "disabled"},  # clasificar y redactar corto: sin razonamiento largo (costo acotado)
            output_config={"format": {"type": "json_schema", "schema": schema}},
        )
    except (anthropic.APITimeoutError, anthropic.APIConnectionError, anthropic.RateLimitError) as exc:
        raise ProviderTransient(f"{type(exc).__name__}") from exc
    except anthropic.APIStatusError as exc:
        if exc.status_code >= 500:
            raise ProviderTransient(f"HTTP {exc.status_code}") from exc
        raise ProviderError(f"HTTP {exc.status_code}") from exc  # sin el cuerpo: podria eco de contenido

    if resp.stop_reason not in ("end_turn", "stop_sequence"):
        raise ProviderInvalidOutput(f"stop_reason={resp.stop_reason}")  # max_tokens, refusal...
    text = next((b.text for b in resp.content if b.type == "text"), "")
    try:
        data = json.loads(text)
    except ValueError as exc:
        raise ProviderInvalidOutput("la respuesta no es JSON") from exc
    if not isinstance(data, dict):
        raise ProviderInvalidOutput("la respuesta no es un objeto JSON")
    return ModelResult(data, resp.usage.input_tokens, resp.usage.output_tokens)


# --- modelo local (servidor compatible con OpenAI: llama.cpp llama-server, etc.) ---------
# El servidor corre en el PC de Carlos y se publica con un Cloudflare Tunnel saliente
# (funciona tras CGNAT y con IP rotativa). Cloudflare corta las respuestas que tardan
# ~100 s en dar el primer byte: por eso se pide SIEMPRE streaming (SSE), que mantiene
# viva la conexion mientras el modelo genera en CPU.

def _unavailable_status(code: int) -> bool:
    return code in (408, 429) or 500 <= code <= 599  # incluye 502/504 y 524 de Cloudflare


def call_openai_compat(*, base_url: str, system: str, user: str, schema: dict, model: str,
                       max_output_tokens: int, timeout_s: float, total_timeout_s: float,
                       enable_thinking: bool = False) -> ModelResult:
    """Una llamada en streaming a `{base_url}/chat/completions`. Credenciales solo por
    entorno: LOCAL_LLM_API_KEY (Bearer) y, si el hostname esta tras Cloudflare Access,
    CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET (service token)."""
    if not base_url.startswith("https://") and not base_url.startswith("http://127.0.0.1"):
        raise ProviderError("assist.base_url debe ser https:// (o http://127.0.0.1 para pruebas locales)")
    headers = {"Content-Type": "application/json", "Accept": "text/event-stream"}
    if os.environ.get("LOCAL_LLM_API_KEY"):
        headers["Authorization"] = "Bearer " + os.environ["LOCAL_LLM_API_KEY"]
    if os.environ.get("CF_ACCESS_CLIENT_ID") and os.environ.get("CF_ACCESS_CLIENT_SECRET"):
        headers["CF-Access-Client-Id"] = os.environ["CF_ACCESS_CLIENT_ID"]
        headers["CF-Access-Client-Secret"] = os.environ["CF_ACCESS_CLIENT_SECRET"]
    body = {
        "model": model, "stream": True, "stream_options": {"include_usage": True},
        "max_tokens": max_output_tokens, "temperature": 0.2,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        # salida restringida al esquema (gramatica): sin esto un modelo chico rompe el JSON
        "response_format": {"type": "json_schema", "json_schema": {"name": "triage", "strict": True, "schema": schema}},
        "chat_template_kwargs": {"enable_thinking": enable_thinking},  # Qwen: sin razonamiento largo
    }
    req = urllib.request.Request(base_url.rstrip("/") + "/chat/completions",
                                 data=json.dumps(body).encode(), headers=headers, method="POST")
    deadline = time.monotonic() + total_timeout_s
    parts: list[str] = []
    usage = {"prompt_tokens": 0, "completion_tokens": 0}
    finish = None
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # timeout_s = espera entre bytes
            for raw in resp:
                if time.monotonic() > deadline:
                    raise ProviderUnavailable("tiempo total agotado")
                line = raw.decode("utf-8", "replace").strip()
                if not line.startswith("data:"):
                    continue
                payload = line[5:].strip()
                if payload == "[DONE]":
                    break
                try:
                    chunk = json.loads(payload)
                except ValueError:
                    raise ProviderInvalidOutput("fragmento SSE no es JSON")
                if chunk.get("usage"):
                    usage = chunk["usage"]
                for ch in chunk.get("choices") or []:
                    parts.append((ch.get("delta") or {}).get("content") or "")
                    finish = ch.get("finish_reason") or finish
    except urllib.error.HTTPError as exc:
        if _unavailable_status(exc.code):
            raise ProviderUnavailable(f"HTTP {exc.code}") from exc
        raise ProviderError(f"HTTP {exc.code}") from exc  # 401/403: clave o Access mal; sin cuerpo en el mensaje
    except (urllib.error.URLError, socket.timeout, TimeoutError, ConnectionError, OSError) as exc:
        raise ProviderUnavailable(type(exc).__name__) from exc
    if finish not in ("stop", None):
        raise ProviderInvalidOutput(f"finish_reason={finish}")  # length, content_filter...
    try:
        data = json.loads("".join(parts))
    except ValueError as exc:
        raise ProviderInvalidOutput("la respuesta no es JSON") from exc
    if not isinstance(data, dict):
        raise ProviderInvalidOutput("la respuesta no es un objeto JSON")
    return ModelResult(data, int(usage.get("prompt_tokens") or 0), int(usage.get("completion_tokens") or 0))


def build_call_fn(cfg: dict):
    """La funcion `call_fn` que usa assist.py segun assist.provider. Misma firma que
    call_model: es el unico punto de contacto con el proveedor (y el que las pruebas reemplazan)."""
    provider = cfg.get("provider", "anthropic")
    if provider == "anthropic":
        return call_model
    if provider == "openai_compat":
        base = cfg.get("base_url")
        if not isinstance(base, str) or not base:
            raise ValueError("assist.provider=openai_compat exige assist.base_url")

        def call(*, system, user, schema, model, max_output_tokens, timeout_s, max_retries):
            return call_openai_compat(
                base_url=base, system=system, user=user, schema=schema, model=model,
                max_output_tokens=max_output_tokens, timeout_s=timeout_s,
                total_timeout_s=cfg.get("total_timeout_s", 240), enable_thinking=bool(cfg.get("enable_thinking", False)))
        return call
    raise ValueError(f"assist.provider invalido: {provider!r} (validos: anthropic, openai_compat)")
