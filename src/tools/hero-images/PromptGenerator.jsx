import { useState, useMemo } from "react";
import {
  COLORS,
  SCENE_LIBRARY,
  getAllScenes,
  buildPromptFromScene,
  buildPromptA,
  buildPromptB,
  buildPromptC,
  lightenHex,
  darkenHex,
} from "./config.mjs";

// ─── Estilos base ─────────────────────────────────────────────────────────────

const S = {
  label: {
    fontSize: "0.62rem",
    color: "#555",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "0.45rem",
  },
  input: {
    width: "100%",
    background: "#141414",
    border: "1px solid #252525",
    borderRadius: "4px",
    padding: "0.5rem 0.7rem",
    color: "#e5e5e5",
    fontSize: "0.72rem",
    fontFamily: "inherit",
  },
  textarea: active => ({
    width: "100%",
    background: "#141414",
    border: `1px solid ${active ? "#0d9488" : "#252525"}`,
    borderRadius: "4px",
    padding: "0.75rem",
    color: active ? "#e5e5e5" : "#555",
    fontSize: "0.72rem",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.65,
    transition: "border-color 0.2s",
  }),
  chip: selected => ({
    background: selected ? "#0d948820" : "#141414",
    border: `1px solid ${selected ? "#0d9488" : "#252525"}`,
    borderRadius: "3px",
    padding: "0.3rem 0.6rem",
    fontSize: "0.65rem",
    color: selected ? "#0d9488" : "#666",
    cursor: "pointer",
    transition: "all 0.12s",
    whiteSpace: "nowrap",
  }),
  btn: (ready, copied) => ({
    background: copied ? "#059669" : ready ? "#0d9488" : "#141414",
    border: `1px solid ${copied ? "#059669" : ready ? "#0d9488" : "#252525"}`,
    borderRadius: "4px",
    padding: "0.75rem",
    color: ready || copied ? "#fff" : "#444",
    fontSize: "0.73rem",
    cursor: ready ? "pointer" : "not-allowed",
    transition: "all 0.2s",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    width: "100%",
  }),
  section: { marginBottom: "1.4rem" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PromptGenerator() {
  // Mode: "library" usa escenas canónicas | "custom" modo libre
  const [mode, setMode] = useState("library");

  // Library mode
  const [selectedCluster, setSelectedCluster] = useState(
    Object.keys(SCENE_LIBRARY)[0]
  );
  const [selectedScene, setSelectedScene] = useState(null);

  // Custom mode
  const [template, setTemplate] = useState("A");
  const [colorKey, setColorKey] = useState(Object.keys(COLORS)[0]);
  const [escena, setEscena] = useState("");
  const [icono, setIcono] = useState("");
  const [patron, setPatron] = useState("");
  const [nota, setNota] = useState("");

  // Shared
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Derivaciones ──

  const prompt = useMemo(() => {
    try {
      if (mode === "library" && selectedScene) {
        return buildPromptFromScene(selectedScene);
      }
      if (mode === "custom") {
        if (template === "A")
          return buildPromptA(
            colorKey,
            escena || "[describe the main visual metaphor]",
            nota
          );
        if (template === "B")
          return buildPromptB(colorKey, icono || "[icon name]", nota);
        if (template === "C")
          return buildPromptC(
            colorKey,
            patron || "subtle geometric grid",
            nota
          );
      }
      return "";
    } catch (e) {
      return `Error: ${e.message}`;
    }
  }, [mode, selectedScene, template, colorKey, escena, icono, patron, nota]);

  const ready = useMemo(() => {
    if (mode === "library") return !!selectedScene;
    if (template === "A") return escena.trim().length > 10;
    if (template === "B") return icono.trim().length > 3;
    return true; // C siempre listo
  }, [mode, selectedScene, template, escena, icono]);

  const activeColor =
    mode === "library" && selectedScene
      ? COLORS[selectedScene.colorKey]
      : COLORS[colorKey];

  // ── Acciones ──

  async function handleCopy() {
    if (!ready) return;
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const el = document.createElement("textarea");
      el.value = prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  function handleSelectScene(scene) {
    setSelectedScene(scene);
    setSlug(scene.slug);
  }

  // ── Render ──

  return (
    <div
      style={{
        fontFamily: "'DM Mono', 'Courier New', monospace",
        background: "#0a0a0a",
        minHeight: "100vh",
        color: "#e5e5e5",
        padding: "2rem",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: #0d9488; color: #fff; }
        textarea:focus, input:focus { outline: 2px solid #0d9488; outline-offset: 1px; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#0d9488",
            }}
          >
            monedario
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              color: "#444",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            visual system · image prompt generator
          </span>
        </div>
        <p
          style={{ fontSize: "0.68rem", color: "#444", margin: "0.25rem 0 0" }}
        >
          ChatGPT Images / Nano Banana Pro compatible · Scandinavian editorial
          flat style
        </p>
      </div>

      {/* Mode switcher */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.75rem" }}>
        {[
          {
            id: "library",
            label: "Biblioteca canónica",
            desc: "Escenas pre-aprobadas por slug",
          },
          {
            id: "custom",
            label: "Modo libre",
            desc: "Construye tu propio prompt",
          },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              background: mode === m.id ? "#0d9488" : "#141414",
              border: `1px solid ${mode === m.id ? "#0d9488" : "#252525"}`,
              borderRadius: "5px",
              padding: "0.6rem 1rem",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: mode === m.id ? "#fff" : "#888",
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontSize: "0.6rem",
                color: mode === m.id ? "rgba(255,255,255,0.6)" : "#444",
                marginTop: "0.1rem",
              }}
            >
              {m.desc}
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.1fr",
          gap: "1.75rem",
          maxWidth: "1200px",
        }}
      >
        {/* LEFT: Controles */}
        <div>
          {/* ── LIBRARY MODE ── */}
          {mode === "library" && (
            <>
              {/* Cluster selector */}
              <div style={S.section}>
                <label style={S.label}>Sección del sitio</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  {Object.keys(SCENE_LIBRARY).map(cluster => (
                    <button
                      key={cluster}
                      onClick={() => {
                        setSelectedCluster(cluster);
                        setSelectedScene(null);
                      }}
                      style={{
                        background:
                          selectedCluster === cluster
                            ? "#1a1a1a"
                            : "transparent",
                        border: `1px solid ${selectedCluster === cluster ? "#2a2a2a" : "transparent"}`,
                        borderRadius: "4px",
                        padding: "0.35rem 0.65rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.1s",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color:
                            selectedCluster === cluster ? "#e5e5e5" : "#555",
                        }}
                      >
                        {cluster}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "#333",
                          marginLeft: "0.5rem",
                        }}
                      >
                        {SCENE_LIBRARY[cluster].length} escenas
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scene picker */}
              <div style={S.section}>
                <label style={S.label}>Artículo / escena</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  {SCENE_LIBRARY[selectedCluster]?.map(scene => {
                    const c = COLORS[scene.colorKey];
                    const isSelected = selectedScene?.slug === scene.slug;
                    return (
                      <button
                        key={scene.slug}
                        onClick={() => handleSelectScene(scene)}
                        style={{
                          background: isSelected ? "#1a1a1a" : "transparent",
                          border: `1px solid ${isSelected ? "#0d9488" : "#1e1e1e"}`,
                          borderRadius: "5px",
                          padding: "0.6rem 0.75rem",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.12s",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: c?.hex,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: isSelected ? "#e5e5e5" : "#777",
                            }}
                          >
                            {scene.label}
                          </div>
                          <div
                            style={{
                              fontSize: "0.6rem",
                              color: "#444",
                              marginTop: "0.1rem",
                              fontFamily: "monospace",
                            }}
                          >
                            {scene.slug}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: "#333",
                            background: "#141414",
                            borderRadius: "2px",
                            padding: "0.1rem 0.35rem",
                          }}
                        >
                          T{scene.template}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Art direction preview */}
              {selectedScene && (
                <div
                  style={{
                    background: "#111",
                    border: "1px solid #1e1e1e",
                    borderRadius: "5px",
                    padding: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: "#555",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Art direction note
                  </div>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      color: "#888",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedScene.nota}
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── CUSTOM MODE ── */}
          {mode === "custom" && (
            <>
              {/* Template */}
              <div style={S.section}>
                <label style={S.label}>Template</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "0.4rem",
                  }}
                >
                  {[
                    {
                      id: "A",
                      name: "Escena",
                      desc: "Metáfora visual con contexto",
                    },
                    { id: "B", name: "Ícono", desc: "Un elemento central" },
                    {
                      id: "C",
                      name: "Fondo",
                      desc: "Para superposición de texto",
                    },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      style={{
                        background: template === t.id ? "#0d9488" : "#141414",
                        border: `1px solid ${template === t.id ? "#0d9488" : "#252525"}`,
                        borderRadius: "4px",
                        padding: "0.55rem",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: template === t.id ? "#fff" : "#777",
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.58rem",
                          color:
                            template === t.id
                              ? "rgba(255,255,255,0.6)"
                              : "#444",
                          marginTop: "0.1rem",
                        }}
                      >
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div style={S.section}>
                <label style={S.label}>Color → categoría editorial</label>
                {Object.entries(COLORS).map(([key, c]) => (
                  <button
                    key={key}
                    onClick={() => setColorKey(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      background: colorKey === key ? "#141414" : "transparent",
                      border: `1px solid ${colorKey === key ? "#252525" : "transparent"}`,
                      borderRadius: "4px",
                      padding: "0.35rem 0.6rem",
                      cursor: "pointer",
                      width: "100%",
                      marginBottom: "0.2rem",
                    }}
                  >
                    <span
                      style={{
                        width: "9px",
                        height: "9px",
                        borderRadius: "50%",
                        background: c.hex,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: colorKey === key ? "#e5e5e5" : "#555",
                        flex: 1,
                        textAlign: "left",
                      }}
                    >
                      {c.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.58rem",
                        color: "#333",
                        fontFamily: "monospace",
                      }}
                    >
                      {c.hex}
                    </span>
                  </button>
                ))}
                <div
                  style={{
                    fontSize: "0.6rem",
                    color: "#444",
                    marginTop: "0.35rem",
                    padding: "0 0.6rem",
                  }}
                >
                  Uso sugerido: {COLORS[colorKey]?.uso}
                </div>
              </div>

              {/* Campo principal según template */}
              <div style={S.section}>
                {template === "A" && (
                  <>
                    <label style={S.label}>Escena / metáfora visual</label>
                    <textarea
                      value={escena}
                      onChange={e => setEscena(e.target.value)}
                      rows={4}
                      placeholder="Describe el elemento visual principal como si se lo dijeras a un ilustrador. Ej: a clean document sheet with three horizontal lines representing salary items, with a bold downward arrow below indicating the final net amount"
                      style={S.textarea(escena.length > 10)}
                    />
                  </>
                )}
                {template === "B" && (
                  <>
                    <label style={S.label}>Ícono central</label>
                    <textarea
                      value={icono}
                      onChange={e => setIcono(e.target.value)}
                      rows={2}
                      placeholder="Ej: shield with checkmark inside"
                      style={S.textarea(icono.length > 3)}
                    />
                  </>
                )}
                {template === "C" && (
                  <>
                    <label style={S.label}>Patrón de fondo (opcional)</label>
                    <textarea
                      value={patron}
                      onChange={e => setPatron(e.target.value)}
                      rows={2}
                      placeholder="Ej: subtle geometric grid (default)"
                      style={S.textarea(true)}
                    />
                  </>
                )}
              </div>

              {/* Nota de art direction */}
              <div style={S.section}>
                <label style={S.label}>Nota de art direction (opcional)</label>
                <textarea
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  rows={2}
                  placeholder="Ej: The document is the hero, arrow is secondary. Conveys deductions leading to a final number."
                  style={S.textarea(false)}
                />
              </div>
            </>
          )}

          {/* Slug field — siempre visible */}
          <div style={S.section}>
            <label style={S.label}>Slug del artículo → nombre de archivo</label>
            <input
              value={slug}
              onChange={e =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              placeholder="fraude-tarjeta-que-hacer"
              style={S.input}
            />
            {slug && (
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#0d9488",
                  marginTop: "0.35rem",
                  fontFamily: "monospace",
                  padding: "0 0.1rem",
                }}
              >
                → /images/hero/{slug}.avif
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Color swatch */}
          {activeColor && (
            <div
              style={{
                borderRadius: "5px",
                overflow: "hidden",
                border: "1px solid #1e1e1e",
              }}
            >
              <div style={{ display: "flex", height: "32px" }}>
                {[
                  activeColor.hex,
                  activeColor.figura,
                  activeColor.acento,
                  darkenHex(activeColor.hex, 0.3),
                ].map((c, i) => (
                  <div key={i} style={{ flex: 1, background: c }} />
                ))}
              </div>
              <div
                style={{
                  background: "#111",
                  padding: "0.25rem 0.6rem",
                  display: "flex",
                  gap: "1rem",
                }}
              >
                {[
                  ["bg", activeColor.hex],
                  ["figura", activeColor.figura],
                  ["acento", activeColor.acento],
                  ["detalle", activeColor.detalle],
                ].map(([label, c]) => (
                  <span
                    key={label}
                    style={{
                      fontSize: "0.58rem",
                      color: "#444",
                      fontFamily: "monospace",
                    }}
                  >
                    <span style={{ color: "#666" }}>{label}</span> {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spec strip */}
          <div
            style={{
              background: "#111",
              border: "1px solid #1e1e1e",
              borderRadius: "4px",
              padding: "0.4rem 0.7rem",
              display: "flex",
              gap: "1.5rem",
            }}
          >
            {[
              ["Formato", "1792 × 1024 px"],
              ["Ratio", "16:9 landscape"],
              ["Calidad", "HD"],
              ["Target", "ChatGPT Images / Nano Banana"],
            ].map(([label, val]) => (
              <span
                key={label}
                style={{ fontSize: "0.6rem", fontFamily: "monospace" }}
              >
                <span style={{ color: "#444" }}>{label}: </span>
                <span style={{ color: "#777" }}>{val}</span>
              </span>
            ))}
          </div>

          {/* Prompt textarea */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.4rem",
              }}
            >
              <label style={S.label}>Prompt generado</label>
              {ready && (
                <span style={{ fontSize: "0.6rem", color: "#0d9488" }}>
                  {prompt.split(" ").length} palabras
                </span>
              )}
            </div>
            <textarea
              readOnly
              value={
                ready ? prompt : "← Completa los campos para generar el prompt"
              }
              rows={18}
              style={S.textarea(ready)}
            />
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={!ready}
            style={S.btn(ready, copied)}
          >
            {copied
              ? "✓ Copiado al clipboard"
              : ready
                ? "Copiar prompt"
                : "Completa los campos"}
          </button>

          {/* Post-processing reminder */}
          {ready && (
            <div
              style={{
                background: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: "4px",
                padding: "0.6rem 0.75rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#555",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "0.3rem",
                }}
              >
                Post-producción
              </div>
              <div
                style={{ fontSize: "0.65rem", color: "#444", lineHeight: 1.6 }}
              >
                1. Generar en 1792×1024 HD
                <br />
                2. Convertir a .avif (Squoosh / ffmpeg)
                <br />
                {slug && (
                  <>
                    3. Guardar como{" "}
                    <span style={{ color: "#777", fontFamily: "monospace" }}>
                      /images/hero/{slug}.avif
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
