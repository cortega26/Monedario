// check:headers:prod
//
// Smoke pasivo de headers defensivos de producción (auditoría de privacidad
// 2026-09-29, PRIV-03). Hace HEAD a un par de URLs y valida el contrato:
// HSTS, CSP (hashes, frame-ancestors, base-uri, form-action, connect-src),
// Referrer-Policy, Permissions-Policy, nosniff y X-Frame-Options.
//
// Manual/scheduled: no es PR gate (requiere red y producción desplegada).
// Uso: node scripts/check-headers-prod.mjs [--base=https://monedario.cl]

import { fileURLToPath } from "node:url";
import path from "node:path";

const DEFAULT_BASE = "https://monedario.cl";
const PATHS = ["/", "/calculadoras/sueldo-liquido/"];

/** Valida el contrato de headers. `headers` con claves en minúscula. */
export function validateHeaders(headers) {
  const issues = [];
  const get = name => headers[name.toLowerCase()] ?? "";

  const hsts = get("strict-transport-security");
  if (!hsts) {
    issues.push("falta Strict-Transport-Security");
  } else {
    const maxAge = Number.parseInt(
      hsts.match(/max-age=(\d+)/)?.[1] ?? "0",
      10
    );
    if (!Number.isFinite(maxAge) || maxAge < 31536000) {
      issues.push(`Strict-Transport-Security max-age insuficiente: ${hsts}`);
    }
    if (!/includeSubDomains/i.test(hsts)) {
      issues.push("Strict-Transport-Security sin includeSubDomains");
    }
  }

  const csp = get("content-security-policy");
  if (!csp) {
    issues.push("falta Content-Security-Policy");
  } else {
    if (!/default-src\s+'self'/.test(csp)) {
      issues.push("CSP sin default-src 'self'");
    }
    if (!/frame-ancestors\s+'none'/.test(csp)) {
      issues.push("CSP sin frame-ancestors 'none'");
    }
    if (!/base-uri\s+'self'/.test(csp)) {
      issues.push("CSP sin base-uri 'self'");
    }
    if (!/form-action\s+'self'/.test(csp)) {
      issues.push("CSP sin form-action 'self'");
    }
    const scriptSrc = csp.match(/script-src\s+([^;]+)/)?.[1] ?? "";
    if (!scriptSrc.includes("sha256-")) {
      issues.push("CSP script-src sin hashes sha256-");
    }
    if (/unsafe-inline/.test(scriptSrc)) {
      issues.push("CSP script-src con unsafe-inline");
    }
    const connectSrc = csp.match(/connect-src\s+([^;]+)/)?.[1] ?? "";
    if (!connectSrc.includes("'self'")) {
      issues.push("CSP connect-src sin 'self'");
    }
  }

  const referrer = get("referrer-policy");
  if (!referrer) {
    issues.push("falta Referrer-Policy");
  }

  const permissions = get("permissions-policy");
  if (!permissions) {
    issues.push("falta Permissions-Policy");
  } else if (!/camera=\(\)/.test(permissions) || !/microphone=\(\)/.test(permissions)) {
    issues.push("Permissions-Policy no restringe camera/microphone");
  }

  if (get("x-content-type-options").toLowerCase() !== "nosniff") {
    issues.push("falta X-Content-Type-Options: nosniff");
  }

  if (get("x-frame-options").toUpperCase() !== "DENY") {
    issues.push("falta X-Frame-Options: DENY");
  }

  return issues;
}

async function fetchHeaders(url) {
  const res = await fetch(url, {
    method: "HEAD",
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });
  const headers = {};
  res.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  return { status: res.status, headers };
}

async function main() {
  const baseArg = process.argv.find(arg => arg.startsWith("--base="));
  const base = (baseArg ? baseArg.slice("--base=".length) : DEFAULT_BASE).replace(
    /\/$/,
    ""
  );

  let failures = 0;
  for (const pathname of PATHS) {
    const url = `${base}${pathname}`;
    try {
      const { status, headers } = await fetchHeaders(url);
      if (status !== 200) {
        console.error(`[check-headers-prod] FAIL ${url}: HTTP ${status}`);
        failures += 1;
        continue;
      }
      const issues = validateHeaders(headers);
      if (issues.length > 0) {
        failures += 1;
        console.error(`[check-headers-prod] FAIL ${url}:`);
        for (const issue of issues) console.error(`  - ${issue}`);
      } else {
        console.log(`[check-headers-prod] OK ${url}`);
      }
    } catch (error) {
      failures += 1;
      console.error(`[check-headers-prod] FAIL ${url}: ${error.message}`);
    }
  }

  if (failures > 0) {
    console.error(`[check-headers-prod] ${failures} URL(s) con issues.`);
    process.exit(1);
  }
  console.log("[check-headers-prod] Contrato de headers OK.");
  process.exit(0);
}

const __filename = fileURLToPath(import.meta.url);
const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  main();
}
