import { useMemo, useState } from "react";

const S = {
  shell: {
    fontFamily: "'DM Mono', 'Courier New', monospace",
    background: "#0a0a0a",
    minHeight: "100vh",
    color: "#e5e5e5",
    padding: "2rem",
  },
  headerMeta: {
    fontSize: "0.7rem",
    color: "#6b7280",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "10px",
    padding: "0.85rem 1rem",
    color: "#f3f4f6",
    fontSize: "0.82rem",
    fontFamily: "inherit",
  },
  button: active => ({
    background: active ? "#0d9488" : "#111827",
    border: `1px solid ${active ? "#0d9488" : "#1f2937"}`,
    color: active ? "#ffffff" : "#9ca3af",
    borderRadius: "999px",
    padding: "0.5rem 0.8rem",
    fontSize: "0.72rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
  }),
  listCard: selected => ({
    border: `1px solid ${selected ? "#0d9488" : "#1f2937"}`,
    background: selected ? "#0f2b2a" : "#111827",
    borderRadius: "14px",
    padding: "0.95rem",
    cursor: "pointer",
    transition: "all 0.18s ease",
  }),
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    borderRadius: "999px",
    padding: "0.2rem 0.55rem",
    border: "1px solid #334155",
    color: "#cbd5e1",
    fontSize: "0.68rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  textarea: {
    width: "100%",
    minHeight: "20rem",
    background: "#030712",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "1rem",
    color: "#e5e7eb",
    fontSize: "0.78rem",
    lineHeight: 1.7,
    resize: "vertical",
    fontFamily: "inherit",
  },
  copyButton: copied => ({
    background: copied ? "#059669" : "#0d9488",
    border: `1px solid ${copied ? "#059669" : "#0d9488"}`,
    color: "#fff",
    borderRadius: "10px",
    padding: "0.8rem 1rem",
    fontSize: "0.76rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
  }),
  subtleButton: {
    background: "#111827",
    border: "1px solid #1f2937",
    color: "#d1d5db",
    borderRadius: "10px",
    padding: "0.8rem 1rem",
    fontSize: "0.76rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

function byPriority(a, b) {
  const aRank = a.batchPriority ?? "Z";
  const bRank = b.batchPriority ?? "Z";
  return aRank.localeCompare(bRank);
}

function formatPromptForChatGPTImages(entry) {
  return `${entry.prompt}

USE CASE: ${entry.title}
SLUG: ${entry.slug}
TARGET FILE: ${entry.targetImagePath}
VISUAL CONCEPT: ${entry.batchConcept}
WHY THIS IMAGE EXISTS: ${entry.batchWhyFirst}
PASS CUE: ${entry.batchPassCue}${
    entry.batchRevisionGoal
      ? `\nNEXT REVISION GOAL: ${entry.batchRevisionGoal}`
      : ""
  }${
    entry.batchObservedFailures?.length
      ? `\nOBSERVED FAILURE MODES TO AVOID:\n- ${entry.batchObservedFailures.join(
          "\n- "
        )}`
      : ""
  }`;
}

function InfoCard({ label, children }) {
  return (
    <section
      style={{
        border: "1px solid #1f2937",
        borderRadius: "14px",
        padding: "0.9rem",
      }}
    >
      <div style={S.headerMeta}>{label}</div>
      <p
        style={{
          margin: "0.45rem 0 0",
          lineHeight: 1.6,
          fontSize: "0.82rem",
          color: "#e5e7eb",
        }}
      >
        {children}
      </p>
    </section>
  );
}

export default function HeroPromptWorkspace({ entries }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("p0");
  const [selectedSlug, setSelectedSlug] = useState(entries[0]?.slug ?? "");
  const [copiedKind, setCopiedKind] = useState("");

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries
      .filter(entry => (mode === "p0" ? entry.inP0Batch : true))
      .filter(entry => {
        if (!normalized) return true;
        return [
          entry.title,
          entry.slug,
          entry.cluster,
          entry.category,
          entry.batchConcept,
          entry.batchSubgroup,
        ]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(normalized));
      })
      .sort((a, b) => {
        if (mode === "p0") return byPriority(a, b);
        return a.title.localeCompare(b.title);
      });
  }, [entries, mode, query]);

  const selectedEntry =
    filteredEntries.find(entry => entry.slug === selectedSlug) ??
    filteredEntries[0] ??
    entries[0];

  const promptForCopy = selectedEntry
    ? formatPromptForChatGPTImages(selectedEntry)
    : "";

  async function handleCopy(kind, value) {
    if (!value) return;
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
    } catch {
      window.prompt("Copia manualmente:", value);
    }
    setCopiedKind(kind);
    window.setTimeout(() => setCopiedKind(""), 1800);
  }

  return (
    <div style={S.shell}>
      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: #0d9488; color: #fff; }
        textarea:focus, input:focus { outline: 2px solid #0d9488; outline-offset: 1px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 999px; }
        @media (max-width: 960px) {
          .hero-prompt-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.8rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#0d9488",
            }}
          >
            monedario
          </span>
          <span style={S.headerMeta}>hero prompt workspace</span>
        </div>
        <p
          style={{
            margin: "0.45rem 0 0",
            color: "#9ca3af",
            fontSize: "0.88rem",
            maxWidth: "70rem",
          }}
        >
          Panel de trabajo para generar manualmente hero images en ChatGPT
          Images. Carga los prompts reales desde{" "}
          <code>scripts/hero-images/prompts.json</code> y prioriza el lote P0.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(20rem, 28rem) minmax(0, 1fr)",
          gap: "1.25rem",
          alignItems: "start",
        }}
        className="hero-prompt-grid"
      >
        <aside
          style={{
            border: "1px solid #1f2937",
            background: "#030712",
            borderRadius: "18px",
            padding: "1rem",
            position: "sticky",
            top: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.55rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              style={S.button(mode === "p0")}
              onClick={() => setMode("p0")}
            >
              Lote P0
            </button>
            <button
              type="button"
              style={S.button(mode === "all")}
              onClick={() => setMode("all")}
            >
              Todos
            </button>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar por slug, título o concepto..."
              style={S.input}
            />
          </div>

          <div
            style={{
              marginBottom: "0.9rem",
              color: "#6b7280",
              fontSize: "0.76rem",
            }}
          >
            {filteredEntries.length} prompt
            {filteredEntries.length === 1 ? "" : "s"} visibles
          </div>

          <div
            style={{
              display: "grid",
              gap: "0.8rem",
              maxHeight: "70vh",
              overflow: "auto",
              paddingRight: "0.2rem",
            }}
          >
            {filteredEntries.map(entry => {
              const selected = entry.slug === selectedEntry?.slug;
              return (
                <button
                  key={entry.slug}
                  type="button"
                  style={{ ...S.listCard(selected), textAlign: "left" }}
                  onClick={() => setSelectedSlug(entry.slug)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.8rem",
                      marginBottom: "0.6rem",
                    }}
                  >
                    <span style={S.badge}>
                      {entry.batchPriority ?? "Backlog"}
                    </span>
                    <span
                      style={{
                        ...S.badge,
                        color: "#93c5fd",
                        borderColor: "#1e3a8a",
                      }}
                    >
                      {entry.template}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.86rem",
                      lineHeight: 1.45,
                      color: "#f3f4f6",
                      marginBottom: "0.45rem",
                    }}
                  >
                    {entry.title}
                  </div>
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.73rem",
                      marginBottom: "0.45rem",
                    }}
                  >
                    {entry.slug}
                  </div>
                  <div
                    style={{
                      color: "#67e8f9",
                      fontSize: "0.72rem",
                      marginBottom: "0.45rem",
                    }}
                  >
                    {entry.batchSubgroup ?? entry.cluster}
                  </div>
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.74rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {entry.batchConcept}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main
          style={{
            border: "1px solid #1f2937",
            background: "#030712",
            borderRadius: "18px",
            padding: "1.2rem",
          }}
        >
          {selectedEntry ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.55rem",
                  marginBottom: "0.9rem",
                }}
              >
                <span style={S.badge}>
                  {selectedEntry.batchPriority ?? "Backlog"}
                </span>
                <span
                  style={{
                    ...S.badge,
                    color: "#93c5fd",
                    borderColor: "#1e3a8a",
                  }}
                >
                  {selectedEntry.template}
                </span>
                <span
                  style={{
                    ...S.badge,
                    color: "#fca5a5",
                    borderColor: "#7f1d1d",
                  }}
                >
                  {selectedEntry.palette.hex}
                </span>
                <span
                  style={{
                    ...S.badge,
                    color: "#a7f3d0",
                    borderColor: "#065f46",
                  }}
                >
                  {selectedEntry.batchSubgroup ?? selectedEntry.cluster}
                </span>
              </div>

              <h1
                style={{
                  margin: "0 0 0.4rem",
                  fontSize: "1.45rem",
                  lineHeight: 1.3,
                  fontFamily: "sans-serif",
                }}
              >
                {selectedEntry.title}
              </h1>
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "0.82rem",
                  marginBottom: "1rem",
                }}
              >
                <code>{selectedEntry.slug}</code> · {selectedEntry.category} ·{" "}
                {selectedEntry.sceneId}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
                  gap: "0.9rem",
                  marginBottom: "1rem",
                }}
              >
                <InfoCard label="Por qué va primero">
                  {selectedEntry.batchWhyFirst}
                </InfoCard>

                <InfoCard label="Concepto visual">
                  {selectedEntry.batchConcept}
                </InfoCard>

                <InfoCard label="Pass cue">
                  {selectedEntry.batchPassCue}
                </InfoCard>

                {selectedEntry.batchRevisionGoal ? (
                  <InfoCard label="Next revision goal">
                    {selectedEntry.batchRevisionGoal}
                  </InfoCard>
                ) : null}

                <InfoCard label="Target file">
                  <code>{selectedEntry.targetImagePath}</code>
                </InfoCard>
              </div>

              {selectedEntry.batchObservedFailures?.length ? (
                <section
                  style={{
                    border: "1px solid #3f1d1d",
                    background: "#140b0b",
                    borderRadius: "14px",
                    padding: "0.95rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div style={{ ...S.headerMeta, color: "#fca5a5" }}>
                    Observed failure modes to avoid
                  </div>
                  <ul
                    style={{
                      margin: "0.55rem 0 0",
                      paddingLeft: "1.1rem",
                      color: "#fecaca",
                      lineHeight: 1.7,
                      fontSize: "0.8rem",
                    }}
                  >
                    {selectedEntry.batchObservedFailures.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div
                style={{
                  marginBottom: "0.8rem",
                  display: "flex",
                  gap: "0.7rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  style={S.copyButton(copiedKind === "prompt")}
                  onClick={() => handleCopy("prompt", promptForCopy)}
                >
                  {copiedKind === "prompt"
                    ? "Prompt copiado"
                    : "Copiar prompt listo para ChatGPT Images"}
                </button>
                <button
                  type="button"
                  style={S.subtleButton}
                  onClick={() => handleCopy("slug", selectedEntry.slug)}
                >
                  {copiedKind === "slug" ? "Slug copiado" : "Copiar slug"}
                </button>
                <button
                  type="button"
                  style={S.subtleButton}
                  onClick={() =>
                    handleCopy("path", selectedEntry.targetImagePath)
                  }
                >
                  {copiedKind === "path"
                    ? "Path copiado"
                    : "Copiar target file"}
                </button>
              </div>

              <textarea readOnly value={promptForCopy} style={S.textarea} />
            </>
          ) : (
            <div style={{ color: "#9ca3af" }}>No hay prompts para mostrar.</div>
          )}
        </main>
      </div>
    </div>
  );
}
