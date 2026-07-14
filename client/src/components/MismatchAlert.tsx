import { useAppDispatch, useAppSelector } from "../store/hooks";
import { dismissMismatchAlert, switchToDetectedLanguage } from "../store/codeSlice";
import { LANGUAGE_LABELS } from "../types";

export function MismatchAlert() {
  const dispatch = useAppDispatch();
  const showMismatchAlert = useAppSelector((s) => s.code.showMismatchAlert);
  const detectedLanguage = useAppSelector((s) => s.code.detectedLanguage);
  const selectedLanguage = useAppSelector((s) => s.code.selectedLanguage);

  if (!showMismatchAlert || !detectedLanguage) return null;

  const detectedLabel = LANGUAGE_LABELS[detectedLanguage] ?? detectedLanguage;
  const selectedLabel = LANGUAGE_LABELS[selectedLanguage] ?? selectedLanguage;

  return (
    <div className="alert" role="alert">
      <div className="alert__icon">!</div>
      <div className="alert__body">
        <p className="alert__title">This looks like {detectedLabel}, not {selectedLabel}</p>
        <p className="alert__subtitle">
          You selected {selectedLabel}, but the pasted code matches {detectedLabel} more
          closely. Switch the selected language to get an accurate result.
        </p>
      </div>
      <div className="alert__actions">
        <button className="btn btn--warning" onClick={() => dispatch(switchToDetectedLanguage())}>
          Switch to {detectedLabel}
        </button>
        <button className="btn btn--ghost" onClick={() => dispatch(dismissMismatchAlert())}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
