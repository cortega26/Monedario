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

function load(): ResumeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pages: [] };
    return JSON.parse(raw) as ResumeData;
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
