import type {
  HistoricalUfInput,
  HistoricalUfResult,
} from "./LookupHistoricalUf";

const exampleLookup: Record<string, number> = {
  "2010-06-15": 21131.22,
};

export const ufHistoricoWorkedExample: {
  input: HistoricalUfInput;
  expected: HistoricalUfResult;
} = {
  input: {
    date: "2010-06-15",
    lookup: exampleLookup,
    firstAvailableDate: "2000-01-01",
    lastAvailableDate: "2026-07-09",
  },
  expected: {
    found: true,
    date: "2010-06-15",
    resolvedDate: "2010-06-15",
    value: 21131.22,
    isExactMatch: true,
  },
};
