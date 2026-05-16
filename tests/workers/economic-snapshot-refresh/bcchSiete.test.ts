import { describe, expect, it } from "vitest";
import {
  BCCH_SERIES,
  buildSiteUrl,
  parseBcchResponse,
  parseChileanDate,
  type BcchSeriesResponse,
} from "../../../workers/economic-snapshot-refresh/src/sources/bcchSiete";

// Real-shape fixture captured 2026-05-16 from the SiETE REST API.
const UF_SUCCESS: BcchSeriesResponse = {
  Codigo: 0,
  Descripcion: "Success",
  Series: {
    seriesId: BCCH_SERIES.UF,
    Obs: [
      { indexDateString: "12-05-2026", value: "40290.47", statusCode: "OK" },
      { indexDateString: "13-05-2026", value: "40307.26", statusCode: "OK" },
      { indexDateString: "14-05-2026", value: "40324.06", statusCode: "OK" },
      { indexDateString: "15-05-2026", value: "40340.86", statusCode: "OK" },
      { indexDateString: "16-05-2026", value: "40357.67", statusCode: "OK" },
    ],
  },
};

describe("parseChileanDate", () => {
  it("converts DD-MM-YYYY to YYYY-MM-DD", () => {
    expect(parseChileanDate("16-05-2026")).toBe("2026-05-16");
    expect(parseChileanDate("01-01-2025")).toBe("2025-01-01");
  });

  it("returns null for malformed input", () => {
    expect(parseChileanDate("2026-05-16")).toBeNull();
    expect(parseChileanDate("16/05/2026")).toBeNull();
    expect(parseChileanDate("")).toBeNull();
    expect(parseChileanDate(undefined)).toBeNull();
  });
});

describe("parseBcchResponse", () => {
  it("returns observations sorted ascending by ISO date", () => {
    const result = parseBcchResponse(UF_SUCCESS);
    expect(result).toEqual([
      { value: 40290.47, dateIso: "2026-05-12" },
      { value: 40307.26, dateIso: "2026-05-13" },
      { value: 40324.06, dateIso: "2026-05-14" },
      { value: 40340.86, dateIso: "2026-05-15" },
      { value: 40357.67, dateIso: "2026-05-16" },
    ]);
  });

  it("returns null when Codigo != 0 (auth or query error)", () => {
    const err: BcchSeriesResponse = {
      Codigo: -5,
      Descripcion: "Invalid username or password",
      Series: { seriesId: null, Obs: null },
    };
    expect(parseBcchResponse(err)).toBeNull();
  });

  it("returns null when Obs is empty or null", () => {
    expect(
      parseBcchResponse({
        Codigo: 0,
        Descripcion: "Success",
        Series: { seriesId: BCCH_SERIES.UF, Obs: [] },
      })
    ).toBeNull();
    expect(
      parseBcchResponse({
        Codigo: 0,
        Descripcion: "Success",
        Series: { seriesId: BCCH_SERIES.UF, Obs: null },
      })
    ).toBeNull();
  });

  it("filters out observations with non-OK statusCode", () => {
    const mixed: BcchSeriesResponse = {
      Codigo: 0,
      Descripcion: "Success",
      Series: {
        seriesId: BCCH_SERIES.UF,
        Obs: [
          { indexDateString: "14-05-2026", value: "40324.06", statusCode: "OK" },
          { indexDateString: "15-05-2026", value: "", statusCode: "ND" },
          { indexDateString: "16-05-2026", value: "40357.67", statusCode: "OK" },
        ],
      },
    };
    const result = parseBcchResponse(mixed);
    expect(result).toHaveLength(2);
    expect(result?.[0].dateIso).toBe("2026-05-14");
    expect(result?.[1].dateIso).toBe("2026-05-16");
  });

  it("filters out observations whose value is not a finite number", () => {
    const broken: BcchSeriesResponse = {
      Codigo: 0,
      Descripcion: "Success",
      Series: {
        seriesId: BCCH_SERIES.UF,
        Obs: [
          { indexDateString: "16-05-2026", value: "n/a", statusCode: "OK" },
          { indexDateString: "15-05-2026", value: "40340.86", statusCode: "OK" },
        ],
      },
    };
    const result = parseBcchResponse(broken);
    expect(result).toEqual([{ value: 40340.86, dateIso: "2026-05-15" }]);
  });
});

describe("buildSiteUrl", () => {
  it("constructs URL with query params and url-encodes the user", () => {
    const url = buildSiteUrl(
      { user: "user+tag@example.com", password: "p@ss w0rd" },
      {
        seriesId: BCCH_SERIES.UF,
        firstDateIso: "2026-05-12",
        lastDateIso: "2026-05-16",
      }
    );
    const parsed = new URL(url);
    expect(parsed.host).toBe("si3.bcentral.cl");
    expect(parsed.pathname).toBe("/SieteRestWS/SieteRestWS.ashx");
    expect(parsed.searchParams.get("user")).toBe("user+tag@example.com");
    expect(parsed.searchParams.get("pass")).toBe("p@ss w0rd");
    expect(parsed.searchParams.get("function")).toBe("GetSeries");
    expect(parsed.searchParams.get("timeseries")).toBe(BCCH_SERIES.UF);
    expect(parsed.searchParams.get("firstdate")).toBe("2026-05-12");
    expect(parsed.searchParams.get("lastdate")).toBe("2026-05-16");
  });
});
