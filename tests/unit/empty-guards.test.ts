// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateInflationAdjustment } from "@/application/use-cases/CalculateInflationAdjustment";
import {
  renderAfpComparison,
  renderAfpComparisonInverso,
} from "@/utils/sueldo-liquido/afpComparison";

const params = { uf: 39000, utm: 68000, imm: 500000 };

function seedAfpDom(optionCount: number): void {
  const options = Array.from(
    { length: optionCount },
    (_, i) =>
      `<option data-commission="${10 + i}" ${i === 0 ? "selected" : ""}>AFP${i} – ${(10 + i).toFixed(2)}%</option>`
  ).join("");
  document.body.innerHTML = `
    <section id="afp-comparison" class="hidden">
      <h3 id="afp-comparison-heading"></h3>
      <p id="afp-comparison-subheading"></p>
      <div id="afp-comparison-body"></div>
    </section>
    <select id="afp-tasa">${options}</select>
  `;
  const select = document.getElementById("afp-tasa") as HTMLSelectElement;
  if (optionCount === 0) select.selectedIndex = -1;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("empty guards (plan 006 step 2)", () => {
  it("empty IPC serie returns no_data instead of throwing", () => {
    expect(
      calculateInflationAdjustment({
        monto: 100000,
        fromYear: 2010,
        fromMonth: 1,
        serie: [],
      })
    ).toEqual({ ok: false, reason: "no_data" });
  });

  it("empty AFP select hides the comparison instead of throwing", () => {
    seedAfpDom(0);
    expect(() =>
      renderAfpComparison({
        grossSalary: 1200000,
        taxableSalary: undefined,
        healthSystem: "fonasa",
        contractType: "indefinido",
        isapreAdicional: 0,
        currentAfpRate: 11,
        formatCLP: n => `$${n}`,
        economicParameters: params,
      })
    ).not.toThrow();
    expect(
      document.getElementById("afp-comparison")?.classList.contains("hidden")
    ).toBe(true);
  });

  it("empty AFP select in inverso mode hides the section instead of throwing", async () => {
    vi.useFakeTimers();
    seedAfpDom(0);
    renderAfpComparisonInverso({
      targetNetSalary: 900000,
      healthSystem: "fonasa",
      contractType: "indefinido",
      isapreAdicional: 0,
      currentAfpRate: 11,
      formatCLP: n => `$${n}`,
      economicParameters: params,
    });
    await vi.runAllTimersAsync();
    expect(
      document.getElementById("afp-comparison")?.classList.contains("hidden")
    ).toBe(true);
  });

  it("selectedIndex -1 resolves to undefined instead of throwing", () => {
    seedAfpDom(0);
    const select = document.getElementById("afp-tasa") as HTMLSelectElement;
    expect(select.selectedIndex).toBe(-1);
    let afpName: string | undefined;
    expect(() => {
      afpName =
        select?.options[select.selectedIndex]?.text?.split(" ")?.[0];
    }).not.toThrow();
    expect(afpName).toBeUndefined();
  });
});
