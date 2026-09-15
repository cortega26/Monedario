const STORAGE_KEY = "monedario_resume";
const MAX_PAGES = 3;

export interface ResumedPage {
  url: string;
  title: string;
  ts: number;
}

export interface ResumedCalculator {
  id: string;
  label: string;
  ts: number;
}

export interface ResumeData {
  pages: ResumedPage[];
  calculator?: ResumedCalculator;
}

function isResumedPage(value: unknown): value is ResumedPage {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const page = value as Record<string, unknown>;
  return (
    typeof page.url === "string" &&
    typeof page.title === "string" &&
    typeof page.ts === "number" &&
    Number.isFinite(page.ts)
  );
}

function isResumedCalculator(value: unknown): value is ResumedCalculator {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const calculator = value as Record<string, unknown>;
  return (
    typeof calculator.id === "string" &&
    typeof calculator.label === "string" &&
    typeof calculator.ts === "number" &&
    Number.isFinite(calculator.ts)
  );
}

function load(): ResumeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pages: [] };
    const parsed = JSON.parse(raw) as Partial<ResumeData> | null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { pages: [] };
    }
    if (!Array.isArray(parsed.pages)) return { pages: [] };
    const data: ResumeData = { pages: parsed.pages.filter(isResumedPage) };
    if (
      parsed.calculator !== undefined &&
      isResumedCalculator(parsed.calculator)
    ) {
      data.calculator = parsed.calculator;
    }
    return data;
  } catch {
    return { pages: [] };
  }
}

function save(data: ResumeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors (private mode, quota exceeded)
  }
}

export function savePageVisit(url: string, title: string): void {
  const data = load();
  // Remove duplicate if same URL
  const filtered = data.pages.filter(p => p.url !== url);
  filtered.unshift({ url, title, ts: Date.now() });
  data.pages = filtered.slice(0, MAX_PAGES);
  save(data);
}

export function saveCalculatorResult(id: string, label: string): void {
  const data = load();
  data.calculator = { id, label, ts: Date.now() };
  save(data);
}

export function getResumeData(): ResumeData {
  return load();
}

export function clearResumeData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
