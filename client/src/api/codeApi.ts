import axios from "axios";
import { AnalyzeResponse, CodeAction, DetectLanguageResponse } from "../types";

const client = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (err.message) return err.message;
  }
  return "Something went wrong. Please try again.";
}

export async function analyzeCode(
  code: string,
  language: string,
  action: CodeAction
): Promise<AnalyzeResponse> {
  try {
    const { data } = await client.post<AnalyzeResponse>("/analyze", {
      code,
      language,
      action,
    });
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function detectLanguage(code: string): Promise<DetectLanguageResponse> {
  try {
    const { data } = await client.post<DetectLanguageResponse>("/detect-language", {
      code,
    });
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}
