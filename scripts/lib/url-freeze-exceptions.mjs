// Esquema único de excepciones del URL-freeze
// (docs/governance/url-freeze-exceptions.json). Consumido por
// check-indexable-url-freeze.mjs y compare-routes.mjs — si el esquema gana un
// campo, se edita SOLO aquí.
//
// Nota (plan 070): los dos gates aplican criterios de VALIDACIÓN diferentes
// por diseño (el gate indexable reporta entradas inválidas y falla; el de
// rutas filtra en silencio) y normalización de URLs distinta (indexable usa
// normalizeIndexableUrl, rutas usa la URL cruda). Este módulo unifica solo el
// ESQUEMA de campos; cada gate conserva su comportamiento.

import { readFileSync } from "node:fs";

export const REQUIRED_EXCEPTION_FIELDS = [
  "url",
  "problem",
  "evidence",
  "hypothesis",
  "cost",
  "maintenance",
  "metric",
  "threshold",
  "decision",
  "approvedBy",
  "approvedAt",
  "expiresAt",
];

export function isCompleteException(entry) {
  return REQUIRED_EXCEPTION_FIELDS.every(
    key => String(entry[key] ?? "").trim().length > 0
  );
}

/**
 * Comportamiento de compare-routes.mjs: filtra en silencio. Devuelve el set de
 * URLs aprobadas (decision APPROVED) y no vencidas, crudas (sin normalizar).
 * `now` inyectable para tests; default Date.now() como el gate original.
 */
export function loadApprovedExceptionUrls(filePath, now = Date.now()) {
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));
  return new Set(
    (parsed.exceptions ?? [])
      .filter(entry => {
        const isExpired =
          !Number.isFinite(Date.parse(entry.expiresAt)) ||
          Date.parse(entry.expiresAt) < now;
        return isCompleteException(entry) && entry.decision === "APPROVED" && !isExpired;
      })
      .map(entry => entry.url)
  );
}

/**
 * Comportamiento del gate indexable: reporta cada violación con índice, no
 * filtra en silencio. Incluye la validación de approvedAt que solo ese gate
 * aplica. Devuelve un arreglo de mensajes (vacío = esquema válido).
 */
export function validateExceptionSchema(filePath) {
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));
  const errors = [];
  for (const [i, entry] of (parsed.exceptions ?? []).entries()) {
    const label = `exceptions[${i}] (url=${entry.url ?? "<sin url>"})`;
    if (!isCompleteException(entry)) {
      const missing = REQUIRED_EXCEPTION_FIELDS.filter(
        key => String(entry[key] ?? "").trim().length === 0
      );
      errors.push(`${label}: faltan campos: ${missing.join(", ")}`);
    }
    if (entry.decision !== "APPROVED") {
      errors.push(`${label}: decision != APPROVED`);
    }
    if (!Number.isFinite(Date.parse(entry.approvedAt))) {
      errors.push(`${label}: approvedAt inválido`);
    }
    if (!Number.isFinite(Date.parse(entry.expiresAt))) {
      errors.push(`${label}: expiresAt inválido`);
    }
  }
  return errors;
}
