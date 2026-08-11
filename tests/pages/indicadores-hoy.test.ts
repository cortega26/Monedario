import { describe, expect, it } from "vitest";
import {
  buildDelta,
  buildTitle,
  fmtClp,
  fmtDelta,
  fmtDiaMesCorto,
  fmtMesCorto,
} from "@/pages/api/indicadores-hoy.json";

const PREV = { valor: 100, fecha: "2026-08-01" };

describe("indicadores-hoy formateadores", () => {
  it("formatea CLP con redondeo y separadores es-CL", () => {
    expect(fmtClp(1234.5, 0)).toBe("$1.235");
    expect(fmtClp(1234.56, 2)).toBe("$1.234,56");
    expect(fmtClp(0, 0)).toBe("$0");
  });

  it("calcula el delta porcentual sin signo manual (es-CL)", () => {
    expect(fmtDelta(110, 100)).toBe("10");
    expect(fmtDelta(90, 100)).toBe("-10");
  });

  it("construye el delta con flecha, porcentaje y referencia de fecha", () => {
    expect(buildDelta(110, PREV, fmtDiaMesCorto)).toEqual({
      text: "▲ 10% vs. 1 AGO",
      direction: "up",
    });
    expect(buildDelta(90, PREV, fmtDiaMesCorto)).toEqual({
      text: "▼ -10% vs. 1 AGO",
      direction: "down",
    });
  });

  it("devuelve null sin prev (sin crash en el null-branch)", () => {
    expect(buildDelta(110, undefined, fmtDiaMesCorto)).toBeNull();
  });

  it("resuelve el título según indicador, fuente y descripción", () => {
    expect(buildTitle("uf", "primary", "desc")).toBe(
      "Banco Central de Chile — desc"
    );
    expect(buildTitle("utm", "primary", "desc")).toBe("SII — desc");
    expect(buildTitle("uf", "fallback", "desc")).toBe(
      "Valor de referencia aproximado"
    );
    expect(buildTitle("ipc", "primary", "desc")).toBe("Fuente oficial — desc");
  });

  it("formatea fechas cortas con índice seguro de mes", () => {
    expect(fmtDiaMesCorto("2026-08-01")).toBe("1 AGO");
    expect(fmtMesCorto("2026-08-01")).toBe("AGO");
    expect(fmtDiaMesCorto("2026-13-05")).toBe("5 ");
  });
});
