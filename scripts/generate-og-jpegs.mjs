#!/usr/bin/env node
/** Compatibility entry point: OG, hero and responsive assets share one source.
 * Supports --force and --dry-run through the canonical delivery command.
 * Freshness is verified against bytes, never filesystem modification dates.
 */
import "./hero-images/build-delivery.mjs";
