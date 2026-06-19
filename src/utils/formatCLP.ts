/** Formatea un número como pesos chilenos: "$" + valor redondeado + separadores de miles. */
export function formatCLP(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}
