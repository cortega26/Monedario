import { expect, test } from "@playwright/test";
import { runAxe } from "./axe-helper";

type CapturedEvent = {
  event: string;
  params: Record<string, string>;
};

test.describe("UTM utility-led post-result journey", () => {
  test("stays hidden for invalid input and reveals an accessible, deduplicated journey after a result", async ({
    page,
  }) => {
    const events: CapturedEvent[] = [];
    const consoleErrors: string[] = [];

    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await page.addInitScript(() => {
      (
        window as Window & { __monedarioAnalyticsTransport?: boolean }
      ).__monedarioAnalyticsTransport = true;
    });
    await page.route("**/api/analytics/event", async route => {
      events.push(route.request().postDataJSON() as CapturedEvent);
      await route.fulfill({ status: 202, body: "" });
    });

    await page.goto("/calculadoras/conversor-utm/");
    const root = page.locator("#utm-post-result-actions");
    await expect(root).toBeHidden();

    await page.locator("#utm-input").fill("0");
    await expect(root).toBeHidden();
    expect(events.filter(event => event.event === "calculator_complete")).toHaveLength(0);

    await page.locator("#utm-input").fill("10");
    await expect(root).toBeVisible();
    await expect(page.locator("#resultado")).toBeVisible();

    // Keep click telemetry observable without leaving the tested calculator.
    await root.evaluate(element => {
      element.addEventListener(
        "click",
        event => {
          if ((event.target as Element).closest("a")) event.preventDefault();
        },
        true
      );
    });

    const nextSteps = root.locator("[data-next-step-id]");
    await expect(nextSteps).toHaveCount(2);
    for (const link of await nextSteps.all()) await link.scrollIntoViewIfNeeded();
    await root.locator("[data-alert-interest]").scrollIntoViewIfNeeded();
    await root.locator("[data-support-block]").scrollIntoViewIfNeeded();

    const interestButton = root.locator("[data-alert-interest-submit]");
    await interestButton.click();
    await expect(interestButton).toBeDisabled();
    await expect(root.locator("[data-alert-status]")).toContainText(
      "no activa avisos"
    );
    await nextSteps.first().click();
    await root.locator("[data-support-link]").click();

    // A second calculation must not inflate completion or shown events.
    await page.locator("#utm-input").fill("11");
    await page.waitForTimeout(100);

    expect(events.filter(event => event.event === "calculator_complete")).toHaveLength(1);
    expect(events.filter(event => event.event === "alert_interest_submit")).toHaveLength(1);
    expect(events.filter(event => event.event === "next_step_click")).toHaveLength(1);
    expect(events.filter(event => event.event === "support_click")).toHaveLength(1);
    expect(events.filter(event => event.event === "support_confirmed")).toHaveLength(0);

    for (const payload of events) {
      expect(Object.keys(payload)).toEqual(["event", "params"]);
      expect(Object.keys(payload.params).join("|")).not.toMatch(
        /(?:amount|monto|result_value|resultado|salary|sueldo|rut|email|session|user_id)/i
      );
    }

    const { violations } = await runAxe(page);
    expect(
      violations.filter(
        violation =>
          violation.impact === "critical" || violation.impact === "serious"
      )
    ).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test("keeps both contextual links usable on a narrow viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/calculadoras/conversor-utm/");
    await page.locator("#utm-input").fill("1");

    const root = page.locator("#utm-post-result-actions");
    await expect(root).toBeVisible();
    await expect(root.locator("[data-next-step-id]")).toHaveCount(2);
    await expect(root.locator("[data-alert-interest-submit]")).toBeVisible();
    await expect(root.locator("[data-support-link]")).toBeVisible();
  });

  test("calculation remains usable when first-party analytics is blocked", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (
        window as Window & { __monedarioAnalyticsTransport?: boolean }
      ).__monedarioAnalyticsTransport = true;
    });
    await page.route("**/api/analytics/event", route => route.abort("blockedbyclient"));
    await page.goto("/calculadoras/conversor-utm/");
    await page.locator("#utm-input").fill("2");

    await expect(page.locator("#resultado")).toBeVisible();
    await expect(page.locator("#utm-post-result-actions")).toBeVisible();
  });

  test("does not claim share success when clipboard permission is blocked", async ({
    page,
  }) => {
    const events: CapturedEvent[] = [];
    await page.addInitScript(() => {
      (
        window as Window & { __monedarioAnalyticsTransport?: boolean }
      ).__monedarioAnalyticsTransport = true;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error("blocked")) },
      });
    });
    await page.route("**/api/analytics/event", async route => {
      events.push(route.request().postDataJSON() as CapturedEvent);
      await route.fulfill({ status: 202, body: "" });
    });
    await page.goto("/calculadoras/conversor-utm/");
    await page.locator("#utm-input").fill("2");
    await page.locator("#share-copy").click();

    await expect(page.locator("#share-copy-feedback")).toContainText(
      "No se pudo copiar"
    );
    expect(events.filter(event => event.event === "share_attempt")).toHaveLength(1);
    expect(events.filter(event => event.event === "share_success")).toHaveLength(0);
  });

  test("keeps experimental surfaces absent without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/calculadoras/conversor-utm/");

    await expect(page.locator("#utm-post-result-actions")).toBeHidden();
    await expect(page.locator("#share-calculator-result")).toBeHidden();
    await context.close();
  });
});
