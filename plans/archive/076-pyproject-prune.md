# Plan 076: Podar el stack Python de scraping/MCP no usado en `pyproject.toml`

> **Instrucciones al ejecutor**: Sigue este plan paso a paso. Corre cada
> verificación y confirma el resultado esperado antes de avanzar. Si ocurre
> algo de la sección "Condiciones de STOP", detente y reporta — no improvises.
> Cuando termines, actualiza la fila de este plan en `plans/README.md`.
>
> **Drift check (correr primero)**:
> `git diff --stat 90370b4e..HEAD -- pyproject.toml uv.lock scripts/*.py scripts/data-signals/*.py`
> Si cambió el contenido citado, compara contra el código vivo; ante desajuste, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW/MED
- **Depends on**: none
- **Category**: deps (higiene)
- **Planned at**: commit `90370b4e`, 2026-08-10
- **Issue**: —

## Por qué importa

`pyproject.toml` declara **22 dependencias de scraping/automatización/MCP**
(scrapling, beautifulsoup4, lxml, cssselect, browserforge, curl-cffi, tld,
Protego, w3lib, playwright, patchright, httpx, requests, pydantic,
pydantic-settings, python-dotenv, mcp, uvicorn, cryptography, rich, orjson,
msgspec) que **ningún archivo `.py` del repo importa** — verificado por grep
(los imports reales son `googleapiclient`/`google-auth` en
`scripts/get_gsc_dns_token.py` y `fonttools`/`brotli` en
`scripts/subset-fonts.py`). El ADR del worker de snapshot
(`docs/adr/ADR-20260516-economic-snapshot-cloudflare-worker.md:90-99`)
rechazó scrapling explícitamente para el único caso de scraping real
("Rechazado por incompatibilidad de runtime"). Costo: el autoupdate mensual de
deps (`.github/workflows/python-deps-autoupdate.yml`) churn ~20 paquetes
inútiles, `pip-audit` (security-scans.yml:234) escanea un grafo de 116
paquetes por CVEs de código que no existe, y la descripción del proyecto
("and scraping") sobrevende la capacidad.

## Estado actual

- `pyproject.toml:9-55` — deps del proyecto (ver lista arriba) + `:56-59`
  `fonttools[woff]`, `brotli`.
- `[dependency-groups] dev` (`:61-68`): `ruff`, `ipython`, `pytest`,
  `pytest-cov`, `pytest-mock`, `pip-audit`.
- Scripts Python reales: `scripts/get_gsc_dns_token.py` (googleapiclient,
  google-auth), `scripts/subset-fonts.py` (fonttools, brotli) — verificar con
  grep si hay más `.py` con imports.
- `uv.lock` (116 paquetes) — sincronizado (`uv lock --check` OK).
- `tests/` tiene tests Python (pytest, `--cov=scripts`) — dependen de
  `pytest*` y de lo que importen los scripts testeados.

## Comandos que vas a necesitar

| Propósito | Comando | Éxito esperado |
|-----------|---------|----------------|
| Inventario de imports | `grep -rhn "^import \|^from " scripts/ tests/ --include="*.py" | sort -u` | lista real de imports |
| Re-lock | `uv lock` | exit 0; uv.lock podado |
| Tests Python | `.venv/bin/python -m pytest` (o `uv run pytest`) | todos pasan |
| Check de sync | `uv lock --check` | en sync |
| Audit | `uv run pip-audit` (o `.venv/bin/pip-audit`) | 0 vulnerabilidades |

## Alcance

**En alcance**:
- `pyproject.toml` (deps del proyecto + descripción)
- `uv.lock` (regenerado)

**Fuera de alcance** (NO tocar):
- `[dependency-groups] dev` (pytest/ruff/ipython/pip-audit se quedan — los tests los usan)
- `.github/workflows/python-deps-autoupdate.yml` y `python-ci.yml` (funcionan igual con menos deps)
- Los scripts Python (nada de código)

## Git workflow

- Rama: `advisor/076-pyproject-prune`
- Commit: `chore(deps): podar stack Python no usado (scraping/MCP) del pyproject`
- NO push/PR salvo pedido del operador.

## Pasos

### Paso 1: Inventario exacto de imports

**Verificar**: corre el grep de imports sobre `scripts/` y `tests/` (`.py`).
Anota cada paquete importado. Confirma especialmente que **nadie** importa
scrapling/bs4/patchright/httpx/pydantic/mcp/etc. (grep individual por nombre
si el inventario es grande). Si encuentras UN import real de cualquiera de
ellos, STOP y reporta (la premisa del plan cambia).

### Paso 2: Podar `pyproject.toml`

Reduce `[project] dependencies` a lo importado de verdad (esperado):
```toml
dependencies = [
    # Google APIs — GSC DNS token generation
    "google-api-python-client>=2.194",
    "google-auth>=2.49",
    # Font processing — subset-fonts.py
    "fonttools[woff]>=4.56",
    "brotli>=1.1",
]
```
Y corrige la descripción (`description = "Python tooling scripts for Monedario — GSC token generation, font subsetting, and repo auditing"`).

**Verificar**: `grep -c "scrapling\|beautifulsoup4\|patchright\|browserforge\|curl-cffi\|mcp\|uvicorn" pyproject.toml` → 0.

### Paso 3: Regenerar el lockfile y correr los checks

**Verificar**:
- `uv lock` → exit 0.
- `uv lock --check` → en sync.
- `grep -c "scrapling\|patchright\|browserforge" uv.lock` → 0 (podado).
- Tests: `.venv/bin/python -m pytest` (o el comando que use python-ci.yml —
  léelo para usar el mismo) → todos pasan.
- `uv run pip-audit` → sin vulnerabilidades (o solo las preexistentes — si
  hay alguna, verifica que no la introdujo el plan).
- `pnpm test` → todos pasan (los tests Python se corren aparte, pero la suite
  Node no debe romperse por cambios de lock).

### Paso 4: Gates finales

**Verificar**:
- `git status` → solo `pyproject.toml` y `uv.lock` modificados
- El workflow `python-ci.yml` parsea los mismos comandos (no tocar el workflow; solo confirmar que sus pasos siguen existiendo en package.json/pyproject: `pytest`, `ruff`, `pip-audit` siguen disponibles en dev)

## Test plan

- Suite pytest existente sin cambios (debe seguir pasando con las deps
  podadas — si un test importa algo podado, el Paso 1 lo habría detectado;
  si pasa, STOP).
- Sin tests nuevos: la prueba es que todo lo existente sigue verde con menos
  deps.

## Done criteria

- [ ] `pyproject.toml` con solo los imports reales (4 deps + dev)
- [ ] `uv lock` regenerado y `uv lock --check` OK
- [ ] `.venv/bin/python -m pytest` exit 0
- [ ] `uv run pip-audit` sin hallazgos nuevos
- [ ] Fila actualizada en `plans/README.md`

## Condiciones de STOP

Detente y reporta si:

- El inventario del Paso 1 encuentra imports reales de las deps "no usadas"
  (p. ej. algo de data-signals usa pydantic) — no podas: reporta el mapa real
  y el operador decide.
- `uv lock` falla o `pip-audit` encuentra CVEs en las deps podadas ANTES de
  podar (verifica primero con la lista completa; si ya había, se van con la
  poda — anótalo).
- `python-ci.yml` o el autoupdate dependen de una dep podada (léelo antes).

## Maintenance notes

- El ADR del worker ya fijó la vía sancionada para scraping (Workers L1-L4):
  si la auditoría competitiva reactiva scraping en Python, se re-agregan deps
  en ese PR con su caso de uso — no antes.
- `docs/governance/COMPETITIVE_ADAPTATION_POLICY.md` puede mencionar el stack
  Python como "disponible": revisar si menciona scrapling (doc-drift
  potencial; reporta si lo ves).
- En review: verificar que la descripción corregida no sobrevende y que el
  lockfile quedó realmente podado (no solo el manifest).
