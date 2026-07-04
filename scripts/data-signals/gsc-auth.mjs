/**
 * Shared Google service-account auth for the GSC data-signals scripts.
 * JWT RS256 signed with the service-account private key — no external deps.
 *
 * This module performs network I/O (token exchange), so it lives here rather
 * than in gsc-utils.mjs, which is kept pure and side-effect-free for tests.
 */

import { createSign } from "node:crypto";

/**
 * Builds a signed JWT assertion for the Google OAuth token endpoint.
 * Module-internal — callers use {@link fetchAccessToken}.
 * @param {{ client_email: string, private_key: string }} creds
 * @param {string} scope  space-delimited OAuth scope(s)
 * @returns {string} the signed JWT (`header.payload.signature`)
 */
function buildJWT(creds, scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
      iss: creds.client_email,
      scope,
    })
  ).toString("base64url");
  const signingInput = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const sig = signer.sign(creds.private_key, "base64url");
  return `${signingInput}.${sig}`;
}

/**
 * Exchanges a service-account JWT for a short-lived OAuth access token.
 * @param {{ client_email: string, private_key: string }} creds
 * @param {string} scope  space-delimited OAuth scope(s)
 * @returns {Promise<string>} the access token
 */
export async function fetchAccessToken(creds, scope) {
  const jwt = buildJWT(creds, scope);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      assertion: jwt,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${body}`);
  }
  const { access_token } = await res.json();
  return access_token;
}
