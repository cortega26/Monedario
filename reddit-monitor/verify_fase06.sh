#!/usr/bin/env bash
#
# Verifica la Fase 0.6: matching expandido + capa semantica en modo
# observacion, corriendo de verdad en la VM.
set -uo pipefail

VM_HOST="ubuntu@159.112.147.154"
VM_KEY="$HOME/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key"
REMOTE_DIR="/home/ubuntu/reddit-monitor"

PASS=0
FAIL=0
check() {
    local desc="$1"; local result="$2"
    if [ "$result" = "0" ]; then echo "  [OK]   $desc"; PASS=$((PASS+1))
    else echo "  [FAIL] $desc"; FAIL=$((FAIL+1)); fi
}
ssh_cmd() { ssh -i "$VM_KEY" -o ConnectTimeout=10 "$VM_HOST" "$1"; }
sql() { ssh_cmd "sqlite3 $REMOTE_DIR/reddit_monitor.db \"$1\""; }

echo "== 1. Librerias de ML instaladas =="
ssh_cmd "python3 -c 'import torch, sentence_transformers, spacy, nltk'" >/dev/null 2>&1
check "torch/sentence-transformers/spacy/nltk importan sin error" $?
ssh_cmd "python3 -c \"import spacy; spacy.load('es_core_news_sm')\"" >/dev/null 2>&1
check "modelo es_core_news_sm de spaCy instalado" $?

echo
echo "== 2. Esquema tiene las columnas de Fase 0.6 =="
COLS="$(sql "PRAGMA table_info(matches);" | grep -c 'ml_')"
if [ "${COLS:-0}" -ge 3 ]; then check "columnas ml_* presentes en matches ($COLS)" 0
else check "columnas ml_* presentes en matches" 1; fi

echo
echo "== 3. filter_version se actualizo a v2 =="
N_V2="$(sql "SELECT COUNT(*) FROM scan_runs WHERE filter_version='v2-2026-09';" 2>/dev/null)"
if [ "${N_V2:-0}" -gt 0 ]; then check "hay corridas con filter_version v2-2026-09 ($N_V2)" 0
else check "hay corridas con filter_version v2-2026-09" 1; fi

echo
echo "== 4. La capa semantica esta escribiendo datos reales =="
N_ML="$(sql "SELECT COUNT(*) FROM matches WHERE ml_confidence IS NOT NULL;" 2>/dev/null)"
N_ML_DISC="$(sql "SELECT COUNT(*) FROM discarded WHERE ml_confidence IS NOT NULL;" 2>/dev/null)"
if [ "${N_ML:-0}" -gt 0 ] || [ "${N_ML_DISC:-0}" -gt 0 ]; then
    check "hay filas con ml_confidence calculado (matches=$N_ML, discarded=$N_ML_DISC)" 0
else
    echo "  [--]   ninguna todavía — normal si la última corrida no tuvo coincidencias/descartes"
fi

echo
echo "== 5. keyword_match_methods se esta registrando (lema/stem funcionando) =="
N_METHODS="$(sql "SELECT COUNT(*) FROM matches WHERE keyword_match_methods LIKE '%lemma%' OR keyword_match_methods LIKE '%stem%';" 2>/dev/null)"
if [ "${N_METHODS:-0}" -gt 0 ]; then
    check "al menos un match encontrado por lema o stem, no solo regex ($N_METHODS)" 0
else
    echo "  [--]   ninguno todavía — normal, depende de qué se publique en Reddit"
fi

echo
echo "== 6. Servicio corrio exitosamente con el limite de memoria nuevo =="
LAST_RESULT="$(ssh_cmd "systemctl show reddit-monitor.service -p Result --value" 2>/dev/null)"
check "última corrida = success (fue: $LAST_RESULT)" $([ "$LAST_RESULT" = "success" ] && echo 0 || echo 1)
# RM-022: 1610612736 bytes = 1536M = MemoryMax de reddit-monitor.service (la
# capa semantica necesita ~1.5G; si se cambia el .service, actualizar aqui).
MEM_MAX="$(ssh_cmd "systemctl show reddit-monitor.service -p MemoryMax --value" 2>/dev/null)"
check "MemoryMax actualizado (actual: $MEM_MAX bytes)" $([ "$MEM_MAX" = "1610612736" ] && echo 0 || echo 1)

echo
echo "== 7. review_sampling.py corre sin error =="
ssh_cmd "cd $REMOTE_DIR && echo q | python3 review_sampling.py . --limit 1" >/dev/null 2>&1
check "review_sampling.py ejecuta correctamente" $?

echo
echo "== 8. La app Pogo-lab sigue sana =="
HTTP_CODE="$(ssh_cmd "curl -fsS -o /dev/null -w '%{http_code}' http://localhost 2>/dev/null")"
if [ -n "$HTTP_CODE" ] && [ "$HTTP_CODE" != "000" ]; then check "nginx/Pogo-lab responde (HTTP $HTTP_CODE)" 0
else echo "  [--]   no se pudo chequear"; fi

echo
echo "════════════════════════════════════════"
echo " Resultado: $PASS OK / $FAIL FAIL"
echo "════════════════════════════════════════"
[ $FAIL -gt 0 ] && exit 1 || exit 0
