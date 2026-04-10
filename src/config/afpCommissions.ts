// AFP commission rates — Última verificación SP: 2026-04-10
// total = 10% fondo personal + comisión de administración AFP
// Fuente: Superintendencia de Pensiones (spensiones.cl)

export interface AfpCommission {
  name: string;
  commission: number; // % comisión de administración (ej. 0.58)
  total: number;      // % total cotización AFP = 10 + commission (ej. 10.58)
}

export const AFP_COMMISSIONS_PERCENT: AfpCommission[] = [
  { name: "Capital",  commission: 0.58, total: 10.58 },
  { name: "Cuprum",   commission: 0.65, total: 10.65 },
  { name: "Habitat",  commission: 0.77, total: 10.77 },
  { name: "Modelo",   commission: 0.58, total: 10.58 },
  { name: "PlanVital", commission: 0.49, total: 10.49 },
  { name: "ProVida",  commission: 0.69, total: 10.69 },
  { name: "Uno",      commission: 0.75, total: 10.75 },
];
