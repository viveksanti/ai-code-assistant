import { GoogleGenAI } from "@google/genai";
import { CodeAction } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Flash is the model Google keeps on the free tier (fast + generous rate limits).
// Swap to "gemini-2.5-pro" if you enable billing and want stronger reasoning.
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

const ACTION_INSTRUCTIONS: Record<CodeAction, string> = {
  optimize:
    "Optimise this code for performance and efficiency. Keep the same external " +
    "behaviour. Return the optimised code in a fenced code block first, then a short " +
    "bullet list explaining each change and why it helps.",
  refactor:
    "Refactor this code for readability, maintainability, and best practices " +
    "(naming, structure, duplication, error handling). Keep the same external " +
    "behaviour. Return the refactored code in a fenced code block first, then a " +
    "short bullet list explaining each change.",
  explain:
    "Explain what this code does, step by step, in plain language. Cover the overall " +
    "purpose, then walk through the key parts. Do not rewrite the code.",
  suggest:
    "Review this code and suggest concrete improvements: bugs, edge cases, security " +
    "issues, style, and performance. Return a prioritised bullet list of suggestions " +
    "with a one-line reason for each. Do not rewrite the whole file.",
};

export async function analyzeCode(
  code: string,
  language: string,
  action: CodeAction
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set on the server. Add it to server/.env and restart."
    );
  }

  const instruction = ACTION_INSTRUCTIONS[action];

  const prompt = `You are a senior ${language} engineer helping a developer with a code snippet.

Language: ${language}
Task: ${instruction}

Snippet:
\`\`\`${language}
${code}
\`\`\`
`;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text;

    return text?.trim() || "The model returned an empty response. Please try again.";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("NOT_FOUND") || message.includes("no longer available")) {
      throw new Error(
        `Model "${MODEL}" isn't available right now. Try setting GEMINI_MODEL to a ` +
          `different model in server/.env and restart the server.`
      );
    }
    throw err;
  }
}
