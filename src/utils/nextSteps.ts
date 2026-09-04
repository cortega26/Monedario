/**
 * Derivaciones de identidad para la instrumentación de `NextSteps.astro`.
 *
 * Se extraen a un módulo aparte (en vez de vivir solo en el frontmatter del
 * componente) porque la suite de tests actual no tiene infraestructura para
 * importar componentes `.astro` directamente — se testean aquí como funciones
 * puras. Plan 083.
 */

/**
 * Deriva el identificador de calculadora desde el `currentHref` canónico que
 * cada página de calculadora ya pasa a `NextSteps`. No se agrega una prop
 * `calculatorId` explícita: ninguna página la pasaría en este plan y quedaría
 * como superficie sin uso.
 */
export function deriveCalculatorId(href: string): string | undefined {
  const match = /^\/calculadoras\/([a-z0-9][a-z0-9-]*)\/$/.exec(href);
  return match?.[1];
}

function normalizeHref(href: string): string {
  return href.replace(/\/+$/, "") || "/";
}

/**
 * Deriva un `next_step_id` seguro para el contrato de analytics a partir del
 * destino del enlace. El resultado debe cumplir `SAFE_TOKEN`
 * (`/^[a-z0-9][a-z0-9._-]{0,79}$/`, ver `src/contracts/analytics-events.ts`);
 * de ahí el truncado a 80 caracteres, que no es opcional: sin él se
 * reproduciría la misma clase de defecto que este plan corrige (eventos
 * descartados en silencio por el sanitizador).
 */
export function deriveNextStepId(href: string): string {
  return normalizeHref(href)
    .replace(/^\//, "")
    .replace(/\//g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/^-+/, "")
    .slice(0, 80);
}
