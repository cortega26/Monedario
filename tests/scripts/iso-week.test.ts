import { describe, expect, it } from "vitest";
import {
  dateToIsoWeek,
  isoWeekToMonday,
  isoWeekWindow,
  weekLabelToDateRange,
} from "../../scripts/lib/iso-week.mjs";

describe("isoWeekWindow (Jan-4)", () => {
  it("W01 cae en el año anterior cuando el lunes está en diciembre", () => {
    expect(isoWeekWindow("2025-W01")).toEqual({
      from: "2024-12-30",
      to: "2025-01-05",
    });
    expect(isoWeekWindow("2026-W01")).toEqual({
      from: "2025-12-29",
      to: "2026-01-04",
    });
  });

  it("W01 en año normal arranca el 4 de enero", () => {
    expect(isoWeekWindow("2027-W01")).toEqual({
      from: "2027-01-04",
      to: "2027-01-10",
    });
  });

  it("2026 SÍ tiene W53 (el 31-dic-2026 es jueves) — rango real", () => {
    expect(isoWeekWindow("2026-W53")).toEqual({
      from: "2026-12-28",
      to: "2027-01-03",
    });
  });

  it("devuelve null para labels malformados (comportamiento real)", () => {
    expect(isoWeekWindow("garbage")).toBeNull();
    expect(isoWeekWindow("2026-W1")).toBeNull();
  });

  it("NO valida semanas >53 (quirk preexistente: extrapola el rango)", () => {
    expect(isoWeekWindow("2026-W99")).toEqual({
      from: "2027-11-15",
      to: "2027-11-21",
    });
  });
});

describe("dateToIsoWeek (corrección del jueves)", () => {
  it("asigna el ISO-year por el jueves de la semana", () => {
    expect(dateToIsoWeek(new Date("2026-01-01T00:00:00Z"))).toBe("2026-W01");
    // 31-dic-2025 es miércoles: su semana pertenece al ISO-year 2026.
    expect(dateToIsoWeek(new Date("2025-12-31T00:00:00Z"))).toBe("2026-W01");
    // 3-ene-2027 es domingo: su semana es la W53 de 2026.
    expect(dateToIsoWeek(new Date("2027-01-03T00:00:00Z"))).toBe("2026-W53");
  });
});

describe("weekLabelToDateRange", () => {
  it("incluye la semana previa, cruzando el año", () => {
    expect(weekLabelToDateRange("2025-W01")).toEqual({
      currentStart: "2024-12-30",
      currentEnd: "2025-01-05",
      previousStart: "2024-12-23",
      previousEnd: "2024-12-29",
    });
  });

  it("isoWeekToMonday es consistente con el rango", () => {
    expect(isoWeekToMonday(2026, 1).toISOString().slice(0, 10)).toBe(
      "2025-12-29"
    );
  });
});
