import { Router, Request, Response } from "express";
import { analyzeCode } from "../services/aiService";
import { detectLanguage, SUPPORTED_LANGUAGES } from "../services/languageDetector";
import { prisma } from "../db/prisma";
import {
  AnalyzeRequestBody,
  AnalyzeResponseBody,
  ApiErrorBody,
  CodeAction,
  DetectLanguageRequestBody,
  DetectLanguageResponseBody,
  HistoryListResponse,
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

      // save history, but don't let a db hiccup break the actual response
      try {
        await prisma.analysisHistory.create({
          data: { code, language, action, result },
        });
      } catch (dbErr) {
        console.error("Failed to save history:", dbErr);
      }

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

// --- history routes ---

router.get(
  "/history",
  async (_req: Request, res: Response<HistoryListResponse | ApiErrorBody>) => {
    try {
      const items = await prisma.analysisHistory.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return res.json({
        items: items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
      });
    } catch (err) {
      return res.status(500).json({ error: "Could not load history." });
    }
  }
);

router.delete("/history/:id", async (req: Request, res: Response<ApiErrorBody | { ok: true }>) => {
  try {
    await prisma.analysisHistory.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(404).json({ error: "History entry not found." });
  }
});

router.delete("/history", async (_req: Request, res: Response<ApiErrorBody | { ok: true }>) => {
  try {
    await prisma.analysisHistory.deleteMany({});
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Could not clear history." });
  }
});

export default router;