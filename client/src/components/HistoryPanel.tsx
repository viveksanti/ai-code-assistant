import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadHistory, removeHistoryItem, clearAllHistory } from "../store/historySlice";
import { loadFromHistory } from "../store/codeSlice";
import { LANGUAGE_LABELS } from "../types";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function HistoryPanel() {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((s) => s.history);

  useEffect(() => {
    dispatch(loadHistory());
  }, [dispatch]);

  if (isLoading && items.length === 0) {
    return <p className="history__empty">Loading history...</p>;
  }

  if (items.length === 0) {
    return <p className="history__empty">No past runs yet — try an action above.</p>;
  }

  return (
    <div className="history">
      <div className="history__header">
        <span>{items.length} saved</span>
        <button className="btn btn--ghost" onClick={() => dispatch(clearAllHistory())}>
          Clear all
        </button>
      </div>
      <ul className="history__list">
        {items.map((item) => (
          <li key={item.id} className="history__item">
            <button
              className="history__item-main"
              onClick={() =>
                dispatch(
                  loadFromHistory({
                    code: item.code,
                    language: item.language,
                    result: item.result,
                    historyAction: item.action,
                  })
                )
              }
            >
              <span className="history__badge">{item.action}</span>
              <span className="history__lang">{LANGUAGE_LABELS[item.language] ?? item.language}</span>
              <span className="history__snippet">{item.code.slice(0, 60).replace(/\n/g, " ")}</span>
              <span className="history__time">{timeAgo(item.createdAt)}</span>
            </button>
            <button
              className="history__delete"
              aria-label="Delete this entry"
              onClick={() => dispatch(removeHistoryItem(item.id))}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}