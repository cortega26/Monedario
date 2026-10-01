import { describe, expect, it } from "vitest";
import {
  analyzeFinancialCsv,
  parseCsvRows,
  parseMoney,
} from "@/domain/privateFinance/analyzeFinancialCsv";

describe("private finance CSV analysis", () => {
  it("parses Chilean formatted money deterministically", () => {
    expect(parseMoney("$1.234.567")).toBe(1234567);
    expect(parseMoney("1.234,56")).toBe(1234.56);
    expect(parseMoney("-82.500")).toBe(-82500);
    expect(parseMoney("(15.990)")).toBe(-15990);
    expect(parseMoney("")).toBeNull();
    expect(parseMoney(".")).toBeNull();
    expect(parseMoney("1.234.56")).toBeNull();
    expect(parseMoney("12,34,567")).toBeNull();
    expect(parseMoney("999999999999999999999")).toBeNull();
  });

  it("parses quoted delimiters and escaped quotes", () => {
    expect(
      parseCsvRows('Fecha;Descripción;Cargo\n01-09-2026;"Café; \"\"Centro\"\"";12.500')
    ).toEqual([
      ["Fecha", "Descripción", "Cargo"],
      ["01-09-2026", 'Café; "Centro"', "12.500"],
    ]);
  });

  it("handles BOM, CRLF and tab-separated exports", () => {
    const csv = [
      "\uFEFFFecha\tDescripción\tCargo\tAbono",
      "2026-09-01\tSUELDO\t\t1500000",
      "2026-09-02\tUNIMARC\t55000\t",
    ].join("\r\n");

    const summary = analyzeFinancialCsv(csv);

    expect(summary.transactionCount).toBe(2);
    expect(summary.income).toBe(1500000);
    expect(summary.expenses).toBe(55000);
  });

  it("keeps quoted embedded newlines inside a field", () => {
    const rows = parseCsvRows(
      'Fecha;Descripción;Cargo\n2026-09-01;"Compra\nlocal";12.500'
    );

    expect(rows[1]).toEqual(["2026-09-01", "Compra\nlocal", "12.500"]);
  });

  it("summarizes separate debit and credit columns", () => {
    const csv = [
      "Fecha;Descripción;Cargo;Abono",
      "2026-09-01;SUELDO;;1850000",
      "2026-09-02;LIDER LA FLORIDA;84500;",
      "2026-09-03;COPEC MACUL;42000;",
      "2026-09-04;NETFLIX;8990;",
    ].join("\n");

    const summary = analyzeFinancialCsv(csv);

    expect(summary.transactionCount).toBe(4);
    expect(summary.income).toBe(1850000);
    expect(summary.expenses).toBe(135490);
    expect(summary.net).toBe(1714510);
    expect(summary.categories).toEqual([
      { category: "Supermercado", amount: 84500, transactionCount: 1 },
      { category: "Transporte", amount: 42000, transactionCount: 1 },
      { category: "Entretenimiento", amount: 8990, transactionCount: 1 },
    ]);
  });

  it("supports signed amount columns", () => {
    const csv = [
      "Date,Description,Amount",
      "2026-09-01,Sueldo,1500000",
      "2026-09-02,UNIMARC,-55000",
    ].join("\n");

    const summary = analyzeFinancialCsv(csv);

    expect(summary.income).toBe(1500000);
    expect(summary.expenses).toBe(55000);
  });

  it("uses movement type when an amount column is unsigned", () => {
    const csv = [
      "Fecha;Detalle;Monto;Tipo",
      "2026-09-01;Pago honorarios;900000;Abono",
      "2026-09-02;Farmacia Ahumada;23500;Cargo",
    ].join("\n");

    const summary = analyzeFinancialCsv(csv);

    expect(summary.income).toBe(900000);
    expect(summary.expenses).toBe(23500);
    expect(summary.categories[0]?.category).toBe("Salud");
  });

  it("rejects malformed CSV with an unclosed quote", () => {
    expect(() =>
      parseCsvRows('Fecha;Descripción;Cargo\n2026-09-01;"Compra;12500')
    ).toThrow(/comilla sin cerrar/i);
  });

  it("fails closed when an explicit movement type is unknown", () => {
    expect(() =>
      analyzeFinancialCsv(
        [
          "Fecha;Descripción;Monto;Tipo",
          "2026-09-01;Movimiento ambiguo;50000;XYZ",
        ].join("\n")
      )
    ).toThrow(/no pude interpretar el tipo de movimiento/i);
  });

  it("fails closed when cargo and abono are both populated", () => {
    expect(() =>
      analyzeFinancialCsv(
        [
          "Fecha;Descripción;Cargo;Abono",
          "2026-09-01;Fila imposible;10000;20000",
        ].join("\n")
      )
    ).toThrow(/cargo y abono simultáneos/i);
  });

  it("fails closed on a non-empty unparseable financial value", () => {
    expect(() =>
      analyzeFinancialCsv(
        [
          "Fecha;Descripción;Cargo;Abono",
          "2026-09-01;Dato corrupto;NO_ES_MONTO;",
        ].join("\n")
      )
    ).toThrow(/no pude interpretar el valor/i);
  });

  it("fails closed when a negative amount contradicts an explicit income type", () => {
    expect(() =>
      analyzeFinancialCsv(
        [
          "Fecha;Descripción;Monto;Tipo",
          "2026-09-01;Contradicción;-50000;Abono",
        ].join("\n")
      )
    ).toThrow(/monto negativo marcado como ingreso/i);
  });

  it("fails closed on duplicate semantic amount columns", () => {
    expect(() =>
      analyzeFinancialCsv(
        [
          "Fecha;Descripción;Monto;Importe",
          "2026-09-01;Ambiguo;-1000;-1000",
        ].join("\n")
      )
    ).toThrow(/más de una columna compatible con monto/i);
  });

  it("fails closed when a positive-only amount column has no direction", () => {
    expect(() =>
      analyzeFinancialCsv(
        [
          "Fecha;Descripción;Monto",
          "2026-09-01;Supermercado;50000",
          "2026-09-02;Sueldo;1500000",
        ].join("\n")
      )
    ).toThrow(/no indica qué movimientos son cargos/i);
  });

  it("fails closed when it cannot identify financial amount columns", () => {
    expect(() =>
      analyzeFinancialCsv("Fecha;Descripción\n2026-09-01;Sin monto")
    ).toThrow(/detectar una columna de monto/i);
  });
});
