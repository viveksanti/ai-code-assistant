export type CodeAction = "optimize" | "refactor" | "explain" | "suggest";

export interface AnalyzeRequestBody {
  code: string;
  language: string;
  action: CodeAction;
}

export interface AnalyzeResponseBody {
  action: CodeAction;
  language: string;
  result: string;
}

export interface DetectLanguageRequestBody {
  code: string;
}

export interface DetectLanguageResponseBody {
  detectedLanguage: string;
  confidence: number;
  scores: Record<string, number>;
}

export interface ApiErrorBody {
  error: string;
}
