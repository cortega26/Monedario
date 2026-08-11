export const CALCULATOR_FAMILY_ORDER = [
  "ingresos",
  "ahorro-prevision",
  "deuda-credito",
  "vivienda-uf",
] as const;

export type CalculatorFamilyId = (typeof CALCULATOR_FAMILY_ORDER)[number];

export type CalculatorAlternative = {
  href: string;
  label: string;
  when: string;
};

export type CalculatorPortfolioEntry = {
  href: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  tag: string;
  family: CalculatorFamilyId;
  primaryJtbd: string;
  whenToUse: string;
  notFor: string;
  related: CalculatorAlternative[];
  footerShortcutRank?: number;
  footerShortcutLabel?: string;
};

export type CalculatorFamilyMeta = {
  title: string;
  description: string;
  chooserPrompt: string;
};

export type CalculatorDecisionGuide = {
  title: string;
  situation: string;
  recommendedHref: string;
  recommendedLabel: string;
  why: string;
};

export const CALCULATOR_FAMILIES: Record<
  CalculatorFamilyId,
  CalculatorFamilyMeta
> = {
  ingresos: {
    title: "Ingresos y protección laboral",
    description:
      "Para decisiones del mes: cuánto entra a tu cuenta, cuánto cubre el seguro de cesantía y qué pasa si se corta el ingreso laboral.",
    chooserPrompt:
      "Úsala cuando tu pregunta nace en la liquidación de sueldo o en una contingencia laboral concreta.",
  },
  "ahorro-prevision": {
    title: "Ahorro y previsión",
    description:
      "Para decidir entre beneficio tributario hoy y saldo previsional de largo plazo, sin mezclar ambas preguntas en una sola herramienta.",
    chooserPrompt:
      "Parte aquí si la decisión es APV o pensión futura, no si buscas cuánto ganas este mes.",
  },
  "deuda-credito": {
    title: "Deuda y crédito",
    description:
      "Separa cuatro momentos distintos: cotizar un crédito nuevo, medir una deuda ya usada, evaluar un prepago o revisar una salida formal.",
    chooserPrompt:
      "La frontera clave es si la deuda todavía no existe, ya existe pero puedes seguir pagándola, o ya no puedes sostenerla.",
  },
  "vivienda-uf": {
    title: "Vivienda, UF y reajustes",
    description:
      "Para convertir montos, revisar cláusulas en UF o IPC y calcular cuánto cambia un arriendo sin mezclarlo con decisiones de deuda.",
    chooserPrompt:
      "Úsala si tu duda viene de una cláusula de contrato o de un monto indexado, no de una cuota crediticia.",
  },
};

export const CALCULATOR_PORTFOLIO: CalculatorPortfolioEntry[] = [
  {
    href: "/calculadoras/sueldo-liquido/",
    slug: "sueldo-liquido",
    title: "Calculadora de Sueldo Líquido",
    description:
      "Calcula tu líquido mensual con AFP, salud e impuesto único, y revisa el desglose de descuentos.",
    icon: "moneybag",
    tag: "Más usada",
    family: "ingresos",
    footerShortcutRank: 1,
    footerShortcutLabel: "Calcular sueldo",
    primaryJtbd: "Saber cuánto llega a tu cuenta este mes.",
    whenToUse:
      "Cuando estás comparando bruto vs líquido, revisando una oferta o chequeando tu liquidación.",
    notFor:
      "No sirve para proyectar cesantía ni para decidir un APV de largo plazo.",
    related: [
      {
        href: "/calculadoras/seguro-cesantia/",
        label: "Seguro de cesantía",
        when: "si el problema ya no es el sueldo del mes, sino cuánto aguanta tu cobertura si pierdes el trabajo.",
      },
    ],
  },
  {
    href: "/calculadoras/boleta-honorarios-liquido/",
    slug: "boleta-honorarios-liquido",
    title: "Boleta de Honorarios 2026",
    description:
      "Calcula líquido por boleta, retención vigente y base anual de cobertura orientativa sin mezclarlo con la declaración completa.",
    icon: "receipt",
    tag: "Más usada",
    family: "ingresos",
    primaryJtbd:
      "Saber cuánto recibes hoy por una boleta y cómo se proyecta esa retención en el año.",
    whenToUse:
      "Cuando emites honorarios y tu duda es líquido vs retención, no sueldo dependiente.",
    notFor:
      "No reemplaza la revisión de Operación Renta ni resuelve por sí sola exenciones legales.",
    related: [
      {
        href: "/calculadoras/sueldo-liquido/",
        label: "Sueldo líquido",
        when: "si tu ingreso principal viene de contrato dependiente y necesitas revisar descuentos de planilla.",
      },
    ],
  },
  {
    href: "/calculadoras/operacion-renta/",
    slug: "operacion-renta",
    title: "Simulador Operación Renta 2026",
    description:
      "Estima si el SII te devuelve o debes pagar más: consolida sueldos, honorarios y arriendos, descuenta retenciones y APV, y ve el resultado antes de enviar el F22.",
    icon: "receipt",
    tag: "Contingencia",
    family: "ingresos",
    primaryJtbd:
      "Saber si habrá devolución o pago adicional antes de enviar el F22.",
    whenToUse:
      "Cuando tienes más de una fuente de ingreso o retenciones del año y quieres estimar el resultado antes de abrir la propuesta del SII.",
    notFor:
      "No reemplaza la propuesta oficial del SII ni cubre dividendos, crédito de primera categoría ni dos empleadores simultáneos con situación compleja.",
    related: [
      {
        href: "/calculadoras/apv/",
        label: "Simulador APV",
        when: "si quieres reducir tu base imponible con APV Régimen B antes del cierre del año.",
      },
      {
        href: "/calculadoras/boleta-honorarios-liquido/",
        label: "Boleta de honorarios",
        when: "si tu duda es el líquido mensual por boleta, no el resultado anual en la declaración.",
      },
    ],
  },
  {
    href: "/calculadoras/finiquito-indemnizacion/",
    slug: "finiquito-indemnizacion",
    title: "Finiquito e Indemnización",
    description:
      "Estima años de servicio, aviso previo y feriado proporcional para revisar una salida laboral antes de firmar.",
    icon: "file-text",
    tag: "Contingencia",
    family: "ingresos",
    primaryJtbd:
      "Revisar si un finiquito parece razonable antes de aceptar el monto sin revisar.",
    whenToUse:
      "Cuando el problema ya es el término del contrato y necesitas separar cada ítem del pago final.",
    notFor:
      "No reemplaza asesoría laboral ni casos con discusión judicial, recargos o variables complejas.",
    related: [
      {
        href: "/calculadoras/seguro-cesantia/",
        label: "Seguro de cesantía",
        when: "si además del finiquito necesitas revisar cuánto colchón laboral te queda por AFC.",
      },
    ],
  },
  {
    href: "/calculadoras/impuesto-segunda-categoria/",
    slug: "impuesto-segunda-categoria",
    title: "Calculadora Impuesto Segunda Categoría",
    description:
      "Calcula cuánto pagas de impuesto único al trabajo según tu sueldo imponible mensual y en qué tramo de la tabla SII quedas.",
    icon: "chart-bar",
    tag: "Más usada",
    family: "ingresos",
    primaryJtbd: "Saber si pagas impuesto de segunda categoría y cuánto.",
    whenToUse:
      "Cuando quieres revisar el impuesto de forma aislada, entender en qué tramo tributas o verificar la retención mensual.",
    notFor:
      "No reemplaza el cálculo completo de sueldo líquido con AFP, salud y cesantía.",
    related: [
      {
        href: "/calculadoras/sueldo-liquido/",
        label: "Sueldo líquido",
        when: "si además del impuesto necesitas el desglose completo de todos los descuentos de planilla.",
      },
    ],
  },
  {
    href: "/calculadoras/seguro-cesantia/",
    slug: "seguro-cesantia",
    title: "Seguro de Cesantía",
    description:
      "Estima saldo CIC, acceso al fondo solidario y cobertura mensual según contrato, causal y cotizaciones.",
    icon: "shield-check",
    tag: "Contingencia",
    family: "ingresos",
    primaryJtbd:
      "Estimar cuánto colchón laboral tienes si se corta el ingreso.",
    whenToUse:
      "Cuando perdiste la pega, estás evaluando tu riesgo o quieres revisar si cumples mínimos AFC.",
    notFor:
      "No reemplaza el cálculo de sueldo líquido ni una simulación de pensión.",
    related: [
      {
        href: "/calculadoras/sueldo-liquido/",
        label: "Sueldo líquido",
        when: "si todavía estás en etapa de revisar descuentos mensuales y no una salida por cesantía.",
      },
      {
        href: "/calculadoras/finiquito-indemnizacion/",
        label: "Calcular tu finiquito",
        when: "si ya terminó la relación laboral, revisa qué te corresponde por años de servicio.",
      },
      {
        href: "/posts/seguro-cesantia-cuenta-individual-vs-fondo-solidario/",
        label: "Cuenta individual vs. Fondo Solidario",
        when: "cuándo el FCS complementa tu CIC y qué requisitos exige.",
      },
    ],
  },
  {
    href: "/calculadoras/apv/",
    slug: "apv",
    title: "Simulador APV",
    description:
      "Compara Régimen A y B con foco en ahorro tributario, renta imponible y beneficio mensual estimado.",
    icon: "trending-up",
    tag: "Decisión APV",
    family: "ahorro-prevision",
    footerShortcutRank: 2,
    footerShortcutLabel: "Simular APV",
    primaryJtbd:
      "Elegir cómo aportar al APV según el beneficio tributario que realmente puedes capturar hoy.",
    whenToUse:
      "Cuando ya decidiste evaluar APV y necesitas comparar régimen A, B o una mezcla.",
    notFor:
      "No sirve para proyectar pensión total ni reemplaza un plan previsional completo.",
    related: [
      {
        href: "/calculadoras/simulador-jubilacion/",
        label: "Simulador de jubilación",
        when: "si tu pregunta principal es cuánto saldo o pensión podrías tener al jubilar, no qué régimen APV conviene este año.",
      },
    ],
  },
  {
    href: "/calculadoras/comisiones-afp/",
    slug: "comisiones-afp",
    title: "Comparador de Comisiones AFP",
    description:
      "Compara la comisión de cada AFP con tu sueldo imponible y ve cuánto ahorrarías al año eligiendo la más barata.",
    icon: "building-bank",
    tag: "Referencia",
    family: "ahorro-prevision",
    primaryJtbd:
      "Elegir AFP comparando el costo real de comisión mensual sobre tu sueldo.",
    whenToUse:
      "Cuando evalúas cambiarte de AFP y quieres ver el impacto en pesos sobre tu liquidación.",
    notFor:
      "No modela rentabilidad de fondos ni proyecta pensión futura — solo compara el costo de comisión.",
    related: [
      {
        href: "/calculadoras/simulador-jubilacion/",
        label: "Simulador de jubilación",
        when: "si tu decisión es de largo plazo y quieres proyectar pensión futura, no comparar comisiones.",
      },
      {
        href: "/calculadoras/sueldo-liquido/",
        label: "Sueldo líquido",
        when: "si quieres ver el impacto completo de la AFP en tu liquidación mensual junto con los demás descuentos.",
      },
    ],
  },
  {
    href: "/calculadoras/simulador-jubilacion/",
    slug: "simulador-jubilacion",
    title: "Simulador de Jubilación",
    description:
      "Proyecta saldo AFP y pensión estimada considerando edad, ahorro actual, rentabilidad y cronograma previsional.",
    icon: "sun",
    tag: "Largo plazo",
    family: "ahorro-prevision",
    primaryJtbd:
      "Traducir tu ahorro previsional a un escenario de pensión futura.",
    whenToUse:
      "Cuando quieres mirar saldo final, edad de retiro o sensibilidad a tus aportes.",
    notFor:
      "No es la herramienta correcta para comparar el beneficio tributario inmediato del APV.",
    related: [
      {
        href: "/calculadoras/apv/",
        label: "Simulador APV",
        when: "si la decisión inmediata es cómo hacer el aporte APV y no cuánto capital acumularás al final.",
      },
    ],
  },
  {
    href: "/calculadoras/credito-consumo/",
    slug: "credito-consumo",
    title: "Calculadora de Crédito de Consumo",
    description:
      "Evalúa una oferta nueva con cuota, interés total, CAE y costos adicionales antes de firmar.",
    icon: "building-bank",
    tag: "Oferta nueva",
    family: "deuda-credito",
    footerShortcutRank: 3,
    footerShortcutLabel: "Evaluar crédito",
    primaryJtbd: "Comparar ofertas antes de tomar una deuda nueva.",
    whenToUse:
      "Cuando el crédito todavía no existe y necesitas decidir si firmar o no.",
    notFor:
      "No modela deudas ya cursadas, pagos mínimos de tarjeta ni escenarios de prepago.",
    related: [
      {
        href: "/calculadoras/tarjeta-credito/",
        label: "Tarjeta de crédito",
        when: "si la deuda ya está usada y tu problema es el costo de pagar el mínimo.",
      },
      {
        href: "/calculadoras/prepago-credito/",
        label: "Prepago de crédito",
        when: "si el crédito ya existe y estás evaluando un abono extraordinario.",
      },
    ],
  },
  {
    href: "/calculadoras/tarjeta-credito/",
    slug: "tarjeta-credito",
    title: "Costo Real Tarjeta de Crédito",
    description:
      "Mide cuánto cuesta pagar el mínimo o una cuota fija sobre una deuda ya usada en tu tarjeta.",
    icon: "credit-card",
    tag: "Deuda usada",
    family: "deuda-credito",
    primaryJtbd:
      "Entender cuánto te cuesta sostener una deuda rotativa que ya existe.",
    whenToUse:
      "Cuando el consumo ya ocurrió y necesitas ver meses, intereses y costo total del pago mínimo.",
    notFor: "No compara créditos nuevos ni reemplaza una renegociación formal.",
    related: [
      {
        href: "/calculadoras/credito-consumo/",
        label: "Crédito de consumo",
        when: "si todavía estás evaluando una oferta nueva y no una deuda rotativa ya cursada.",
      },
      {
        href: "/calculadoras/simulador-renegociacion/",
        label: "Simulador de renegociación",
        when: "si ya no puedes sostener los pagos y necesitas revisar una salida formal.",
      },
    ],
  },
  {
    href: "/calculadoras/prepago-credito/",
    slug: "prepago-credito",
    title: "¿Conviene prepagar el crédito?",
    description:
      "Calcula cuánto ahorras en intereses al hacer un abono extraordinario a tu crédito hipotecario o de consumo.",
    icon: "bulb",
    tag: "Abono extra",
    family: "deuda-credito",
    primaryJtbd:
      "Decidir si un monto extraordinario conviene más como prepago o como otra reserva.",
    whenToUse:
      "Cuando el crédito ya existe y tienes caja disponible para hacer un abono.",
    notFor:
      "No sirve para cotizar un préstamo desde cero ni para estimar una salida por insolvencia.",
    related: [
      {
        href: "/calculadoras/credito-consumo/",
        label: "Crédito de consumo",
        when: "si el préstamo todavía no está tomado y tu decisión es si firmarlo.",
      },
      {
        href: "/guias/ahorro-e-inversion/",
        label: "Ahorro: qué hago con la cuota liberada",
        when: "dónde colocar el monto que dejas de pagar, según tu horizonte.",
      },
      {
        href: "/calculadoras/simulador-renegociacion/",
        label: "Simulador de renegociación",
        when: "si el problema dejó de ser optimización y pasó a ser imposibilidad real de pago.",
      },
    ],
  },
  {
    href: "/calculadoras/simulador-renegociacion/",
    slug: "simulador-renegociacion",
    title: "Simulador Renegociación Superir",
    description:
      "Revisa si calificas para la renegociación gratuita y estima una cuota bajo ese camino formal.",
    icon: "scale",
    tag: "Salida formal",
    family: "deuda-credito",
    primaryJtbd:
      "Saber si todavía estás en modo optimización o ya necesitas una salida formal de deudas.",
    whenToUse:
      "Cuando tus deudas te superan y necesitas revisar elegibilidad para renegociar.",
    notFor:
      "No reemplaza una comparación de crédito nuevo ni un cálculo de pago mínimo.",
    related: [
      {
        href: "/calculadoras/prepago-credito/",
        label: "Prepago de crédito",
        when: "si aún puedes ordenar un crédito vigente con caja extra y no necesitas un proceso formal.",
      },
      {
        href: "/calculadoras/tarjeta-credito/",
        label: "Tarjeta de crédito",
        when: "si primero quieres dimensionar una sola deuda rotativa antes de pasar a una solución más estructural.",
      },
    ],
  },
  {
    href: "/calculadoras/conversor-uf/",
    slug: "conversor-uf",
    title: "Conversor UF ↔ Pesos",
    description:
      "Convierte entre UF y pesos al valor oficial del día con una referencia simple para cotizaciones y contratos.",
    icon: "refresh",
    tag: "Referencia",
    family: "vivienda-uf",
    footerShortcutRank: 4,
    footerShortcutLabel: "Convertir UF",
    primaryJtbd:
      "Traducir un monto indexado a UF o pesos sin agregar reglas contractuales extra.",
    whenToUse: "Cuando solo necesitas equivalencia actual entre UF y CLP.",
    notFor: "No calcula reajustes ni interpreta cláusulas de arriendo.",
    related: [
      {
        href: "/calculadoras/reajuste-arriendo/",
        label: "Reajuste de arriendo",
        when: "si además de convertir necesitas recalcular una renta según UF, IPC o pesos.",
      },
    ],
  },
  {
    href: "/calculadoras/conversor-utm/",
    slug: "conversor-utm",
    title: "Conversor UTM ↔ Pesos",
    description:
      "Convierte entre UTM y pesos al valor vigente del mes con una referencia rápida de multas, impuestos y trámites.",
    icon: "refresh",
    tag: "Referencia",
    family: "ingresos",
    primaryJtbd:
      "Traducir un monto expresado en UTM a pesos o viceversa sin añadir reglas tributarias.",
    whenToUse:
      "Cuando solo necesitas equivalencia actual entre UTM y CLP para revisar una multa, impuesto o trámite.",
    notFor:
      "No calcula impuestos por tramos progresivos ni modela la tabla del SII.",
    related: [
      {
        href: "/calculadoras/impuesto-segunda-categoria/",
        label: "Impuesto de segunda categoría",
        when: "si tu cálculo es el impuesto mensual sobre tu sueldo usando la tabla de tramos del SII.",
      },
      {
        href: "/calculadoras/conversor-uf/",
        label: "Conversor UF",
        when: "si tu monto está expresado en UF (vivienda, hipotecas, arriendos) y no en UTM.",
      },
    ],
  },
  {
    href: "/calculadoras/actualizador-inflacion/",
    slug: "actualizador-inflacion",
    title: "Actualizador por Inflación IPC",
    description:
      "Convierte pesos históricos a valor actual encadenando las variaciones mensuales del IPC oficial del INE desde 2000.",
    icon: "trending-up",
    tag: "Histórico",
    family: "vivienda-uf",
    primaryJtbd:
      "Saber cuánto valen hoy los pesos de otra época, usando la inflación real acumulada.",
    whenToUse:
      "Cuando quieres comparar sueldos, indemnizaciones o deudas de distintos años en términos reales.",
    notFor:
      "No proyecta inflación futura ni calcula reajustes contractuales — usa la calculadora de reajuste de arriendo para eso.",
    related: [
      {
        href: "/calculadoras/reajuste-arriendo/",
        label: "Reajuste de arriendo",
        when: "si necesitas calcular cuánto sube un arriendo según la cláusula del contrato.",
      },
      {
        href: "/calculadoras/conversor-uf/",
        label: "Conversor UF",
        when: "si tu monto está expresado en UF y necesitas el equivalente en pesos de hoy.",
      },
    ],
  },
  {
    href: "/calculadoras/reajuste-arriendo/",
    slug: "reajuste-arriendo",
    title: "Reajuste de Arriendo",
    description:
      "Calcula cuánto sube un arriendo según UF, IPC o pesos fijos y revisa la lógica de la cláusula.",
    icon: "home",
    tag: "Contrato",
    family: "vivienda-uf",
    primaryJtbd:
      "Recalcular un arriendo con la regla exacta que aparece en el contrato.",
    whenToUse:
      "Cuando tienes una cláusula de reajuste y quieres aterrizarla a un nuevo monto.",
    notFor:
      "No reemplaza un conversor simple si solo buscas equivalencia UF a pesos.",
    related: [
      {
        href: "/calculadoras/conversor-uf/",
        label: "Conversor UF",
        when: "si no necesitas aplicar una cláusula y solo quieres convertir montos.",
      },
    ],
  },
  {
    href: "/calculadoras/dividendo-hipotecario/",
    slug: "dividendo-hipotecario",
    title: "Calculadora de Dividendo Hipotecario",
    description:
      "Estima tu dividendo mensual en UF y pesos según el valor de la propiedad, el pie, la tasa y el plazo. Incluye seguros opcionales y tabla de amortización.",
    icon: "home",
    tag: "Crédito hipotecario",
    family: "vivienda-uf",
    primaryJtbd:
      "Saber cuánto pagarás de dividendo mensual antes de tomar un crédito hipotecario.",
    whenToUse:
      "Cuando estás evaluando la compra de una vivienda y necesitas estimar la cuota mensual en UF y pesos.",
    notFor:
      "No reemplaza la oferta formal del banco ni cubre seguros obligatorios con detalle legal.",
    related: [
      {
        href: "/calculadoras/prepago-credito/",
        label: "Prepago de crédito",
        when: "si el crédito hipotecario ya está tomado y evalúas un abono extraordinario.",
      },
      {
        href: "/calculadoras/conversor-uf/",
        label: "Conversor UF",
        when: "si solo necesitas convertir un monto en UF a pesos sin calcular una cuota hipotecaria.",
      },
    ],
  },
  {
    href: "/calculadoras/interes-compuesto/",
    slug: "interes-compuesto",
    title: "Calculadora de Interés Compuesto",
    description:
      "Simula cuánto crece tu capital con interés compuesto: monto final, interés generado y evolución año a año según tasa y frecuencia de capitalización.",
    icon: "trending-up",
    tag: "Simulador",
    family: "ahorro-prevision",
    primaryJtbd:
      "Ver cuánto crece un capital en el tiempo con una tasa y frecuencia de capitalización dadas.",
    whenToUse:
      "Cuando quieres proyectar un ahorro o inversión genérica y entender el efecto del tiempo y la capitalización.",
    notFor:
      "No modela AFP ni APV específico — usa el simulador de jubilación para proyección previsional.",
    related: [
      {
        href: "/calculadoras/deposito-a-plazo/",
        label: "Depósito a plazo",
        when: "si tu inversión concreta es un DAP y necesitas calcular interés bruto, impuesto y monto neto.",
      },
      {
        href: "/calculadoras/simulador-jubilacion/",
        label: "Simulador de jubilación",
        when: "si la proyección es previsional (AFP) y no una inversión genérica.",
      },
    ],
  },
  {
    href: "/calculadoras/iva/",
    slug: "iva",
    title: "Calculadora de IVA Chile 19%",
    description:
      "Calcula el IVA del 19% en Chile: ingresa un monto neto y obtén el bruto con IVA, o ingresa el bruto y separa el neto del impuesto.",
    icon: "receipt",
    tag: "Referencia",
    family: "ingresos",
    primaryJtbd:
      "Saber cuánto IVA corresponde a un monto neto, o extraer el IVA de un precio ya con impuesto incluido.",
    whenToUse:
      "Cuando necesitas desglosar o agregar el 19% de IVA a cualquier monto en pesos chilenos.",
    notFor:
      "No calcula IVA crédito fiscal vs débito fiscal ni modela declaraciones de IVA mensual.",
    related: [
      {
        href: "/calculadoras/impuesto-segunda-categoria/",
        label: "Impuesto de segunda categoría",
        when: "si tu cálculo es el impuesto mensual sobre tu sueldo usando la tabla de tramos del SII.",
      },
      {
        href: "/calculadoras/conversor-utm/",
        label: "Conversor UTM ↔ Pesos",
        when: "si tu referencia es una multa o trámite expresado en UTM y no un monto con IVA.",
      },
    ],
  },
  {
    href: "/calculadoras/gratificacion-legal/",
    slug: "gratificacion-legal",
    title: "Calculadora de Gratificación Legal",
    description:
      "Calcula cuánto te corresponde de gratificación según el Código del Trabajo: 25% mensualizado topado a 4,75 IMM o porcentaje de utilidades.",
    icon: "moneybag",
    tag: "Laboral",
    family: "ingresos",
    primaryJtbd:
      "Saber cuánto es mi gratificación legal y si mi empleador aplica el tope correctamente.",
    whenToUse:
      "Cuando recibes tu liquidación y quieres verificar el monto de gratificación mensualizada, o al término del año para estimar la gratificación sobre utilidades.",
    notFor:
      "No reemplaza la revisión de la liquidación real ni asesoría laboral para disputas específicas.",
    related: [
      {
        href: "/calculadoras/sueldo-liquido/",
        label: "Sueldo líquido",
        when: "si recibes la gratificación mensualizada y quieres ver el impacto completo en tu liquidación con todos los descuentos.",
      },
      {
        href: "/calculadoras/finiquito-indemnizacion/",
        label: "Finiquito e indemnización",
        when: "si además de la gratificación necesitas calcular los demás componentes de un finiquito.",
      },
    ],
  },
  {
    href: "/calculadoras/deposito-a-plazo/",
    slug: "deposito-a-plazo",
    title: "Calculadora Depósito a Plazo",
    description:
      "Calcula interés bruto, retención de impuesto (4%) e interés neto de tu DAP. Ingresa monto, plazo en días y tasa TIR.",
    icon: "building-bank",
    tag: "Ahorro",
    family: "ahorro-prevision",
    primaryJtbd:
      "Saber cuánto ganas neto en un DAP, después de impuesto, con tu monto y plazo.",
    whenToUse:
      "Cuando tienes o evalúas un depósito a plazo y quieres el rendimiento real después de retención.",
    notFor:
      "No compara DAPs entre bancos ni cubre instrumentos en UF o dólares — solo pesos y tasa TIR.",
    related: [
      {
        href: "/calculadoras/interes-compuesto/",
        label: "Interés compuesto",
        when: "si quieres proyectar un ahorro en el largo plazo con reinversión, no un DAP de plazo fijo.",
      },
    ],
  },
];

export const CALCULATOR_FOOTER_SHORTCUTS = CALCULATOR_PORTFOLIO.filter(
  calculator => typeof calculator.footerShortcutRank === "number"
)
  .sort((a, b) => a.footerShortcutRank! - b.footerShortcutRank!)
  .map(calculator => ({
    href: calculator.href,
    label: calculator.footerShortcutLabel ?? calculator.title,
  }));

export const CALCULATOR_DECISION_GUIDES: CalculatorDecisionGuide[] = [
  {
    title: "Quiero saber cuánto me queda este mes",
    situation:
      "Tienes un sueldo bruto, una oferta laboral o una liquidación y tu pregunta es bruto vs líquido.",
    recommendedHref: "/calculadoras/sueldo-liquido/",
    recommendedLabel: "Calculadora de Sueldo Líquido",
    why: "Te responde el depósito mensual; no mezcla esa duda con APV ni pensión futura.",
  },
  {
    title: "Emito boletas y quiero saber mi líquido real",
    situation:
      "Tu ingreso viene de honorarios y necesitas separar retención mensual, líquido recibido y cobertura anual orientativa.",
    recommendedHref: "/calculadoras/boleta-honorarios-liquido/",
    recommendedLabel: "Boleta de Honorarios 2026",
    why: "No conviene partir por sueldo líquido si la pregunta nace en una boleta y no en una liquidación.",
  },
  {
    title: "Me finiquitaron y quiero revisar el monto",
    situation:
      "Necesitas un estimado base de años de servicio, aviso previo y vacaciones antes de firmar.",
    recommendedHref: "/calculadoras/finiquito-indemnizacion/",
    recommendedLabel: "Finiquito e Indemnización",
    why: "Te ayuda a separar cada componente del pago final antes de pasar a AFC o a una reclamación.",
  },
  {
    title: "Quiero medir mi colchón si pierdo la pega",
    situation:
      "La duda no es el sueldo del mes, sino cuánta cobertura real tienes por AFC.",
    recommendedHref: "/calculadoras/seguro-cesantia/",
    recommendedLabel: "Seguro de Cesantía",
    why: "Modela saldo CIC, causal y mínimos de acceso en vez de descuentos de planilla.",
  },
  {
    title: "Estoy decidiendo un aporte APV",
    situation:
      "Necesitas comparar régimen A, B o una combinación por el beneficio tributario de hoy.",
    recommendedHref: "/calculadoras/apv/",
    recommendedLabel: "Simulador APV",
    why: "Se enfoca en la decisión tributaria del aporte, no en el saldo final de jubilación.",
  },
  {
    title: "Quiero proyectar mi pensión futura",
    situation:
      "Tu pregunta principal es saldo AFP, edad de retiro o resultado previsional de largo plazo.",
    recommendedHref: "/calculadoras/simulador-jubilacion/",
    recommendedLabel: "Simulador de Jubilación",
    why: "Te conviene cuando la conversación ya no es el aporte APV aislado, sino el resultado total.",
  },
  {
    title: "Todavía no firmo el crédito",
    situation:
      "Estás comparando una oferta nueva y quieres revisar cuota, interés y CAE antes de tomarla.",
    recommendedHref: "/calculadoras/credito-consumo/",
    recommendedLabel: "Crédito de Consumo",
    why: "Es la única del portafolio diseñada para una deuda que aún no existe.",
  },
  {
    title: "La deuda ya existe y es una tarjeta",
    situation:
      "Ya hiciste consumos y quieres medir el costo real de pagar el mínimo o una cuota fija.",
    recommendedHref: "/calculadoras/tarjeta-credito/",
    recommendedLabel: "Costo Real Tarjeta de Crédito",
    why: "No sirve cotizar un crédito nuevo si el problema ya es una deuda rotativa en curso.",
  },
  {
    title: "Tengo plata extra y evalúo un abono",
    situation:
      "El crédito sigue vigente, pero tu decisión es si conviene prepagar o guardar ese dinero.",
    recommendedHref: "/calculadoras/prepago-credito/",
    recommendedLabel: "Prepago de Crédito",
    why: "Resuelve una decisión de optimización sobre una deuda existente, no una salida por insolvencia.",
  },
  {
    title: "Ya no puedo sostener las deudas",
    situation:
      "Necesitas revisar si calificas para una renegociación formal y no solo simular una cuota aislada.",
    recommendedHref: "/calculadoras/simulador-renegociacion/",
    recommendedLabel: "Simulador Renegociación Superir",
    why: "Marca la frontera entre optimizar una deuda y entrar a un proceso formal de alivio.",
  },
  {
    title: "Solo necesito convertir UF a pesos",
    situation:
      "Tienes un valor en UF o CLP y buscas una equivalencia simple al valor oficial del día.",
    recommendedHref: "/calculadoras/conversor-uf/",
    recommendedLabel: "Conversor UF ↔ Pesos",
    why: "Es referencia pura; no agrega supuestos de arriendo ni interpreta cláusulas.",
  },
  {
    title: "Necesito recalcular un arriendo",
    situation:
      "Tienes una cláusula en UF, IPC o pesos fijos y quieres ver el nuevo monto del contrato.",
    recommendedHref: "/calculadoras/reajuste-arriendo/",
    recommendedLabel: "Reajuste de Arriendo",
    why: "Aplica la regla del contrato; un conversor simple no alcanza para esa decisión.",
  },
  {
    title: "Quiero saber cuánto pagaré de dividendo hipotecario",
    situation:
      "Estás evaluando la compra de una vivienda y necesitas estimar la cuota mensual en UF y pesos según precio, pie, tasa y plazo.",
    recommendedHref: "/calculadoras/dividendo-hipotecario/",
    recommendedLabel: "Calculadora de Dividendo Hipotecario",
    why: "Diseñada específicamente para estimar el dividendo mensual con tabla de amortización, a diferencia del conversor UF que solo traduce montos.",
  },
];
