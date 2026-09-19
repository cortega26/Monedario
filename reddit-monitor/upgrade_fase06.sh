#!/usr/bin/env bash
#
# Aplica la Fase 0.6 (matching expandido + capa semantica en modo
# observacion) sobre lo que ya esta corriendo en la VM tras la Fase 0.
#
# Instala dependencias de ML (torch CPU, sentence-transformers, spacy,
# nltk) — la unica parte del proyecto con dependencias externas. Si algo
# de esto falla, monitor.py sigue funcionando igual que en la Fase 0 (la
# capa semantica se degrada sola, ver _SEMANTIC_AVAILABLE en monitor.py).
#
# Corre esto DESDE TU PC.
#
# Uso:
#   cd ~/VS_Code_Projects/products/monedario/reddit-monitor
#   bash /ruta/a/upgrade_fase06.sh
#
set -euo pipefail
set -x

trap 'echo; echo "❌ FALLÓ en la línea $LINENO. Revisa el mensaje de error justo arriba."; exit 1' ERR

VM_HOST="ubuntu@159.112.147.154"
VM_KEY="$HOME/VS_Code_Projects/products/Pogo-lab/infra/keys/vm_key"
REMOTE_DIR="/home/ubuntu/reddit-monitor"
HERE="$(cd "$(dirname "$0")" && pwd)"

for f in lexicon.py semantic.py monitor.py requirements-ml.txt \
         migrate_fase06_schema.py review_sampling.py reddit-monitor.service; do
    if [ ! -f "$HERE/$f" ]; then
        echo "Falta $f junto a upgrade_fase06.sh — descarga la carpeta completa." >&2
        exit 1
    fi
done

echo "== 0. Verificando que la Fase 0 ya este aplicada =="
ssh -i "$VM_KEY" "$VM_HOST" "test -f $REMOTE_DIR/reddit_monitor.db" || {
    echo "No encuentro reddit_monitor.db en la VM — corre primero upgrade_fase0.sh." >&2
    exit 1
}

echo "== 1. Instalando dependencias de ML (esto tarda varios minutos) =="
ssh -i "$VM_KEY" "$VM_HOST" "command -v pip3 >/dev/null 2>&1 || (sudo apt-get update -qq && sudo apt-get install -y python3-pip)"
scp -i "$VM_KEY" "$HERE/requirements-ml.txt" "$VM_HOST:$REMOTE_DIR/"
ssh -i "$VM_KEY" "$VM_HOST" "
    python3 -m pip install -r $REMOTE_DIR/requirements-ml.txt -q \$(python3 -m pip install --help | grep -q break-system-packages && echo --break-system-packages)
    python3 -m spacy download es_core_news_sm -q
    python3 -c \"import nltk; nltk.download('punkt', quiet=True)\"
"

echo "== 2. Copiando codigo nuevo (backup de monitor.py anterior) =="
ssh -i "$VM_KEY" "$VM_HOST" "cp $REMOTE_DIR/monitor.py $REMOTE_DIR/monitor.py.pre-fase06.bak"
scp -i "$VM_KEY" "$HERE/lexicon.py" "$HERE/semantic.py" "$HERE/monitor.py" \
    "$HERE/migrate_fase06_schema.py" "$HERE/review_sampling.py" \
    "$VM_HOST:$REMOTE_DIR/"

echo "== 3. Migrando el esquema (agrega columnas nuevas, idempotente) =="
ssh -i "$VM_KEY" "$VM_HOST" "cd $REMOTE_DIR && python3 migrate_fase06_schema.py ."

echo "== 4. Actualizando limite de memoria del servicio (ahora usa ~1.2GB con ML) =="
scp -i "$VM_KEY" "$HERE/reddit-monitor.service" "$VM_HOST:$REMOTE_DIR/"
ssh -i "$VM_KEY" "$VM_HOST" "
    sudo cp $REMOTE_DIR/reddit-monitor.service /etc/systemd/system/
    sudo systemctl daemon-reload
"

echo "== 5. Descargando el modelo de embeddings (primera vez, necesita red) =="
# HF_HUB_OFFLINE=0 explicito: semantic.py deja HF_HUB_OFFLINE=1 por defecto
# (para que corridas futuras no intenten pegarle a la red), pero esta
# PRIMERA descarga necesita salir a buscar los pesos del modelo una vez.
ssh -i "$VM_KEY" "$VM_HOST" "
    cd $REMOTE_DIR && HF_HUB_OFFLINE=0 python3 -c \"
from sentence_transformers import SentenceTransformer
SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
print('modelo descargado y cacheado OK')
\"
"

echo "== 6. Corrida de prueba con la capa semantica activa (ahora offline, usando el cache) =="
ssh -i "$VM_KEY" "$VM_HOST" "
    cd $REMOTE_DIR && python3 -c \"
import semantic
m, c = semantic.compute_margin('quiero invertir en algo seguro', semantic.DEFAULT_PROTOTYPES_INTENT, semantic.DEFAULT_PROTOTYPES_NOISE)
print(f'prueba semantic.py: margin={m:.4f} confidence={c:.3f}')
\"
"
ssh -i "$VM_KEY" "$VM_HOST" "sudo systemctl start reddit-monitor.service && sleep 2 && sudo journalctl -u reddit-monitor.service -n 30 --no-pager"

echo
echo "Fase 0.6 aplicada. Corre verify_fase06.sh para confirmar."
