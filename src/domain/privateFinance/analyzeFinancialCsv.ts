export type TransactionDirection = "income" | "expense";

export interface AnalyzedTransaction {
  date: string | null;
  description: string;
  amount: number;
  direction: TransactionDirection;
  category: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  transactionCount: number;
}

export interface PrivateFinanceSummary {
  transactionCount: number;
  ignoredRows: number;
  income: number;
  expenses: number;
  net: number;
  categories: CategorySummary[];
  detectedColumns: {
    date: string | null;
    description: string | null;
    amount: string | null;
    debit: string | null;
    credit: string | null;
    movementType: string | null;
  };
}

const MAX_ROWS = 100_000;

const HEADER_ALIASES = {
  date: ["fecha", "date", "fecha movimiento", "fecha transaccion"],
  description: [
    "descripcion",
    "detalle",
    "glosa",
    "concepto",
    "comercio",
    "merchant",
    "description",
  ],
  amount: ["monto", "importe", "valor", "amount", "total"],
  debit: ["cargo", "debito", "egreso", "debit", "retiro"],
  credit: ["abono", "credito", "ingreso", "credit", "deposito"],
  movementType: ["tipo", "tipo movimiento", "movimiento", "naturaleza"],
} as const;

const CATEGORY_RULES: Array<{ category: string; pattern: RegExp }> = [
  {
    category: "Supermercado",
    pattern: /\b(lider|jumbo|unimarc|tottus|acuenta|supermercado)\b/i,
  },
  {
    category: "Alimentación",
    pattern:
      /\b(restaurante?|restaurant|rappi|pedidosya|uber\s*eats|cafeteria|cafe|starbucks)\b/i,
  },
  {
    category: "Transporte",
    pattern:
      /\b(copec|shell|petrobras|uber|cabify|metro|transantiago|red\s+movilidad|estacionamiento|parking|bencina|combustible)\b/i,
  },
  {
    category: "Servicios",
    pattern:
      /\b(enel|metrogas|entel|movistar|wom|claro|internet|electricidad|agua|gas)\b/i,
  },
  {
    category: "Salud",
    pattern:
      /\b(farmacia|salcobrand|cruz\s+verde|ahumada|clinica|hospital|centro\s+medico|medic[oa])\b/i,
  },
  {
    category: "Vivienda",
    pattern: /\b(arriendo|hipotec|dividendo|gasto\s+comun|gastos\s+comunes)\b/i,
  },
  {
    category: "Comisiones e intereses",
    pattern: /\b(comision|mantencion|mantenimiento|interes|impuesto)\b/i,
  },
  {
    category: "Entretenimiento",
    pattern:
      /\b(netflix|spotify|disney|prime\s+video|cine|steam|playstation)\b/i,
  },
  {
    category: "Transferencias",
    pattern: /\b(transferencia|transfer|traspaso)\b/i,
  },
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function countDelimiterOutsideQuotes(line: string, delimiter: string): number {
  let count = 0;
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && char === delimiter) {
      count += 1;
    }
  }

  return count;
}

function detectDelimiter(csv: string): string {
  const firstLogicalLine = csv.split(/\r?\n/, 1)[0] ?? "";
  const candidates = [";", ",", "\t"];
  return (
    candidates
      .map(delimiter => ({
        delimiter,
        count: countDelimiterOutsideQuotes(firstLogicalLine, delimiter),
      }))
      .sort((a, b) => b.count - a.count)[0]?.delimiter ?? ","
  );
}

export function parseCsvRows(csv: string): string[][] {
  const delimiter = detectDelimiter(csv);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const pushField = () => {
    row.push(field.trim());
    field = "";
  };

  const pushRow = () => {
    if (row.some(value => value.length > 0)) {
      rows.push(row);
      if (rows.length > MAX_ROWS + 1) {
        throw new Error(
          `El archivo supera el máximo de ${MAX_ROWS.toLocaleString("es-CL")} filas del MVP.`
        );
      }
    }
    row = [];
  };

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];

    if (char === '"') {
      if (quoted && csv[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && char === delimiter) {
      pushField();
      continue;
    }

    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && csv[i + 1] === "\n") i += 1;
      pushField();
      pushRow();
      continue;
    }

    field += char;
  }

  if (quoted) {
    throw new Error("El CSV contiene una comilla sin cerrar.");
  }

  pushField();
  pushRow();

  return rows;
}

export function parseMoney(rawValue: string): number | null {
  const raw = rawValue
    .replace(/\u00a0/g, " ")
    .replace(/CLP|\$/gi, "")
    .replace(/\s+/g, "")
    .trim();

  if (!raw) return null;

  const parenthesesNegative = raw.startsWith("(") && raw.endsWith(")");
  let cleaned = raw.replace(/[()]/g, "");
  const explicitNegative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/^[+-]/, "");

  if (!/^[0-9.,]+$/.test(cleaned) || !/\d/.test(cleaned)) return null;

  const commaCount = (cleaned.match(/,/g) ?? []).length;
  const dotCount = (cleaned.match(/\./g) ?? []).length;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized: string;

  if (commaCount > 0 && dotCount > 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    const decimalCount = decimalSeparator === "," ? commaCount : dotCount;

    if (decimalCount !== 1) return null;

    const decimalIndex = cleaned.lastIndexOf(decimalSeparator);
    const integerRaw = cleaned.slice(0, decimalIndex);
    const decimalPart = cleaned.slice(decimalIndex + 1);

    if (!/^\d{1,2}$/.test(decimalPart)) return null;

    const integerGroups = integerRaw.split(thousandsSeparator);
    if (
      integerGroups.length > 1 &&
      (!/^\d{1,3}$/.test(integerGroups[0]) ||
        integerGroups.slice(1).some(group => !/^\d{3}$/.test(group)))
    ) {
      return null;
    }

    if (integerGroups.length === 1 && !/^\d+$/.test(integerGroups[0] ?? "")) {
      return null;
    }

    normalized = `${integerGroups.join("")}.${decimalPart}`;
  } else if (commaCount > 0 || dotCount > 0) {
    const separator = commaCount > 0 ? "," : ".";
    const groups = cleaned.split(separator);

    if (groups.some(group => !/^\d+$/.test(group))) return null;

    if (groups.length === 2 && /^\d{1,2}$/.test(groups[1] ?? "")) {
      normalized = `${groups[0]}.${groups[1]}`;
    } else {
      if (
        !/^\d{1,3}$/.test(groups[0] ?? "") ||
        groups.slice(1).some(group => !/^\d{3}$/.test(group))
      ) {
        return null;
      }
      normalized = groups.join("");
    }
  } else {
    normalized = cleaned;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed > Number.MAX_SAFE_INTEGER) return null;

  return parenthesesNegative || explicitNegative ? -parsed : parsed;
}

function findColumn(
  headers: string[],
  aliases: readonly string[],
  label: string
): number | null {
  const normalizedAliases = new Set(aliases.map(normalizeText));
  const matches = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => normalizedAliases.has(normalizeText(header)));

  if (matches.length > 1) {
    throw new Error(
      `Detecté más de una columna compatible con ${label}: ${matches
        .map(({ header }) => `"${header}"`)
        .join(", ")}. Elimina la ambigüedad antes de analizar el archivo.`
    );
  }

  return matches[0]?.index ?? null;
}

function parseMoneyField(rawValue: string, label: string): number | null {
  if (!rawValue.trim()) return null;

  const parsed = parseMoney(rawValue);
  if (parsed === null) {
    throw new Error(
      `No pude interpretar el valor "${rawValue}" en la columna ${label}.`
    );
  }

  return parsed;
}

function movementDirection(value: string): TransactionDirection | null {
  const normalized = normalizeText(value);
  if (/\b(cargo|debito|egreso|retiro|compra)\b/.test(normalized)) {
    return "expense";
  }
  if (/\b(abono|credito|ingreso|deposito)\b/.test(normalized)) {
    return "income";
  }
  return null;
}

function categorize(description: string): string {
  const normalized = normalizeText(description);
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(normalized)) return rule.category;
  }
  return "Otros";
}

function cell(row: string[], index: number | null): string {
  return index === null ? "" : (row[index] ?? "");
}

export function analyzeFinancialCsv(csv: string): PrivateFinanceSummary {
  if (!csv.trim()) throw new Error("El archivo está vacío.");

  const rows = parseCsvRows(csv);
  if (rows.length < 2) {
    throw new Error(
      "El CSV necesita una fila de encabezados y al menos un movimiento."
    );
  }

  const headers = rows[0];
  const dateIndex = findColumn(headers, HEADER_ALIASES.date, "fecha");
  const descriptionIndex = findColumn(
    headers,
    HEADER_ALIASES.description,
    "descripción"
  );
  const amountIndex = findColumn(headers, HEADER_ALIASES.amount, "monto");
  const debitIndex = findColumn(headers, HEADER_ALIASES.debit, "cargo/débito");
  const creditIndex = findColumn(
    headers,
    HEADER_ALIASES.credit,
    "abono/crédito"
  );
  const movementTypeIndex = findColumn(
    headers,
    HEADER_ALIASES.movementType,
    "tipo de movimiento"
  );

  if (amountIndex === null && debitIndex === null && creditIndex === null) {
    throw new Error(
      "No pude detectar una columna de monto, cargo/débito o abono/crédito."
    );
  }

  const hasDebitCreditColumns = debitIndex !== null || creditIndex !== null;
  let positiveOnlyAmountColumn = false;

  if (amountIndex !== null && !hasDebitCreditColumns) {
    const amounts = rows
      .slice(1)
      .map(row =>
        parseMoneyField(cell(row, amountIndex), headers[amountIndex] ?? "Monto")
      )
      .filter((amount): amount is number => amount !== null && amount !== 0);

    positiveOnlyAmountColumn =
      amounts.length > 0 && amounts.every(amount => amount > 0);

    if (positiveOnlyAmountColumn && movementTypeIndex === null) {
      throw new Error(
        "La columna de monto no indica qué movimientos son cargos. Usa montos con signo o incluye una columna Tipo, Cargo/Débito o Abono/Crédito."
      );
    }
  }

  const transactions: AnalyzedTransaction[] = [];
  let ignoredRows = 0;

  for (const row of rows.slice(1)) {
    let signedAmount: number | null = null;

    const debit = parseMoneyField(
      cell(row, debitIndex),
      debitIndex === null ? "Cargo/Débito" : headers[debitIndex]
    );
    const credit = parseMoneyField(
      cell(row, creditIndex),
      creditIndex === null ? "Abono/Crédito" : headers[creditIndex]
    );

    if (debit !== null && debit !== 0 && credit !== null && credit !== 0) {
      throw new Error(
        "Encontré una fila con cargo y abono simultáneos. Corrige esa fila antes de analizar el archivo."
      );
    }

    if (debitIndex !== null || creditIndex !== null) {
      if (credit !== null && credit !== 0) signedAmount = Math.abs(credit);
      else if (debit !== null && debit !== 0) signedAmount = -Math.abs(debit);
    }

    if (signedAmount === null && amountIndex !== null) {
      const amount = parseMoneyField(
        cell(row, amountIndex),
        headers[amountIndex] ?? "Monto"
      );

      if (amount !== null && amount !== 0) {
        const rawMovementType = cell(row, movementTypeIndex).trim();
        const explicitDirection =
          rawMovementType.length > 0
            ? movementDirection(rawMovementType)
            : null;

        if (rawMovementType && !explicitDirection) {
          throw new Error(
            `No pude interpretar el tipo de movimiento "${rawMovementType}". Revisa esa fila o usa cargos y abonos separados.`
          );
        }

        if (positiveOnlyAmountColumn && !explicitDirection) {
          throw new Error(
            "La columna de monto usa sólo valores positivos y encontré una fila sin tipo de movimiento. Completa el tipo o usa cargos y abonos separados."
          );
        }

        if (amount < 0 && explicitDirection === "income") {
          throw new Error(
            "Encontré un monto negativo marcado como ingreso/abono. Corrige la contradicción antes de analizar el archivo."
          );
        }

        if (explicitDirection === "expense") {
          signedAmount = -Math.abs(amount);
        } else if (explicitDirection === "income") {
          signedAmount = Math.abs(amount);
        } else {
          signedAmount = amount;
        }
      }
    }

    if (signedAmount === null || signedAmount === 0) {
      ignoredRows += 1;
      continue;
    }

    const description =
      cell(row, descriptionIndex).trim() || "Movimiento sin descripción";
    const direction: TransactionDirection =
      signedAmount < 0 ? "expense" : "income";

    transactions.push({
      date: cell(row, dateIndex).trim() || null,
      description,
      amount: Math.abs(signedAmount),
      direction,
      category: direction === "expense" ? categorize(description) : "Ingresos",
    });
  }

  if (transactions.length === 0) {
    throw new Error("No encontré movimientos con montos utilizables.");
  }

  const income = transactions
    .filter(transaction => transaction.direction === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = transactions
    .filter(transaction => transaction.direction === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const categoryMap = new Map<
    string,
    { amount: number; transactionCount: number }
  >();

  for (const transaction of transactions) {
    if (transaction.direction !== "expense") continue;
    const current = categoryMap.get(transaction.category) ?? {
      amount: 0,
      transactionCount: 0,
    };
    current.amount += transaction.amount;
    current.transactionCount += 1;
    categoryMap.set(transaction.category, current);
  }

  const categories = [...categoryMap.entries()]
    .map(([category, value]) => ({ category, ...value }))
    .sort((a, b) => b.amount - a.amount);

  return {
    transactionCount: transactions.length,
    ignoredRows,
    income,
    expenses,
    net: income - expenses,
    categories,
    detectedColumns: {
      date: dateIndex === null ? null : headers[dateIndex],
      description: descriptionIndex === null ? null : headers[descriptionIndex],
      amount: amountIndex === null ? null : headers[amountIndex],
      debit: debitIndex === null ? null : headers[debitIndex],
      credit: creditIndex === null ? null : headers[creditIndex],
      movementType:
        movementTypeIndex === null ? null : headers[movementTypeIndex],
    },
  };
}
