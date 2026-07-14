import { useAppSelector } from "../store/hooks";

interface Segment {
  type: "code" | "text";
  content: string;
  lang?: string;
}

function splitIntoSegments(markdown: string): Segment[] {
  const segments: Segment[] = [];
  const fenceRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(markdown)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: markdown.slice(lastIndex, match.index) });
    }
    segments.push({ type: "code", lang: match[1], content: match[2].replace(/\n$/, "") });
    lastIndex = fenceRegex.lastIndex;
  }
  if (lastIndex < markdown.length) {
    segments.push({ type: "text", content: markdown.slice(lastIndex) });
  }
  return segments;
}

export function ResultPanel() {
  const result = useAppSelector((s) => s.code.result);
  const error = useAppSelector((s) => s.code.error);
  const isAnalyzing = useAppSelector((s) => s.code.isAnalyzing);
  const activeAction = useAppSelector((s) => s.code.activeAction);

  if (isAnalyzing) {
    return (
      <div className="result result--empty">
        <div className="spinner" aria-hidden="true" />
        <p>Asking AI to {activeAction} your code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result result--error">
        <p className="result__title">Something went wrong</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result result--empty">
        <p>Paste some code, pick a language, then choose an action above to see results here.</p>
      </div>
    );
  }

  const segments = splitIntoSegments(result);

  return (
    <div className="result">
      {segments.map((segment, i) =>
        segment.type === "code" ? (
          <pre className="result__code" key={i}>
            <code>{segment.content}</code>
          </pre>
        ) : (
          <p className="result__text" key={i}>
            {segment.content.trim()}
          </p>
        )
      )}
    </div>
  );
}
