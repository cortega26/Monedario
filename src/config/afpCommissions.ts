// AFP commission rates — Última verificación Previred: 2026-04-11
// total = 10% fondo personal + comisión de administración AFP (cargo trabajador dependiente)
// Fuente: Previred Indicadores Previsionales abril 2026 + sitios AFP oficiales
// Rango dependientes: 10.46% (Uno) a 11.45% (ProVida)

export interface AfpCommission {
  name: string;
  commission: number; // % comisión de administración (ej. 1.44)
  total: number;      // % total cotización AFP = 10 + commission (ej. 11.44)
}

export const AFP_COMMISSIONS_PERCENT: AfpCommission[] = [
  { name: "Capital",   commission: 1.44, total: 11.44 },
  { name: "Cuprum",    commission: 1.44, total: 11.44 },
  { name: "Habitat",   commission: 1.27, total: 11.27 },
  { name: "Modelo",    commission: 0.58, total: 10.58 },
  { name: "PlanVital", commission: 1.16, total: 11.16 },
  { name: "ProVida",   commission: 1.45, total: 11.45 },
  { name: "Uno",       commission: 0.46, total: 10.46 },
];
