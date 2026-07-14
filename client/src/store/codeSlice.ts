import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { analyzeCode, detectLanguage } from "../api/codeApi";
import { CodeAction } from "../types";

interface CodeState {
  code: string;
  selectedLanguage: string;
  detectedLanguage: string | null;
  detectionConfidence: number;
  showMismatchAlert: boolean;
  activeAction: CodeAction | null;
  result: string | null;
  isAnalyzing: boolean;
  isDetecting: boolean;
  error: string | null;
}

const initialState: CodeState = {
  code: "",
  selectedLanguage: "javascript",
  detectedLanguage: null,
  detectionConfidence: 0,
  showMismatchAlert: false,
  activeAction: null,
  result: null,
  isAnalyzing: false,
  isDetecting: false,
  error: null,
};

export const runDetectLanguage = createAsyncThunk(
  "code/runDetectLanguage",
  async (code: string) => {
    return await detectLanguage(code);
  }
);

export const runAnalyzeCode = createAsyncThunk(
  "code/runAnalyzeCode",
  async ({ code, language, action }: { code: string; language: string; action: CodeAction }) => {
    return await analyzeCode(code, language, action);
  }
);

const codeSlice = createSlice({
  name: "code",
  initialState,
  reducers: {
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
      // Once the snippet changes, any previous mismatch/result is stale.
      state.showMismatchAlert = false;
      state.detectedLanguage = null;
    },
    setSelectedLanguage(state, action: PayloadAction<string>) {
      state.selectedLanguage = action.payload;
      state.showMismatchAlert = false;
    },
    switchToDetectedLanguage(state) {
      if (state.detectedLanguage && state.detectedLanguage !== "unknown") {
        state.selectedLanguage = state.detectedLanguage;
      }
      state.showMismatchAlert = false;
    },
    dismissMismatchAlert(state) {
      state.showMismatchAlert = false;
    },
    clearResult(state) {
      state.result = null;
      state.activeAction = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runDetectLanguage.pending, (state) => {
        state.isDetecting = true;
        state.error = null;
      })
      .addCase(runDetectLanguage.fulfilled, (state, action) => {
        state.isDetecting = false;
        state.detectedLanguage = action.payload.detectedLanguage;
        state.detectionConfidence = action.payload.confidence;
        const detected = action.payload.detectedLanguage;
        state.showMismatchAlert =
          detected !== "unknown" && detected !== state.selectedLanguage;
      })
      .addCase(runDetectLanguage.rejected, (state, action) => {
        state.isDetecting = false;
        state.error = action.error.message ?? "Could not verify the language.";
      })
      .addCase(runAnalyzeCode.pending, (state, action) => {
        state.isAnalyzing = true;
        state.activeAction = action.meta.arg.action;
        state.error = null;
        state.result = null;
      })
      .addCase(runAnalyzeCode.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.result = action.payload.result;
      })
      .addCase(runAnalyzeCode.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.error.message ?? "The AI service could not be reached.";
      });
  },
});

export const {
  setCode,
  setSelectedLanguage,
  switchToDetectedLanguage,
  dismissMismatchAlert,
  clearResult,
} = codeSlice.actions;

export default codeSlice.reducer;
