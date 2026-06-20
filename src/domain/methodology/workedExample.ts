/**
 * Modelo de "ejemplo resuelto paso a paso" que se muestra dentro de cada
 * calculadora para dar transparencia al cálculo.
 *
 * El objetivo de mantener estos ejemplos como datos (y no como prosa suelta en
 * la página) es doble:
 *  1. Transparencia: el usuario ve, con cifras reales, cómo se llega al número.
 *  2. Trazabilidad de drift: cada ejemplo se ata a su función de cálculo real
 *     mediante {@link WorkedExampleFixture}, de modo que un test pueda verificar
 *     que la salida documentada sigue coincidiendo con la fórmula. Si una
 *     fórmula cambia o se rompe, el test falla y el ejemplo publicado queda
 *     señalado de inmediato.
 */

/** Un paso de un ejemplo numérico resuelto. */
export interface WorkedStep {
  /** Qué hace el paso, en lenguaje natural. P. ej. "Calcula el IVA". */
  label: string;
  /** Operación con cifras, p. ej. "$1.000.000 × 0,19". Opcional. */
  expression?: string;
  /** Resultado del paso, p. ej. "$190.000". */
  result: string;
}

/** Ejemplo numérico resuelto paso a paso, listo para renderizar en la UI. */
export interface WorkedExample {
  /** Escenario en lenguaje natural que da contexto al ejemplo. */
  scenario: string;
  /** Pasos en orden, del dato de entrada al resultado. */
  steps: WorkedStep[];
  /** Conclusión final en una frase. */
  conclusion: string;
}

/**
 * Ata un ejemplo resuelto a su función de cálculo real.
 *
 * `input`/`expected` alimentan el test anti-drift (se pasa `input` por la
 * función real y se compara con `expected`); `example` es lo que se renderiza
 * en la calculadora. Mantenlos coherentes: las cifras de `example` deben
 * reflejar el mismo escenario que `input`/`expected`.
 */
export interface WorkedExampleFixture<TInput, TOutput> {
  input: TInput;
  expected: TOutput;
  example: WorkedExample;
}
