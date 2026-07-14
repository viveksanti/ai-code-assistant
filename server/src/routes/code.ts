import { Router, Request, Response } from "express";
import { analyzeCode } from "../services/aiService";
import { detectLanguage, SUPPORTED_LANGUAGES } from "../services/languageDetector";
import {
  AnalyzeRequestBody,
  AnalyzeResponseBody,
  ApiErrorBody,
  CodeAction,
  DetectLanguageRequestBody,
  DetectLanguageResponseBody,
} from "../types";

const router = Router();

const VALID_ACTIONS: CodeAction[] = ["optimize", "refactor", "explain", "suggest"];

router.post(
  "/analyze",
  async (
    req: Request<{}, AnalyzeResponseBody | ApiErrorBody, AnalyzeRequestBody>,
    res: Response<AnalyzeResponseBody | ApiErrorBody>
  ) => {
    const { code, language, action } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: "Paste some code before running this action." });
    }
    if (!language || typeof language !== "string") {
      return res.status(400).json({ error: "Select a programming language first." });
    }
    if (!action || !VALID_ACTIONS.includes(action)) {
      return res
        .status(400)
        .json({ error: `Action must be one of: ${VALID_ACTIONS.join(", ")}` });
    }

    try {
      const result = await analyzeCode(code, language, action);
      return res.json({ action, language, result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error calling the AI service.";
      return res.status(502).json({ error: message });
    }
  }
);

router.post(
  "/detect-language",
  (
    req: Request<{}, DetectLanguageResponseBody | ApiErrorBody, DetectLanguageRequestBody>,
    res: Response<DetectLanguageResponseBody | ApiErrorBody>
  ) => {
    const { code } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: "Paste some code before verifying the language." });
    }

    const { detectedLanguage, confidence, scores } = detectLanguage(code);
    return res.json({ detectedLanguage, confidence, scores });
  }
);

router.get("/languages", (_req: Request, res: Response) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});

export default router;
