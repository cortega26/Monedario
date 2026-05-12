export type UtmConversionDirection = "utm_to_clp" | "clp_to_utm";

export interface UtmConversionInput {
  amount: number;
  utmValue: number;
  direction: UtmConversionDirection;
}

export interface UtmConversionOutput {
  utmAmount: number;
  clpAmount: number;
}

function assertInput(input: UtmConversionInput): void {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("amount must be a finite number greater than 0.");
  }
  if (!Number.isFinite(input.utmValue) || input.utmValue <= 0) {
    throw new Error("utmValue must be a finite number greater than 0.");
  }
}

export function convertUtm(input: UtmConversionInput): UtmConversionOutput {
  assertInput(input);

  if (input.direction === "utm_to_clp") {
    return {
      utmAmount: input.amount,
      clpAmount: input.amount * input.utmValue,
    };
  }

  return {
    utmAmount: input.amount / input.utmValue,
    clpAmount: input.amount,
  };
}
