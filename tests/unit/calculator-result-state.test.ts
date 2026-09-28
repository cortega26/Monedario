import { describe, expect, it } from "vitest";
import {
  buildInvalidStateModel,
  markResultState,
  INVALID_RESULT_HINT,
  INVALID_RESULT_MESSAGE,
} from "@/utils/calculatorResultState";

function fakeElement() {
  const attributes = new Map<string, string>();
  return {
    attributes,
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    removeAttribute(name: string) {
      attributes.delete(name);
    },
    getAttribute(name: string) {
      return attributes.get(name) ?? null;
    },
    hasAttribute(name: string) {
      return attributes.has(name);
    },
  } as unknown as HTMLElement;
}

describe("buildInvalidStateModel", () => {
  it("returns the default corrective message and hint", () => {
    expect(buildInvalidStateModel()).toEqual({
      message: INVALID_RESULT_MESSAGE,
      hint: INVALID_RESULT_HINT,
    });
  });

  it("accepts contextual overrides", () => {
    expect(buildInvalidStateModel("Falta el plazo", "Revisa el campo")).toEqual({
      message: "Falta el plazo",
      hint: "Revisa el campo",
    });
  });
});

describe("markResultState", () => {
  it("marks an invalid result and clears the example flag", () => {
    const element = fakeElement();
    element.setAttribute("data-is-example", "true");
    markResultState(element, "invalid");
    expect(element.getAttribute("data-result-state")).toBe("invalid");
    expect(element.hasAttribute("data-is-example")).toBe(false);
  });

  it("marks a rendered result and clears the example flag", () => {
    const element = fakeElement();
    markResultState(element, "result");
    expect(element.getAttribute("data-result-state")).toBe("result");
    expect(element.hasAttribute("data-is-example")).toBe(false);
  });

  it("restores the example state explicitly", () => {
    const element = fakeElement();
    markResultState(element, "example");
    expect(element.getAttribute("data-result-state")).toBe("example");
    expect(element.getAttribute("data-is-example")).toBe("true");
  });

  it("is a no-op without a container", () => {
    expect(() => markResultState(null, "result")).not.toThrow();
  });
});
