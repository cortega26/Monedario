#!/usr/bin/env bash
# 02_install_llama_cpp.sh — compila llama.cpp (solo CPU) DENTRO de tu HOME. No usa sudo.
# Instala cmake+ninja en un venv privado (~/.local/share/llama-build/venv), clona un tag
# de llama.cpp en ~/llama.cpp y compila llama-server, llama-cli y llama-bench.
# No toca servicios, no abre puertos, no usa credenciales.
# Uso:   bash "Claude outputs/02_install_llama_cpp.sh"
# Resultado (lo leo yo): install_llama_result.txt e install_llama_build.log junto a este script.
# Opcional: LLAMA_TAG=bNNNN (por defecto, el tag mas reciente), JOBS=N, LLAMA_DIR=..., TOOLS_DIR=...
set -euo pipefail
export LC_ALL=C

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULT="$OUT_DIR/install_llama_result.txt"
BUILD_LOG="$OUT_DIR/install_llama_build.log"
: > "$RESULT"; : > "$BUILD_LOG"
exec > >(tee -a "$RESULT") 2>&1

LLAMA_DIR="${LLAMA_DIR:-$HOME/llama.cpp}"
TOOLS_DIR="${TOOLS_DIR:-$HOME/.local/share/llama-build}"
NPROC="$(nproc)"
JOBS="${JOBS:-$(( NPROC > 4 ? NPROC - 4 : 1 ))}"   # deja margen: la maquina ya esta cargada

step() { printf '\n== %s ==\n' "$1"; }
fail() { echo "ERROR: $*"; echo "(detalle en $BUILD_LOG)"; exit 1; }

step "Comprobaciones previas"
for t in git gcc g++ make python3; do command -v "$t" >/dev/null 2>&1 || fail "falta $t"; done
avail_kb="$(df -Pk "$HOME" | awk 'NR==2{print $4}')"
[ "$avail_kb" -ge $((5*1024*1024)) ] || fail "menos de 5 GB libres en $HOME"
echo "disco libre en HOME: $((avail_kb/1024/1024)) GB | hilos de compilacion: $JOBS de $NPROC"

step "cmake y ninja en un venv dentro de tu HOME"
if [ ! -x "$TOOLS_DIR/venv/bin/cmake" ]; then
  python3 -m venv "$TOOLS_DIR/venv" >>"$BUILD_LOG" 2>&1 || fail "no pude crear el venv"
  "$TOOLS_DIR/venv/bin/pip" install --quiet cmake ninja >>"$BUILD_LOG" 2>&1 || fail "pip no pudo instalar cmake/ninja"
fi
export PATH="$TOOLS_DIR/venv/bin:$PATH"
cmake --version | head -1
echo "ninja $(ninja --version)"

step "Version de llama.cpp"
if [ -z "${LLAMA_TAG:-}" ]; then
  LLAMA_TAG="$(git ls-remote --tags --refs https://github.com/ggml-org/llama.cpp.git 'b[0-9]*' 2>>"$BUILD_LOG" \
               | awk -F/ '{print $NF}' | sort -V | tail -1)"
fi
[ -n "$LLAMA_TAG" ] || fail "no pude resolver el tag mas reciente; reintenta con LLAMA_TAG=bNNNN"
echo "tag: $LLAMA_TAG"

if [ -d "$LLAMA_DIR/.git" ]; then
  git -C "$LLAMA_DIR" fetch --quiet --depth 1 origin "refs/tags/$LLAMA_TAG:refs/tags/$LLAMA_TAG" >>"$BUILD_LOG" 2>&1 || fail "git fetch fallo"
  git -C "$LLAMA_DIR" checkout --quiet "refs/tags/$LLAMA_TAG" >>"$BUILD_LOG" 2>&1 || fail "git checkout fallo"
else
  git clone --quiet --depth 1 --branch "$LLAMA_TAG" https://github.com/ggml-org/llama.cpp.git "$LLAMA_DIR" >>"$BUILD_LOG" 2>&1 || fail "git clone fallo"
fi
echo "commit: $(git -C "$LLAMA_DIR" rev-parse --short HEAD)  en $LLAMA_DIR"

step "Configurar (CPU nativa, sin GPU)"
cd "$LLAMA_DIR"
COMMON=(-S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DGGML_NATIVE=ON
        -DGGML_CUDA=OFF -DGGML_VULKAN=OFF -DGGML_SYCL=OFF)
if ! cmake "${COMMON[@]}" >>"$BUILD_LOG" 2>&1; then
  echo "la configuracion por defecto fallo; reintento con -DLLAMA_CURL=OFF (no necesito descargar desde llama-server)"
  rm -rf build
  cmake "${COMMON[@]}" -DLLAMA_CURL=OFF >>"$BUILD_LOG" 2>&1 || { tail -30 "$BUILD_LOG"; fail "cmake no pudo configurar"; }
fi
echo "configurado"

step "Compilar (nice 10)"
start="$(date +%s)"
if ! nice -n 10 cmake --build build -j"$JOBS" --target llama-server llama-cli llama-bench >>"$BUILD_LOG" 2>&1; then
  echo "los objetivos especificos fallaron; compilo todo"
  nice -n 10 cmake --build build -j"$JOBS" >>"$BUILD_LOG" 2>&1 || { tail -40 "$BUILD_LOG"; fail "la compilacion fallo"; }
fi
echo "compilado en $(( $(date +%s) - start )) s"

step "Verificacion"
BIN="$LLAMA_DIR/build/bin"
for b in llama-server llama-cli llama-bench; do
  [ -x "$BIN/$b" ] && ls -la "$BIN/$b" || echo "AVISO: no existe $BIN/$b"
done
echo "-- version:"
"$BIN/llama-server" --version 2>&1 | head -5
echo "-- librerias sin resolver (debe quedar vacio):"
ldd "$BIN/llama-server" 2>&1 | grep 'not found' || echo "(ninguna)"
echo "-- flags relevantes de 'llama-server --help':"
"$BIN/llama-server" --help 2>&1 | grep -E -- '--(host|port|api-key|api-key-file|jinja|ctx-size|parallel|cache-reuse|threads|threads-batch|flash-attn|mlock|no-mmap|chat-template-kwargs|reasoning|reasoning-budget|no-webui|metrics)\b' | head -40
echo "-- uso de disco: $(du -sh "$LLAMA_DIR" | cut -f1) en $LLAMA_DIR | libre en HOME: $(df -h "$HOME" | awk 'NR==2{print $4}')"

step "Fin"
echo "OK. Binarios en: $BIN"
