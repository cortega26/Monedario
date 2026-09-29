import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = join(fileURLToPath(import.meta.url), "../../..");
const HIST_DIR = join(ROOT, "src/data/economic-history");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface HistoricEntry {
  fecha: string;
  valor: number;
}

interface HistoricDataset {
  fuente: string;
  indicador: string;
  granularidad: "diaria" | "mensual";
  actualizadoEl: string;
  desdeFecha: string;
  hastaFecha: string;
  totalEntradas: number;
  nota: string;
  serie: HistoricEntry[];
}

function loadDataset(filename: string): HistoricDataset {
  const raw = readFileSync(join(HIST_DIR, filename), "utf8");
  return JSON.parse(raw) as HistoricDataset;
}

describe("economic-history datasets", () => {
  const datasets: Array<{ file: string; minEntries: number }> = [
    { file: "uf-historico.json",  minEntries: 9000 },
    { file: "utm-historico.json", minEntries: 300 },
    { file: "ipc-historico.json", minEntries: 290 },
  ];

  for (const { file, minEntries } of datasets) {
    describe(file, () => {
      const ds = loadDataset(file);

      it("tiene metadatos requeridos", () => {
        if (ds.indicador === "ipc") {
          // Histórico vía mindicador/INE + extensión oficial vía BCCh (TD-0112).
          expect(ds.fuente).toContain("mindicador.cl");
          expect(ds.fuente).toContain("Banco Central de Chile");
        } else {
          expect(ds.fuente).toBe("mindicador.cl");
        }
        expect(ds.indicador).toMatch(/^(uf|utm|ipc)$/);
        expect(["diaria", "mensual"]).toContain(ds.granularidad);
        expect(ISO_DATE.test(ds.actualizadoEl)).toBe(true);
        expect(ISO_DATE.test(ds.desdeFecha)).toBe(true);
        expect(ISO_DATE.test(ds.hastaFecha)).toBe(true);
        expect(ds.nota.length).toBeGreaterThan(10);
      });

      it(`tiene al menos ${minEntries} entradas`, () => {
        expect(ds.serie.length).toBeGreaterThanOrEqual(minEntries);
        expect(ds.totalEntradas).toBe(ds.serie.length);
      });

      it("todas las fechas son ISO YYYY-MM-DD válidas", () => {
        for (const entry of ds.serie) {
          expect(ISO_DATE.test(entry.fecha), `fecha inválida: ${entry.fecha}`).toBe(true);
        }
      });

      it("todos los valores son números finitos (IPC puede ser negativo)", () => {
        // IPC refleja variación mensual %; puede ser negativo (deflación).
        // UF y UTM son valores nominales siempre positivos.
        const mustBePositive = ds.indicador !== "ipc";
        for (const entry of ds.serie) {
          const finite = typeof entry.valor === "number" && isFinite(entry.valor);
          const sign = mustBePositive ? entry.valor > 0 : true;
          expect(
            finite && sign,
            `valor inválido en ${entry.fecha}: ${entry.valor}`
          ).toBe(true);
        }
      });

      it("fechas están en orden ascendente sin duplicados", () => {
        const fechas = ds.serie.map(e => e.fecha);
        for (let i = 1; i < fechas.length; i++) {
          expect(
            fechas[i] > fechas[i - 1],
            `orden roto o duplicado: ${fechas[i - 1]} → ${fechas[i]}`
          ).toBe(true);
        }
      });

      it("cubre desde el año 2000 o antes", () => {
        expect(ds.desdeFecha.slice(0, 4) <= "2000").toBe(true);
      });

      it("desdeFecha y hastaFecha coinciden con la serie", () => {
        expect(ds.desdeFecha).toBe(ds.serie[0]?.fecha);
        expect(ds.hastaFecha).toBe(ds.serie[ds.serie.length - 1]?.fecha);
      });
    });
  }
});
