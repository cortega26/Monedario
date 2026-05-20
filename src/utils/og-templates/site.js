/**
 * site.js — OG image para la home y páginas genéricas de Monedario
 *
 * Sistema visual v3 — mismo lenguaje que post.js (grid, glow, Inter).
 * Dimensiones: 1200×630 (OG 1.91:1). Safe area: 1134×596 px.
 */

import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

const W = 1200;
const H = 630;

// Paleta de la marca — teal oscuro, igual que categoría "empleo-ingresos"
const COLOR = {
  base: "#0c4a6e", // azul marino profundo, neutro y confiable
  dark: "#082f49",
  light: "#0ea5e9",
  accent: "#38bdf8",
  muted: "#7dd3fc",
};

function gridOverlay() {
  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: [
          `repeating-linear-gradient(0deg, transparent, transparent 39px, ${COLOR.dark}55 39px, ${COLOR.dark}55 40px)`,
          `repeating-linear-gradient(90deg, transparent, transparent 39px, ${COLOR.dark}55 39px, ${COLOR.dark}55 40px)`,
        ].join(", "),
        opacity: 0.12,
      },
    },
  };
}

function radialGlow() {
  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "800px",
        height: "800px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLOR.light}22 0%, transparent 65%)`,
      },
    },
  };
}

// Ícono de moneda (coin) — círculo con línea central, Lucide-compatible
function coinIcon(size, color = "#ffffff", opacity = 0.85) {
  return {
    type: "div",
    props: {
      style: {
        width: `${size}px`,
        height: `${size}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      },
      children: {
        type: "svg",
        props: {
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: color,
          strokeWidth: 1.5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            {
              type: "circle",
              props: { cx: 12, cy: 12, r: 10 },
            },
            {
              type: "path",
              props: {
                d: "M9.5 8.5C9.5 8.5 10 7 12 7s3 1.5 3 2.5c0 2-3 2.5-3 2.5s3.5.5 3.5 3c0 1.5-1.5 3-3.5 3s-3-1.5-3-1.5M12 5v2M12 17v2",
              },
            },
          ],
        },
      },
    },
  };
}

export default async () => {
  const textSample = SITE.title + SITE.desc + "monedario.cl";

  return satori(
    {
      type: "div",
      props: {
        style: {
          position: "relative",
          width: "100%",
          height: "100%",
          background: COLOR.base,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        children: [
          // Grid texture
          gridOverlay(),

          // Radial glow behind content
          radialGlow(),

          // Top accent bar
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: `linear-gradient(90deg, transparent, ${COLOR.accent}, transparent)`,
                opacity: 0.7,
              },
            },
          },

          // Main content — centered column
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0px",
                paddingLeft: "80px",
                paddingRight: "80px",
              },
              children: [
                // Coin icon
                coinIcon(72, "#ffffff", 0.7),

                // Brand name
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 120,
                      fontWeight: 900,
                      color: "#ffffff",
                      letterSpacing: "-4px",
                      lineHeight: 1,
                      marginTop: "16px",
                      opacity: 0.97,
                    },
                    children: SITE.title,
                  },
                },

                // Tagline
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 28,
                      fontWeight: 400,
                      color: COLOR.muted,
                      letterSpacing: "0.5px",
                      textAlign: "center",
                      maxWidth: "760px",
                      marginTop: "20px",
                      lineHeight: 1.4,
                      opacity: 0.88,
                    },
                    children: SITE.desc,
                  },
                },
              ],
            },
          },

          // Domain pill — bottom center
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "44px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.10)",
                borderRadius: "24px",
                paddingLeft: "32px",
                paddingRight: "32px",
                paddingTop: "12px",
                paddingBottom: "12px",
              },
              children: {
                type: "span",
                props: {
                  style: {
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 22,
                    fontWeight: 600,
                    color: COLOR.accent,
                    letterSpacing: "3px",
                    opacity: 0.9,
                  },
                  children: new URL(SITE.website).hostname,
                },
              },
            },
          },
        ],
      },
    },
    {
      width: W,
      height: H,
      embedFont: true,
      fonts: await loadGoogleFonts(textSample),
    }
  );
};
