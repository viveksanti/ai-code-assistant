import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCode } from "../store/codeSlice";

export function CodeEditor() {
  const dispatch = useAppDispatch();
  const code = useAppSelector((s) => s.code.code);
  const detectedLanguage = useAppSelector((s) => s.code.detectedLanguage);
  const selectedLanguage = useAppSelector((s) => s.code.selectedLanguage);

  let status: "idle" | "match" | "mismatch" = "idle";
  if (detectedLanguage && detectedLanguage !== "unknown") {
    status = detectedLanguage === selectedLanguage ? "match" : "mismatch";
  }

  const lineCount = code ? code.split("\n").length : 1;

  return (
    <div className="editor">
      <div className={`editor__gutter editor__gutter--${status}`} aria-hidden="true" />
      <textarea
        className="editor__textarea"
        placeholder="Paste your code here..."
        spellCheck={false}
        value={code}
        onChange={(e) => dispatch(setCode(e.target.value))}
      />
      <div className="editor__footer">
        <span>{lineCount} lines</span>
        <span>{code.length} chars</span>
      </div>
    </div>
  );
}
