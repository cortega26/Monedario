import type { LinkCard } from "@/config/sueldoClusterLinks";

export const sueldoRemuneracionesCalcCards: LinkCard[] = [
  {
    kind: "Calculadora",
    title: "Calculadora de sueldo líquido",
    description:
      "Convierte sueldo bruto a líquido con AFP, salud, cesantía e impuesto único en un solo cálculo.",
    href: "/calculadoras/sueldo-liquido/",
    cta: "Calcular sueldo líquido",
  },
  {
    kind: "Calculadora",
    title: "Boleta de honorarios 2026",
    description:
      "Calcula retención del 15,25%, líquido recibido y cobertura previsional de tus boletas.",
    href: "/calculadoras/boleta-honorarios-liquido/",
    cta: "Calcular líquido por boleta",
  },
];

export const empleoIngresosCalcCards: LinkCard[] = [
  {
    kind: "Calculadora",
    title: "Calculadora de finiquito e indemnización",
    description:
      "Estima días pendientes, vacaciones proporcionales, aviso previo e indemnización según causal.",
    href: "/calculadoras/finiquito-indemnizacion/",
    cta: "Calcular finiquito",
  },
  {
    kind: "Calculadora",
    title: "Calculadora del seguro de cesantía",
    description:
      "Estima el monto y los meses que recibirías del seguro de cesantía según tu historial.",
    href: "/calculadoras/seguro-cesantia/",
    cta: "Calcular seguro de cesantía",
  },
];

export const impuestosPersonasCalcCards: LinkCard[] = [
  {
    kind: "Calculadora",
    title: "Calculadora de impuesto de segunda categoría",
    description:
      "Estima el impuesto mensual según tu sueldo bruto, AFP y tramo aplicable.",
    href: "/calculadoras/impuesto-segunda-categoria/",
    cta: "Calcular impuesto",
  },
  {
    kind: "Calculadora",
    title: "Calculadora Operación Renta",
    description:
      "Estima si tu declaración anual resultará en devolución o diferencia a pagar al SII.",
    href: "/calculadoras/operacion-renta/",
    cta: "Calcular renta anual",
  },
];

export const pensionesAfpCalcCards: LinkCard[] = [
  {
    kind: "Calculadora",
    title: "Simulador de jubilación",
    description:
      "Proyecta tu pensión estimada según ahorro acumulado, edad, fondo y cotización futura.",
    href: "/calculadoras/simulador-jubilacion/",
    cta: "Simular jubilación",
  },
  {
    kind: "Calculadora",
    title: "Comparador de comisiones AFP",
    description:
      "Compara cuánto te descuenta cada AFP y cuánto ahorrarías cambiándote a la más barata.",
    href: "/calculadoras/comisiones-afp/",
    cta: "Comparar comisiones",
  },
  {
    kind: "Calculadora",
    title: "Calculadora APV",
    description:
      "Calcula el beneficio tributario de tu ahorro previsional voluntario bajo régimen A o B.",
    href: "/calculadoras/apv/",
    cta: "Calcular APV",
  },
];
