// quick and dirty language guesser - scores the snippet against a bunch of regex
// patterns per language and picks whichever scores highest. no LLM call needed for
// this, keeps "verify language" instant.

interface Signal {
  pattern: RegExp;
  weight: number;
}

const SIGNALS: Record<string, Signal[]> = {
  typescript: [
    { pattern: /:\s*(string|number|boolean|any|void|unknown|never)\b/, weight: 3 },
    { pattern: /\binterface\s+\w+/, weight: 3 },
    { pattern: /\btype\s+\w+\s*=/, weight: 2 },
    { pattern: /\bimplements\s+\w+/, weight: 2 },
    { pattern: /<\w+>\(/, weight: 1 },
    { pattern: /\bexport\s+(default\s+)?(class|function|const|interface|type)/, weight: 1 },
    { pattern: /\bas\s+(string|number|const)\b/, weight: 2 },
    { pattern: /\bpublic\s+|\bprivate\s+|\breadonly\s+/, weight: 2 },
  ],
  javascript: [
    { pattern: /\bconst\s+\w+\s*=|\blet\s+\w+\s*=|\bvar\s+\w+\s*=/, weight: 1 },
    { pattern: /\bfunction\s*\w*\s*\(/, weight: 1 },
    { pattern: /=>\s*{|=>\s*\(/, weight: 1 },
    { pattern: /\brequire\(['"]/, weight: 2 },
    { pattern: /\bmodule\.exports\b/, weight: 2 },
    { pattern: /\bconsole\.log\(/, weight: 1 },
    { pattern: /\bimport\s+.*\s+from\s+['"]/, weight: 1 },
  ],
  python: [
    { pattern: /\bdef\s+\w+\s*\(.*\):/, weight: 3 },
    { pattern: /\bimport\s+\w+(\s+as\s+\w+)?$/m, weight: 2 },
    { pattern: /\bfrom\s+\w+(\.\w+)*\s+import\s+/, weight: 2 },
    { pattern: /:\s*$/m, weight: 1 },
    { pattern: /\bself\b/, weight: 2 },
    { pattern: /\bprint\(/, weight: 1 },
    { pattern: /\belif\b/, weight: 3 },
    { pattern: /^\s*#.*$/m, weight: 0.5 },
    { pattern: /\bNone\b|\bTrue\b|\bFalse\b/, weight: 1 },
  ],
  java: [
    { pattern: /\bpublic\s+(static\s+)?(class|void|int|String)\b/, weight: 3 },
    { pattern: /\bSystem\.out\.println\(/, weight: 3 },
    { pattern: /\bpublic\s+static\s+void\s+main\s*\(\s*String/, weight: 4 },
    { pattern: /\bimport\s+java\./, weight: 3 },
    { pattern: /\bnew\s+\w+\(.*\);/, weight: 1 },
    { pattern: /\bthis\./, weight: 0.5 },
  ],
  csharp: [
    { pattern: /\busing\s+System(\.\w+)*;/, weight: 3 },
    { pattern: /\bConsole\.WriteLine\(/, weight: 3 },
    { pattern: /\bnamespace\s+\w+/, weight: 2 },
    { pattern: /\bpublic\s+(class|static|void|string|int)\b/, weight: 2 },
    { pattern: /\bvar\s+\w+\s*=/, weight: 0.5 },
    { pattern: /\basync\s+Task\b/, weight: 2 },
  ],
  cpp: [
    { pattern: /#include\s*<\w+(\.h)?>/, weight: 3 },
    { pattern: /\bstd::\w+/, weight: 3 },
    { pattern: /\bcout\s*<<|\bcin\s*>>/, weight: 3 },
    { pattern: /\bint\s+main\s*\(/, weight: 2 },
    { pattern: /\bnamespace\s+\w+/, weight: 1 },
    { pattern: /\btemplate\s*<.*>/, weight: 2 },
  ],
  c: [
    { pattern: /#include\s*<stdio\.h>/, weight: 3 },
    { pattern: /\bprintf\(/, weight: 2 },
    { pattern: /\bint\s+main\s*\(\s*(void)?\s*\)/, weight: 2 },
    { pattern: /\bmalloc\(|\bfree\(/, weight: 2 },
    { pattern: /\bstruct\s+\w+\s*{/, weight: 1 },
  ],
  go: [
    { pattern: /\bpackage\s+main\b/, weight: 3 },
    { pattern: /\bfunc\s+\w*\s*\(/, weight: 3 },
    { pattern: /\bfmt\.Print(ln|f)?\(/, weight: 3 },
    { pattern: /:=\s*/, weight: 2 },
    { pattern: /\bimport\s*\(/, weight: 1 },
    { pattern: /\bgo\s+func\s*\(/, weight: 2 },
  ],
  rust: [
    { pattern: /\bfn\s+\w+\s*\(/, weight: 3 },
    { pattern: /\blet\s+mut\s+\w+/, weight: 3 },
    { pattern: /\bprintln!\(/, weight: 3 },
    { pattern: /::<.*>/, weight: 1 },
    { pattern: /\bimpl\s+\w+/, weight: 2 },
    { pattern: /\bmatch\s+\w+\s*{/, weight: 2 },
  ],
  ruby: [
    { pattern: /\bdef\s+\w+(\(.*\))?\s*$/m, weight: 3 },
    { pattern: /\bend\s*$/m, weight: 2 },
    { pattern: /\bputs\s+/, weight: 3 },
    { pattern: /\brequire\s+['"]/, weight: 1 },
    { pattern: /:\w+\s*=>/, weight: 1 },
    { pattern: /\bdo\s*\|.*\|/, weight: 2 },
  ],
  php: [
    { pattern: /<\?php/, weight: 4 },
    { pattern: /\$\w+\s*=/, weight: 2 },
    { pattern: /\becho\s+/, weight: 2 },
    { pattern: /\bfunction\s+\w+\s*\(.*\)\s*{/, weight: 1 },
    { pattern: /->\w+/, weight: 1 },
  ],
  swift: [
    { pattern: /\bfunc\s+\w+\s*\(/, weight: 2 },
    { pattern: /\bvar\s+\w+\s*:\s*\w+/, weight: 2 },
    { pattern: /\blet\s+\w+\s*:\s*\w+/, weight: 2 },
    { pattern: /\bimport\s+(UIKit|SwiftUI|Foundation)/, weight: 3 },
    { pattern: /\bprint\(/, weight: 1 },
    { pattern: /\bguard\s+let\b/, weight: 3 },
  ],
  kotlin: [
    { pattern: /\bfun\s+\w+\s*\(/, weight: 3 },
    { pattern: /\bval\s+\w+\s*(:\s*\w+)?\s*=/, weight: 2 },
    { pattern: /\bvar\s+\w+\s*(:\s*\w+)?\s*=/, weight: 1 },
    { pattern: /\bprintln\(/, weight: 1 },
    { pattern: /\bwhen\s*\(.*\)\s*{/, weight: 2 },
  ],
  html: [
    { pattern: /<!DOCTYPE html>/i, weight: 4 },
    { pattern: /<html[\s>]/i, weight: 3 },
    { pattern: /<div[\s>]|<span[\s>]|<body[\s>]/i, weight: 1 },
  ],
  css: [
    { pattern: /[.#]?[\w-]+\s*{\s*[\w-]+\s*:\s*[^}]+;/, weight: 2 },
    { pattern: /@media\s*\(/, weight: 3 },
    { pattern: /:\s*(hover|focus|active)\b/, weight: 2 },
  ],
  sql: [
    { pattern: /\bSELECT\s+.*\s+FROM\s+/i, weight: 4 },
    { pattern: /\bINSERT\s+INTO\b/i, weight: 3 },
    { pattern: /\bCREATE\s+TABLE\b/i, weight: 3 },
    { pattern: /\bWHERE\b/i, weight: 1 },
    { pattern: /\bJOIN\b/i, weight: 1 },
  ],
};

// TypeScript is a superset of JavaScript, so if both score highly we should prefer
// TypeScript only when TS-specific signals actually fired, not just JS ones.
export function detectLanguage(code: string): {
  detectedLanguage: string;
  confidence: number;
  scores: Record<string, number>;
} {
  const trimmed = code.trim();
  if (!trimmed) {
    return { detectedLanguage: "unknown", confidence: 0, scores: {} };
  }

  const scores: Record<string, number> = {};

  for (const [language, signals] of Object.entries(SIGNALS)) {
    let score = 0;
    for (const { pattern, weight } of signals) {
      if (pattern.test(trimmed)) {
        score += weight;
      }
    }
    scores[language] = score;
  }

  // If JS signals fired but no TS-specific signal fired, zero out typescript so we
  // don't over-detect TS just because it shares syntax with JS.
  if (scores.typescript > 0 && scores.javascript > 0) {
    const tsSpecificFired = SIGNALS.typescript.some(({ pattern }) => pattern.test(trimmed));
    if (!tsSpecificFired) {
      scores.typescript = 0;
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topLanguage, topScore] = sorted[0];
  const total = sorted.reduce((sum, [, s]) => sum + s, 0) || 1;

  if (topScore === 0) {
    return { detectedLanguage: "unknown", confidence: 0, scores };
  }

  return {
    detectedLanguage: topLanguage,
    confidence: Math.min(1, topScore / total + 0.15),
    scores,
  };
}

export const SUPPORTED_LANGUAGES = Object.keys(SIGNALS);
