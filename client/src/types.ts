export type CodeAction = "optimize" | "refactor" | "explain" | "suggest";

export const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "html",
  "css",
  "sql",
] as const;

export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  c: "C",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  unknown: "Unknown",
};

export interface AnalyzeResponse {
  action: CodeAction;
  language: string;
  result: string;
}

export interface DetectLanguageResponse {
  detectedLanguage: string;
  confidence: number;
  scores: Record<string, number>;
}
