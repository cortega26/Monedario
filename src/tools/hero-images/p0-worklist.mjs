// Operational ordering only. Scene instructions live exclusively in reviewed briefs.
// Export names retained for workspace compatibility.
export const HERO_P0_ORDER = [
  "como-hacer-presupuesto-mensual-chile",
  "cuanto-descuenta-la-afp-de-tu-sueldo",
  "que-es-el-apv",
  "pgu-pension-garantizada-universal",
  "renegociacion-superir",
  "que-es-la-uf",
  "devolucion-impuestos-fechas-compensaciones",
  "deposito-a-plazo-uf-vs-pesos",
  "que-es-el-ipc-chile-como-se-calcula",
  "credito-hipotecario-chile-guia-completa",
  "reforma-previsional-2025-que-cambia-y-como-te-afecta",
  "que-es-la-cuenta-2-afp",
  "seguro-de-cesantia",
  "liquidacion-de-sueldo",
  "fondos-afp-a-b-c-d-e",
  "indemnizacion-anos-de-servicio-chile",
  "cotizacion-voluntaria-afp-independiente",
  "ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026",
  "el-poder-del-interes-compuesto",
  "seguro-cesantia-cuenta-individual-vs-fondo-solidario",
  "operacion-renta-centro",
  "como-salir-boletin-comercial-chile",
  "utm-chile-que-es-como-funciona",
];
export const HERO_P0_METADATA = Object.fromEntries(
  HERO_P0_ORDER.map((slug, index) => [
    slug,
    {
      priority: `${index < 6 ? "A" : "B"}${String(index + 1).padStart(2, "0")}`,
      subgroup: index < 6 ? "Piloto v5" : "Segundo lote v5",
    },
  ])
);
