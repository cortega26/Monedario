import { expect, type Page } from "@playwright/test";

export interface CapturedRequest {
  url: string;
  method: string;
  body: string | null;
}

export function startRequestCapture(page: Page): CapturedRequest[] {
  const captured: CapturedRequest[] = [];
  page.on("request", request => {
    captured.push({
      url: request.url(),
      method: request.method(),
      body: request.postData(),
    });
  });
  return captured;
}

export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", error => errors.push(String(error)));
  return errors;
}

/** Hace que localStorage/sessionStorage lancen al accederse (RES-035/036). */
export async function blockWebStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const thrower = new Proxy(
      {},
      {
        get() {
          throw new Error("storage blocked by test");
        },
      }
    );
    Object.defineProperty(window, "localStorage", { get: () => thrower });
    Object.defineProperty(window, "sessionStorage", { get: () => thrower });
  });
}

export async function calculateSueldo(page: Page, amount: string): Promise<void> {
  await page.locator("#sueldo").fill(amount);
  await page.locator("#calcBtn").click();
  await expect(page.locator("#calc-error")).toBeHidden();
}

export async function sueldoResultText(page: Page): Promise<string> {
  return (await page.locator("#resultado-contenido").innerText())
    .replace(/\s+/g, " ")
    .trim();
}

export async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
}
