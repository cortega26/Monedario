// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import {
  snapshotInputs,
  restoreInputs,
} from "@/utils/calculatorScenariosUI";

function mount(html: string): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("snapshotInputs", () => {
  it("captures text/number inputs and selects by id", () => {
    const c = mount(`
      <input id="sueldo" type="number" value="1200000" />
      <select id="afp-tasa"><option value="11.44" selected>Habitat</option></select>
    `);
    expect(snapshotInputs(c)).toEqual({ sueldo: "1200000", "afp-tasa": "11.44" });
  });

  it("keys the checked radio by r:<name> and ignores unchecked radios", () => {
    const c = mount(`
      <input type="radio" name="modo" value="bruto" checked />
      <input type="radio" name="modo" value="liquido" />
    `);
    expect(snapshotInputs(c)).toEqual({ "r:modo": "bruto" });
  });

  it("keys checkboxes by c:<id> as 1/0", () => {
    const c = mount(`
      <input type="checkbox" id="apv" checked />
      <input type="checkbox" id="extra" />
    `);
    expect(snapshotInputs(c)).toEqual({ "c:apv": "1", "c:extra": "0" });
  });
});

describe("restoreInputs round-trips with snapshotInputs", () => {
  it("writes values back so a re-snapshot equals the saved snapshot", () => {
    const c = mount(`
      <input id="sueldo" type="number" value="0" />
      <input type="radio" name="modo" value="bruto" />
      <input type="radio" name="modo" value="liquido" checked />
      <input type="checkbox" id="apv" />
      <select id="afp-tasa"><option value="11.44">Habitat</option><option value="11.45">PlanVital</option></select>
    `);
    const saved = {
      sueldo: "1500000",
      "r:modo": "bruto",
      "c:apv": "1",
      "afp-tasa": "11.45",
    };
    restoreInputs(c, saved);
    expect(snapshotInputs(c)).toEqual(saved);
  });

  it("dispatches input/change events when restoring a field", () => {
    const c = mount(`<input id="sueldo" type="number" value="0" />`);
    let inputs = 0;
    let changes = 0;
    c.querySelector("#sueldo")!.addEventListener("input", () => (inputs += 1));
    c.querySelector("#sueldo")!.addEventListener("change", () => (changes += 1));
    restoreInputs(c, { sueldo: "999" });
    expect(inputs).toBe(1);
    expect(changes).toBe(1);
  });
});
