import { describe, expect, it } from "vitest";
import {
  extendSeriesByDate,
  parseBcchIpcObservations,
} from "../../scripts/economic-history-ipc.mjs";

describe("parseBcchIpcObservations", () => {
  it("convierte DD-MM-YYYY a ISO y redondea a 1 decimal", () => {
    const observations = [
      {
        indexDateString: "01-08-2026",
        value: "0.621674909740094",
        statusCode: "OK",
      },
      {
        indexDateString: "01-04-2026",
        value: "1.28446301493614",
        statusCode: "OK",
      },
      {
        indexDateString: "01-02-2026",
        value: "-0.00946499530360256",
        statusCode: "OK",
      },
    ];
    expect(parseBcchIpcObservations(observations)).toEqual([
      { fecha: "2026-02-01", valor: 0 },
      { fecha: "2026-04-01", valor: 1.3 },
      { fecha: "2026-08-01", valor: 0.6 },
    ]);
  });

  it("ignora observaciones no-OK o malformadas", () => {
    const observations = [
      { indexDateString: "01-01-2026", value: "ND", statusCode: "OK" },
      { indexDateString: "01-02-2026", value: "0.5", statusCode: "SIN_DATO" },
      { indexDateString: "basura", value: "0.5", statusCode: "OK" },
      { indexDateString: "01-03-2026", value: "0.5", statusCode: "OK" },
    ];
    expect(parseBcchIpcObservations(observations)).toEqual([
      { fecha: "2026-03-01", valor: 0.5 },
    ]);
  });

  it("deduplica por fecha quedándose con el último valor", () => {
    const observations = [
      { indexDateString: "01-01-2026", value: "0.4", statusCode: "OK" },
      { indexDateString: "01-01-2026", value: "0.5", statusCode: "OK" },
    ];
    expect(parseBcchIpcObservations(observations)).toEqual([
      { fecha: "2026-01-01", valor: 0.5 },
    ]);
  });
});

describe("extendSeriesByDate", () => {
  it("agrega solo los meses faltantes y ordena", () => {
    const base = [
      { fecha: "2025-11-01", valor: 0.3 },
      { fecha: "2025-12-01", valor: -0.2 },
    ];
    const extension = [
      { fecha: "2025-12-01", valor: 9.9 },
      { fecha: "2026-01-01", valor: 0.4 },
      { fecha: "2026-02-01", valor: 0 },
    ];
    const { serie, added } = extendSeriesByDate(base, extension);
    expect(added).toBe(2);
    expect(serie).toEqual([
      { fecha: "2025-11-01", valor: 0.3 },
      { fecha: "2025-12-01", valor: -0.2 },
      { fecha: "2026-01-01", valor: 0.4 },
      { fecha: "2026-02-01", valor: 0 },
    ]);
  });

  it("no muta la serie base", () => {
    const base = [{ fecha: "2025-12-01", valor: -0.2 }];
    extendSeriesByDate(base, [{ fecha: "2026-01-01", valor: 0.4 }]);
    expect(base).toHaveLength(1);
  });
});
