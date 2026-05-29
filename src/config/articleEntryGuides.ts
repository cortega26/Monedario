import type { WizardConfig, WizardResult } from "@/domain/wizard/WizardConfig";
import type { ProfilePatch } from "@/utils/userProfile";

type IntentMode = "learn" | "calculate";

export interface ArticleEntryGuide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  config: WizardConfig;
}

const intentLabels: Record<IntentMode, string> = {
  learn: "Entender opciones",
  calculate: "Simular / calcular",
};

function intentPatch(intent: IntentMode): ProfilePatch {
  return { intent_mode: intent };
}

function makeResult(
  resultKey: string,
  titulo: string,
  descripcion: string,
  primaryCta: { label: string; href: string },
  secondaryLinks: Array<{ label: string; href: string }> = [],
  nota = "Orientación educativa: esta salida organiza el punto de partida, no reemplaza una evaluación individual."
): WizardResult {
  return {
    resultKey,
    titulo,
    descripcion,
    primaryCta,
    secondaryLinks,
    nota,
  };
}

const RESULTS = {
  emergencyFundFirst: makeResult(
    "emergency-fund-first",
    "Primero separa tu fondo de emergencia",
    "Si aún no tienes un colchón aparte, la ruta más prudente es ordenar primero esa base antes de entrar a decisiones de inversión o ahorro de mayor plazo.",
    {
      label: "Ver guía de fondo de emergencia →",
      href: "/posts/fondo-emergencia-chile/",
    },
    [
      {
        label: "Volver a la guía general de ahorro e inversión",
        href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/",
      },
    ],
    "Orientación educativa: aquí el foco no es maximizar retorno, sino ordenar liquidez básica."
  ),
  apvRead: makeResult(
    "apv-read",
    "Empieza por entender qué es el APV",
    "Si hoy te importa el beneficio tributario, conviene entender primero regímenes, límites y uso general del APV antes de proyectar ahorros o descuentos.",
    {
      label: "Leer qué es el APV →",
      href: "/posts/que-es-el-apv/",
    },
    [{ label: "Ver calculadora APV", href: "/calculadoras/apv/" }],
    "Orientación educativa: esta salida organiza la decisión por régimen y objetivo, no por promesa de retorno."
  ),
  apvCalc: makeResult(
    "apv-calc",
    "Parte con la calculadora APV",
    "Si tu foco hoy es el beneficio tributario y ya quieres aterrizar montos, la calculadora APV es la entrada más útil para revisar escenarios orientativos.",
    {
      label: "Usar calculadora APV →",
      href: "/calculadoras/apv/",
    },
    [{ label: "Leer primero qué es el APV", href: "/posts/que-es-el-apv/" }],
    "Orientación educativa: la simulación APV no reemplaza una revisión tributaria individual."
  ),
  inflationRead: makeResult(
    "inflation-read",
    "Empieza por la guía general para comparar instrumentos",
    "Cuando el foco es proteger valor frente a inflación, todavía importan mucho el plazo y la liquidez. La guía general es mejor punto de partida que una respuesta única demasiado estrecha.",
    {
      label: "Ver guía general de ahorro e inversión →",
      href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/",
    },
    [
      {
        label: "Después revisar DAP en UF vs pesos",
        href: "/posts/deposito-a-plazo-uf-vs-pesos/",
      },
    ]
  ),
  inflationCalc: makeResult(
    "inflation-calc",
    "Parte simulando un DAP y luego amplía la comparación",
    "Si quieres aterrizar números rápido frente a inflación, una simulación de depósito a plazo sirve como primera referencia antes de ampliar la comparación a otros instrumentos.",
    {
      label: "Calcular depósito a plazo →",
      href: "/calculadoras/deposito-a-plazo/",
    },
    [
      {
        label: "Volver a la guía general",
        href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/",
      },
    ],
    "Orientación educativa: esta salida usa el DAP como referencia inicial, no como respuesta universal."
  ),
  shortLiquidityRead: makeResult(
    "short-term-liquidity-read",
    "Parte por comparar DAP en UF versus pesos",
    "Con horizonte corto y prioridad de liquidez, la entrada más clara es entender cuándo un depósito a plazo en UF o en pesos encaja mejor antes de mirar alternativas más volátiles.",
    {
      label: "Leer DAP en UF vs pesos →",
      href: "/posts/deposito-a-plazo-uf-vs-pesos/",
    },
    [
      {
        label: "Ver la guía general del cluster",
        href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/",
      },
    ],
    "Orientación educativa: esta ruta prioriza estabilidad y liquidez, no una recomendación prescriptiva."
  ),
  shortLiquidityCalc: makeResult(
    "short-term-liquidity-calc",
    "Aterriza primero el depósito a plazo",
    "Con horizonte corto y prioridad de liquidez, la mejor entrada para calcular es un depósito a plazo: te permite aterrizar monto, plazo y rendimiento estimado sin agregar más complejidad que la necesaria.",
    {
      label: "Usar calculadora de depósito a plazo →",
      href: "/calculadoras/deposito-a-plazo/",
    },
    [
      {
        label: "Leer DAP en UF vs pesos",
        href: "/posts/deposito-a-plazo-uf-vs-pesos/",
      },
    ],
    "Orientación educativa: una simulación no reemplaza revisar tasa, vencimiento y condiciones reales del producto."
  ),
  extendedLiquidityRead: makeResult(
    "extended-liquidity-read",
    "Empieza por la guía general y luego baja a instrumentos concretos",
    "Si sigues priorizando liquidez para una meta de más de 12 meses, conviene partir por la comparación general antes de cerrar la decisión en un único instrumento.",
    {
      label: "Ver guía general de ahorro e inversión →",
      href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/",
    },
    [
      {
        label: "Luego revisar DAP en UF vs pesos",
        href: "/posts/deposito-a-plazo-uf-vs-pesos/",
      },
    ]
  ),
  extendedLiquidityCalc: makeResult(
    "extended-liquidity-calc",
    "Usa un DAP como referencia y después abre la comparación",
    "Si quieres partir calculando pero todavía priorizas liquidez en una meta de más de 12 meses, un DAP puede servir como referencia base antes de ampliar la comparación.",
    {
      label: "Calcular depósito a plazo →",
      href: "/calculadoras/deposito-a-plazo/",
    },
    [
      {
        label: "Volver a la guía general",
        href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/",
      },
    ],
    "Orientación educativa: esta salida usa un DAP como referencia inicial, no como recomendación cerrada."
  ),
  growthShortHorizon: makeResult(
    "growth-short-horizon",
    "Antes de buscar crecimiento, revisa si el plazo acompaña esa decisión",
    "Si tu foco es crecer pero el horizonte no supera 5 años, la primera tarea es ordenar mejor el plazo, la tolerancia a caídas y la liquidez necesaria antes de entrar a una ruta más agresiva.",
    {
      label: "Ver guía general de ahorro e inversión →",
      href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/",
    },
    [
      {
        label: "Revisar fondo de emergencia",
        href: "/posts/fondo-emergencia-chile/",
      },
    ],
    "Orientación educativa: esta salida evita forzar una respuesta de crecimiento donde el plazo todavía no la sostiene bien."
  ),
  growthLongRead: makeResult(
    "long-term-growth-read",
    "Empieza por entender ETFs desde Chile",
    "Si tu horizonte es largo y tu foco es crecimiento, la entrada más útil es entender cómo funcionan ETFs, costos, custodia e impuestos antes de elegir plataforma o ticker.",
    {
      label: "Leer guía de ETFs desde Chile →",
      href: "/posts/como-invertir-en-etfs-desde-chile/",
    },
    [
      {
        label: "Ver la guía general del cluster",
        href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/",
      },
    ],
    "Orientación educativa: esta salida privilegia estructura y fricciones reales, no proyecciones de retorno."
  ),
  growthLongCalc: makeResult(
    "long-term-growth-fallback",
    "Aclara primero el instrumento antes de simular",
    "Para crecimiento de largo plazo, Monedario hoy tiene mejor cobertura explicativa de entrada que una calculadora específica. Conviene ordenar primero la lógica del instrumento, costos y custodia.",
    {
      label: "Ver guía de ETFs desde Chile →",
      href: "/posts/como-invertir-en-etfs-desde-chile/",
    },
    [
      {
        label: "Volver a la guía general",
        href: "/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/",
      },
    ],
    "Orientación educativa: se evita empujar una simulación que hoy no captura bien la decisión real de entrada."
  ),
} as const;

function buildIntentStep(
  id: string,
  learnResult: WizardResult,
  calculateResult: WizardResult
) {
  return {
    id,
    pregunta: "¿Quieres entender primero o calcular primero?",
    opciones: [
      {
        label: intentLabels.learn,
        profilePatch: intentPatch("learn"),
        resultado: learnResult,
      },
      {
        label: intentLabels.calculate,
        profilePatch: intentPatch("calculate"),
        resultado: calculateResult,
      },
    ],
  };
}

const AHORRO_INVERSION_GUIDE: ArticleEntryGuide = {
  id: "ahorro-inversion-entry-guide",
  eyebrow: "Orientador interactivo",
  title:
    "Antes de elegir instrumento, responde solo las preguntas que cambian la ruta",
  description:
    "Este orientador reduce ruido: si una respuesta no cambia la salida, la pregunta no aparece. La ruta se ajusta según liquidez, plazo, beneficio tributario y nivel de claridad que necesitas.",
  config: {
    id: "ahorro-inversion-entry-guide",
    firstStep: "emergency-fund",
    analytics: {
      startEvent: "entry_guide_start",
      stepEvent: "entry_guide_step",
      completeEvent: "entry_guide_complete",
      ctaClickEvent: "entry_guide_cta_click",
    },
    steps: {
      "emergency-fund": {
        id: "emergency-fund",
        pregunta: "¿Ya tienes fondo de emergencia separado?",
        opciones: [
          {
            label: "No",
            profilePatch: { has_emergency_fund: "no" },
            resultado: RESULTS.emergencyFundFirst,
          },
          {
            label: "Sí",
            profilePatch: { has_emergency_fund: "yes" },
            next: "goal",
          },
        ],
      },
      goal: {
        id: "goal",
        pregunta: "¿Qué te preocupa más hoy?",
        opciones: [
          {
            label: "Ahorrar con beneficio tributario",
            profilePatch: { primary_goal: "tax-benefit" },
            next: "intent-apv",
          },
          {
            label: "Ganarle a la inflación",
            profilePatch: { primary_goal: "inflation" },
            next: "intent-inflation",
          },
          {
            label: "No perder / mantener liquidez",
            profilePatch: { primary_goal: "liquidity" },
            next: "horizon-liquidity",
          },
          {
            label: "Crecer a largo plazo",
            profilePatch: { primary_goal: "growth" },
            next: "horizon-growth",
          },
        ],
      },
      "intent-apv": buildIntentStep(
        "intent-apv",
        RESULTS.apvRead,
        RESULTS.apvCalc
      ),
      "intent-inflation": buildIntentStep(
        "intent-inflation",
        RESULTS.inflationRead,
        RESULTS.inflationCalc
      ),
      "horizon-liquidity": {
        id: "horizon-liquidity",
        pregunta: "¿Para cuándo necesitas esta plata?",
        opciones: [
          {
            label: "Menos de 12 meses",
            profilePatch: { time_horizon: "short-term" },
            next: "intent-liquidity-short",
          },
          {
            label: "Más de 12 meses",
            profilePatch: { time_horizon: "medium-term" },
            next: "intent-liquidity-extended",
          },
        ],
      },
      "intent-liquidity-short": buildIntentStep(
        "intent-liquidity-short",
        RESULTS.shortLiquidityRead,
        RESULTS.shortLiquidityCalc
      ),
      "intent-liquidity-extended": buildIntentStep(
        "intent-liquidity-extended",
        RESULTS.extendedLiquidityRead,
        RESULTS.extendedLiquidityCalc
      ),
      "horizon-growth": {
        id: "horizon-growth",
        pregunta: "¿Para cuándo necesitas esta plata?",
        opciones: [
          {
            label: "Más de 5 años",
            profilePatch: { time_horizon: "long-term" },
            next: "intent-growth-long",
          },
          {
            label: "5 años o menos",
            profilePatch: { time_horizon: "medium-term" },
            resultado: RESULTS.growthShortHorizon,
          },
        ],
      },
      "intent-growth-long": buildIntentStep(
        "intent-growth-long",
        RESULTS.growthLongRead,
        RESULTS.growthLongCalc
      ),
    },
  },
};

export const ARTICLE_ENTRY_GUIDES: Readonly<Record<string, ArticleEntryGuide>> =
  {
    [AHORRO_INVERSION_GUIDE.id]: AHORRO_INVERSION_GUIDE,
  };

export function getArticleEntryGuide(
  id: string | null | undefined
): ArticleEntryGuide | null {
  if (!id) return null;
  return ARTICLE_ENTRY_GUIDES[id] ?? null;
}
