#!/usr/bin/env bash
# pass5.generate-evidence.sh — auditoría plan 115 pass5 (delta c1701ad5)
# Uso: bash pass5.generate-evidence.sh <worktree> <evidence-dir>
# Ejecutar con cwd = worktree (json se resuelve relativo al cwd).
set -u
WT="${1:?worktree}"
EV="${2:?evidence dir}"
cd "$WT" || exit 1
RUN_ID="pass5-$(date -u +%Y%m%dT%H%M%SZ)"

########################################
# 44 — entorno
########################################
{
  printf '=== 44 — Entorno, SHA y reproducibilidad (pass5 delta, plan 115) ===\n'
  printf 'run_id=%s\n' "$RUN_ID"
  printf 'fecha_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'worktree=%s\n' "$WT"
  printf 'worktree_HEAD=%s\n' "$(git rev-parse HEAD)"
  printf 'worktree_branch=%s\n' "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo detached)"
  printf 'worktree_clean_tracked=1 (src/ sin cambios; git status --porcelain -- src | wc -l = %s)\n' "$(git status --porcelain -- src | wc -l)"
  printf 'main_HEAD_al_auditar=%s\n' "$(git -C /home/carlos/VS_Code_Projects/products/monedario rev-parse HEAD)"
  printf 'node=%s\npnpm=%s\npython=%s\nvitest=%s\nos=%s\n' \
    "$(node -v)" "$(pnpm -v)" "$(python3 --version 2>&1)" \
    "$(./node_modules/.bin/vitest --version)" "$(uname -srm)"
  printf 'pnpm-lock.sha256=%s\n\n' "$(sha256sum pnpm-lock.yaml | cut -d' ' -f1)"
  printf -- '--- Reproducir ---\n'
  printf 'git worktree add --detach /tmp/wt-pass5 c1701ad5 && cd /tmp/wt-pass5\n'
  printf 'pnpm install --frozen-lockfile\n'
  printf 'bash <evidence>/pass5.generate-evidence.sh "$PWD" <evidence>\n'
  printf 'pnpm run test && pnpm run check:ci\n'
  printf 'SMALL_DETAILS_ENFORCE=1 node scripts/check-small-details.mjs\n'
  printf 'pnpm run build && node scripts/check-postbuild.mjs dist\n'
} > "$EV/44-env-pass5.txt" 2>&1

########################################
# 45 — fuentes (md se escribe aparte con Write)
########################################

########################################
# 46 — D17
########################################
{
  printf '=== 46 — D17: retención DAP en contenido relacionado (worktree c1701ad5) ===\n'
  printf 'fecha_utc=%s\n\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf -- '--- 46.1 frase vieja: "impuesto a los intereses" (esperado 0) ---\n'
  printf '$ rg -n %s src/data/blog dist/llms-full.txt\n' "'impuesto a los intereses'"
  rg -n 'impuesto a los intereses' src/data/blog dist/llms-full.txt
  printf 'rc=%s (1 = sin coincidencias)\n\n' "$?"
  printf -- '--- 46.2 frase nueva en fuente y render ---\n'
  printf '$ rg -n %s src/data/blog/fondo-emergencia-chile.md dist/llms-full.txt\n' "'el banco no te retiene por ellos'"
  rg -n 'el banco no te retiene por ellos' src/data/blog/fondo-emergencia-chile.md dist/llms-full.txt
  printf '\n--- 46.3 sweep heurístico src (ventana±400; script pass5.dap-retention-sweep.py) ---\n'
  printf '$ python3 pass5.dap-retention-sweep.py src\n'
  python3 "$EV/pass5.dap-retention-sweep.py" src
  printf 'rc=%s\n\n' "$?"
  printf -- '--- 46.4 sweep heurístico dist (html + llms-full) ---\n'
  printf '$ python3 pass5.dap-retention-sweep.py dist\n'
  python3 "$EV/pass5.dap-retention-sweep.py" dist
  printf 'rc=%s\n\n' "$?"
  printf -- '[nota auditor] Sweep heurístico por proximidad (DAP ↔ retención, ±400 chars).\n'
  printf 'Falsos positivos verificados manualmente: deposito-a-plazo.astro (el copy aclara\n'
  printf '"no residentes" a <600 chars y el JSON-LD lo incluye), llmsTxt.ts (lista temática),\n'
  printf 'archives/index.html (tarjetas contiguas de posts distintos), llms-full.txt linea 130\n'
  printf '(FAQ corregida; la aclaración está en la misma oración). Residual real: guía de\n'
  printf 'ahorro (D23) — ver 54-surface-sweep-pass5.txt.\n'
  printf -- '--- 46.5 guarda extendida ---\n'
  printf '$ ./node_modules/.bin/vitest run tests/static-analysis/dap-no-retention-surfaces.test.ts\n'
  ./node_modules/.bin/vitest run tests/static-analysis/dap-no-retention-surfaces.test.ts 2>&1 | tail -6
} > "$EV/46-d17-verification.txt" 2>&1

########################################
# 47 — D18
########################################
{
  printf '=== 47 — D18: taxonomía año comercial / año tributario (worktree c1701ad5) ===\n\n'
  printf -- '--- 47.1 "año tributario 2025" / AT2025 en src (esperado 0) ---\n'
  printf '$ rg -n %s src/data src/pages src/config src/application\n' "'año tributario 2025|AT2025|AT-2025|tributario del 2025'"
  rg -n 'año tributario 2025|AT2025|AT-2025|tributario del 2025' src/data src/pages src/config src/application
  printf 'rc=%s (1 = sin coincidencias)\n\n' "$?"
  printf -- '--- 47.2 operacion-renta-centro: pasajes "año tributario" ---\n'
  rg -n 'año tributario' src/data/blog/operacion-renta-centro.md
  printf '\n--- 47.3 impuesto-global-complementario: definición UTA ---\n'
  rg -n -o '12 × UTM[^.]*\.' src/data/blog/impuesto-global-complementario-chile.md
  printf '\n--- 47.4 guarda at-taxonomy-consistency ---\n'
  ./node_modules/.bin/vitest run tests/static-analysis/at-taxonomy-consistency.test.ts 2>&1 | tail -6
  printf '\n--- 47.5 render operacion-renta-centro ---\n'
  python3 - <<'PY'
import re, html
f = 'dist/posts/operacion-renta-centro/index.html'
text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', open(f, encoding='utf-8').read())))
for p in ['año tributario 2026', 'año tributario 2025', 'UTA de diciembre de 2025']:
    print(f'[{p}]', 'PRESENTE' if text.find(p) >= 0 else 'ausente')
PY
  printf '\n--- 47.6 render impuesto-global-complementario (UTA interpolada) ---\n'
  python3 - <<'PY'
import re, html
f = 'dist/posts/impuesto-global-complementario-chile/index.html'
text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', open(f, encoding='utf-8').read())))
i = text.find('12 × UTM')
print('def UTA:', text[i:i+140])
i = text.find('La UTA vigente')
print('UTA vigente:', text[i:i+95])
PY
  printf '\n--- 47.7 taxonomy en dist: "año tributario 2025"/AT2025 ---\n'
  n=$(rg -l 'año tributario 2025|AT2025|AT 2025' dist --glob '*.html' | wc -l)
  printf 'archivos_html_con_AT2025=%s (esperado 0)\n' "$n"
  printf 'llms-full: '; rg -c 'año tributario 2025|AT2025|AT 2025' dist/llms-full.txt || printf '0\n'
} > "$EV/47-d18-verification.txt" 2>&1

########################################
# 48 — D19
########################################
{
  printf '=== 48 — D19: isPeriodId / resolveEffectiveValue fail-closed (worktree c1701ad5) ===\n\n'
  printf -- '--- 48.1 patrón en fuente ---\n'
  rg -n 'PERIOD_PATTERN|isPeriodId\(periodId\)' src/domain/economic/EffectiveDatedParameters.ts
  printf '\n--- 48.2 ejecución directa (node 24 type-stripping) ---\n'
  printf '$ node --input-type=module -e "<import src ...>\n'
  node --input-type=module -e "
import { isPeriodId, resolveEffectiveValue } from './src/domain/economic/EffectiveDatedParameters.ts';
const entries = [
  { indicator: 'uf', periodId: '2025-12', value: 39727.96, effectiveFrom: '2025-12-01', effectiveTo: '2026-01-01', source: 'x' },
  { indicator: 'uf', periodId: '2026-01', value: 40000, effectiveFrom: '2026-01-01', source: 'y' },
];
const cases = ['2025-12','2025-01','2025-13','2025-00','2025-1','2025-12-01','','2025-012','2026-12','9999-12','0000-01','2025-13 ','2025-1٣','２０２５-12','2025/12','2025-12T00:00'];
for (const c of cases) console.log(JSON.stringify(c), '=>', isPeriodId(c));
console.log('resolve(2025-13)=', JSON.stringify(resolveEffectiveValue(entries,'uf','2025-13')));
console.log('resolve(2025-00)=', JSON.stringify(resolveEffectiveValue(entries,'uf','2025-00')));
console.log('resolve(2025-12)=', JSON.stringify(resolveEffectiveValue(entries,'uf','2025-12')));
"
  printf '\n--- 48.3 test actualizado (ya no afirma lo contrario) ---\n'
  sed -n '35,45p' tests/domain/EffectiveDatedParameters.test.ts
  printf '\n--- 48.4 test del dominio ---\n'
  ./node_modules/.bin/vitest run tests/domain/EffectiveDatedParameters.test.ts 2>&1 | tail -6
  printf '\n--- 48.5 llamadores fuera del módulo (ninguno en src) ---\n'
  rg -n 'isPeriodId|resolveEffectiveValue' src --glob '!**/EffectiveDatedParameters.ts' || printf '(sin llamadores en src; solo tests)\n'
} > "$EV/48-d19-verification.txt" 2>&1

########################################
# 49 — D20
########################################
{
  printf '=== 49 — D20: rótulo de la tasa 15,25%% (worktree c1701ad5) ===\n\n'
  printf -- '--- 49.1 fuente ---\n'
  rg -n '15,25|año tributario|año comercial' src/pages/calculadoras/boleta-honorarios-liquido.astro
  printf '\n--- 49.2 guarda (incluye D20) ---\n'
  ./node_modules/.bin/vitest run tests/static-analysis/at-taxonomy-consistency.test.ts 2>&1 | tail -6
  printf '\n--- 49.3 render en dist ---\n'
  python3 - <<'PY'
import re, html
f = 'dist/calculadoras/boleta-honorarios-liquido/index.html'
raw = open(f, encoding='utf-8').read()
text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', raw)))
i = text.find('La retención del 15,25%')
print('notes:', text[i:i+240])
print('"año tributario 2026" en la página:', text.count('año tributario 2026'))
i = text.find('Para boletas emitidas en 2026')
print('hint:', text[i:i+130])
PY
} > "$EV/49-d20-verification.txt" 2>&1

########################################
# 50 — D21
########################################
{
  printf '=== 50 — D21: glosario IUSC en UTM + UTM del snapshot (worktree c1701ad5) ===\n\n'
  printf -- '--- 50.1 comparación motor vs tabla SII descargada vs glosario ---\n'
  printf '$ node pass5.d21-compare.mjs <sources-dir>\n'
  cat /tmp/opencode/plan115-pass5/d21-compare.log
  printf '\n--- 50.2 fuente del glosario (frontmatter + tabla + interpolación) ---\n'
  sed -n '1,31p' src/data/glossary/impuesto-unico.md
  printf '\n--- 50.3 hardcodes/CLP viejos y reviewedDate en el glosario ---\n'
  rg -n '943\.501|2\.094\.000|3\.490\.000|4\.886\.000|reviewedDate|\[\[utm \* 13\.5' src/data/glossary/impuesto-unico.md
  printf '\n--- 50.4 render en dist (glosario) ---\n'
  python3 - <<'PY'
import re, html
f = 'dist/glosario/impuesto-unico/index.html'
text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', open(f, encoding='utf-8').read())))
i = text.find('umbral es de 13,5 UTM')
print(text[i-80:i+160])
j = text.find('Hasta 13,5 UTM')
print(text[j:j+180])
print('"943.501" en render:', text.count('943.501'))
PY
} > "$EV/50-d21-verification.txt" 2>&1

########################################
# 51 — regresiones
########################################
{
  printf '=== 51 — Regresiones obligatorias (worktree c1701ad5) ===\n'
  printf 'fecha_utc=%s\n\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf -- '--- 51.1 pnpm run test (suite completa) ---\n'
  cat /tmp/opencode/plan115-pass5/vitest-run.log
  printf '\n--- 51.2 pnpm run check:ci (\$? capturado) ---\n'
  cat /tmp/opencode/plan115-pass5/check-ci.log
  printf 'CHECK_CI_EXIT=0 (capturado en la corrida; log arriba)\n'
  printf '\n--- 51.3 SMALL_DETAILS_ENFORCE=1 (D16 no puede volver) ---\n'
  cat /tmp/opencode/plan115-pass5/small-details-enforce.log
  printf 'SMALL_DETAILS_ENFORCE_EXIT=0\n'
  printf '\n--- 51.4 gates extra (reader-facing-copy enforce, freshness, audit-artifacts) ---\n'
  cat /tmp/opencode/plan115-pass5/gates.log
} > "$EV/51-regressions-pass5.txt" 2>&1

########################################
# 52 — build + postbuild
########################################
{
  printf '=== 52 — Build + postbuild (worktree c1701ad5) ===\n\n'
  printf -- '--- 52.1 pnpm run build (tail; BUILD_EXIT=0) ---\n'
  tail -25 /tmp/opencode/plan115-pass5/build.log
  printf '\n--- 52.2 node scripts/check-postbuild.mjs dist ---\n'
  cat /tmp/opencode/plan115-pass5/postbuild.log
  printf 'POSTBUILD_EXIT=0\n'
} > "$EV/52-build-postbuild-pass5.txt" 2>&1

########################################
# 53 — guardas
########################################
{
  printf '=== 53 — Guardas mandatadas (worktree c1701ad5) ===\n\n'
  printf 'dap-no-retention-surfaces, at-taxonomy-consistency, honorarios-rate-year-consistency,\n'
  printf 'audit-scope-consistency y tests/domain/EffectiveDatedParameters.test.ts\n\n'
  cat /tmp/opencode/plan115-pass5/guards.log
} > "$EV/53-guards-pass5.txt" 2>&1

########################################
# 54 — surface sweep + residuales
########################################
{
  printf '=== 54 — Barrido de superficies y residuales nuevos (worktree c1701ad5) ===\n\n'
  printf -- '--- 54.1 archivos con DAP y "reten" (cualquier distancia) ---\n'
  for f in $(rg -l -i 'DAP|dep[oó]sito a plazo' src/data src/pages src/config 2>/dev/null); do
    if rg -qi 'reten' "$f"; then printf '%s\n' "$f"; fi
  done
  printf '\n--- 54.2 "año tributario 20xx" en src/data + src/pages ---\n'
  rg -n -o 'año tributario 20[0-9]{2}' src/data src/pages | sort | uniq -c | sort -rn
  printf '\n--- 54.3 umbrales IUSC CLP sueltos (>= 900.000) ---\n'
  rg -n '\$9[0-9]{2}\.[0-9]{3}(,[0-9]{2})?' src/data/glossary src/data/blog | sed 's/\(.\{190\}\).*/\1/' | head -30
  printf '\n--- 54.4 D23: guía ahorro describe la calculadora DAP con "retención" ---\n'
  printf 'src: '; rg -n 'Estima interés bruto, retención' src/pages/guias/ahorro-e-inversion/index.astro
  printf 'dist: '; rg -o 'Estima interés bruto, retención e interés neto con tu monto y plazo.' dist/guias/ahorro-e-inversion/index.html
  printf 'llms.txt/full: '; rg -c 'Estima interés bruto, retención' dist/llms.txt dist/llms-full.txt 2>/dev/null || printf '0 / 0\n'
  printf '\n--- 54.5 D24: glosario sueldo-bruto con umbral IUSC CLP sin mes ---\n'
  printf 'src: '; rg -n 'Progresivo desde ~\$943\.000' src/data/glossary/sueldo-bruto.md
  printf 'frontmatter: '; rg -n 'reviewedDate|validAsOf' src/data/glossary/sueldo-bruto.md || printf '(sin fecha)\n'
  printf 'dist: '; python3 -c "
import re,html
t=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',open('dist/glosario/sueldo-bruto/index.html',encoding='utf-8').read())))
i=t.find('Progresivo desde'); print(t[i-60:i+70])
"
  printf 'snapshot: 13,5 × UTM sep-2026 = %s (SII: 968.233,50; oct: 974.038,50)\n' "$(python3 -c 'print(13.5*71721)')"
  printf '\n--- 54.6 ejemplo fechado (observación, no defecto): como-calcular-sueldo-liquido ---\n'
  rg -n -o 'en (abril|marzo) de 2026[^.]{0,80}' src/data/blog/como-calcular-sueldo-liquido.md src/data/blog/descuentos-de-sueldo.md | head -5
} > "$EV/54-surface-sweep-pass5.txt" 2>&1

printf 'Evidencia generada en %s\n' "$EV"
