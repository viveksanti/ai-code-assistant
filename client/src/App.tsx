import { LanguageSelector } from "./components/LanguageSelector";
import { CodeEditor } from "./components/CodeEditor";
import { MismatchAlert } from "./components/MismatchAlert";
import { ActionPanel } from "./components/ActionPanel";
import { ResultPanel } from "./components/ResultPanel";

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__brand-mark">{"</>"}</span>
          <div>
            <h1>AI Code Assistant</h1>
            <p>Paste a snippet, verify the language, then optimize, refactor, or explain it.</p>
          </div>
        </div>
        <LanguageSelector />
      </header>

      <main className="app__main">
        <section className="app__panel">
          <CodeEditor />
          <MismatchAlert />
          <ActionPanel />
        </section>

        <section className="app__panel">
          <h2 className="app__panel-title">Result</h2>
          <ResultPanel />
        </section>
      </main>
    </div>
  );
}

export default App;
