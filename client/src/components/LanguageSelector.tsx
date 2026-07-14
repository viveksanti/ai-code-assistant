import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSelectedLanguage } from "../store/codeSlice";
import { LANGUAGES, LANGUAGE_LABELS } from "../types";

export function LanguageSelector() {
  const dispatch = useAppDispatch();
  const selectedLanguage = useAppSelector((s) => s.code.selectedLanguage);

  return (
    <label className="lang-select">
      <span className="lang-select__label">Language</span>
      <select
        value={selectedLanguage}
        onChange={(e) => dispatch(setSelectedLanguage(e.target.value))}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_LABELS[lang]}
          </option>
        ))}
      </select>
    </label>
  );
}
