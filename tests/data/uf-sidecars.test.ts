import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = join(fileURLToPath(import.meta.url), "../../..");
const HIST_DIR = join(ROOT, "src/data/economic-history");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function loadJson(filename: string): unknown {
  return JSON.parse(readFileSync(join(HIST_DIR, filename), "utf8"));
}

describe("uf sidecars", () => {
  it("uf-rango.json refleja los bordes de uf-historico.json", () => {
    const historico = loadJson("uf-historico.json") as {
      desdeFecha: string;
      hastaFecha: string;
      totalEntradas: number;
      serie: Array<{ fecha: string }>;
    };
    const rango = loadJson("uf-rango.json") as {
      first: string;
      last: string;
      count: number;
    };
    expect(rango.first).toBe(historico.serie[0]?.fecha);
    expect(rango.last).toBe(historico.serie[historico.serie.length - 1]?.fecha);
    expect(rango.count).toBe(historico.serie.length);
    expect(rango.first).toBe(historico.desdeFecha);
    expect(rango.last).toBe(historico.hastaFecha);
    expect(rango.count).toBe(historico.totalEntradas);
    expect(ISO_DATE.test(rango.first)).toBe(true);
    expect(ISO_DATE.test(rango.last)).toBe(true);
  });

  it("uf-mensual.json trae un punto por mes, ascendente y dentro del rango", () => {
    const historico = loadJson("uf-historico.json") as {
      serie: Array<{ fecha: string; valor: number }>;
    };
    const mensual = loadJson("uf-mensual.json") as {
      fuente: string;
      indicador: string;
      granularidad: string;
      count: number;
      puntos: Array<{ fecha: string; valor: number }>;
    };
    expect(mensual.fuente).toBe("mindicador.cl");
    expect(mensual.indicador).toBe("uf");
    expect(mensual.count).toBe(mensual.puntos.length);
    expect(mensual.puntos.length).toBeGreaterThan(60);

    const meses = mensual.puntos.map(p => p.fecha.slice(0, 7));
    expect(new Set(meses).size).toBe(meses.length);

    const fechas = mensual.puntos.map(p => p.fecha);
    for (let i = 1; i < fechas.length; i++) {
      expect(fechas[i] > fechas[i - 1]).toBe(true);
    }

    const porFecha = new Map(historico.serie.map(e => [e.fecha, e.valor]));
    for (const punto of mensual.puntos) {
      expect(ISO_DATE.test(punto.fecha)).toBe(true);
      // cada punto mensual existe en la serie diaria con el mismo valor
      expect(porFecha.get(punto.fecha)).toBe(punto.valor);
    }
  });
});
