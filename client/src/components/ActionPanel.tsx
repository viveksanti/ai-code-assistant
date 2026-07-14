import { useAppDispatch, useAppSelector } from "../store/hooks";
import { runAnalyzeCode, runDetectLanguage } from "../store/codeSlice";
import { CodeAction } from "../types";

const ACTIONS: { key: CodeAction; label: string }[] = [
  { key: "optimize", label: "Optimize" },
  { key: "refactor", label: "Refactor" },
  { key: "explain", label: "Explain" },
  { key: "suggest", label: "Suggest improvements" },
];

export function ActionPanel() {
  const dispatch = useAppDispatch();
  const code = useAppSelector((s) => s.code.code);
  const selectedLanguage = useAppSelector((s) => s.code.selectedLanguage);
  const isAnalyzing = useAppSelector((s) => s.code.isAnalyzing);
  const isDetecting = useAppSelector((s) => s.code.isDetecting);
  const activeAction = useAppSelector((s) => s.code.activeAction);

  const disabled = !code.trim();

  return (
    <div className="action-panel">
      <button
        className="btn btn--secondary"
        disabled={disabled || isDetecting}
        onClick={() => dispatch(runDetectLanguage(code))}
      >
        {isDetecting ? "Checking..." : "Verify language"}
      </button>

      <div className="action-panel__divider" />

      {ACTIONS.map(({ key, label }) => (
        <button
          key={key}
          className="btn btn--primary"
          disabled={disabled || isAnalyzing}
          onClick={() => dispatch(runAnalyzeCode({ code, language: selectedLanguage, action: key }))}
        >
          {isAnalyzing && activeAction === key ? "Working..." : label}
        </button>
      ))}
    </div>
  );
}
