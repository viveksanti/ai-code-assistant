# AI Code Assistant

Small full-stack tool for pasting a code snippet and getting an AI to optimize it,
refactor it, explain it, or just point out problems. Also has a language checker —
pick a language from the dropdown, paste your code, and it'll flag it if what you
pasted doesn't actually look like that language.

Built with Node/Express/TypeScript on the backend and React + Redux Toolkit on the
frontend. Uses Google's Gemini API for the AI part (free tier, no card required).

## Stack

- Express + TypeScript
- Google Gemini API (`@google/genai`)
- React + Redux Toolkit + Vite
- Plain CSS, no component library

## Running it locally

You need a free Gemini key from https://aistudio.google.com/apikey — just sign in
with a Google account and generate one, no billing setup needed.

**Backend:**

\`\`\`bash
cd server
cp .env.example .env   # paste your key in here
npm install
npm run dev
\`\`\`

Runs on `http://localhost:4000`.

**Frontend**, in a separate terminal:

\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

Runs on `http://localhost:5173` and proxies API calls to the backend.

## How it's structured

\`\`\`
server/
  src/
    index.ts               # express entry point
    routes/code.ts          # /api/analyze + /api/detect-language
    services/aiService.ts    # gemini calls + prompts
    services/languageDetector.ts   # regex-based language guesser
    types/

client/
  src/
    api/codeApi.ts
    store/                  # redux slice + store
    components/
      CodeEditor.tsx
      LanguageSelector.tsx
      ActionPanel.tsx
      MismatchAlert.tsx
      ResultPanel.tsx
    App.tsx
\`\`\`

The language detector isn't AI-based, it's just a scored set of regex patterns per
language (checks for stuff like `def` + `self` for Python, `func main()` + `package
main` for Go, etc). Kept it that way on purpose so "verify language" is instant and
doesn't cost an API call.

## Known issue

Gemini has been retiring model names faster than they update their docs — I had
`gemini-2.5-flash` and then `gemini-2.5-flash-lite` both randomly 404 mid-project. The
model name is now read from `GEMINI_MODEL` in `.env` and defaults to
`gemini-flash-latest`, which is an alias that always points at whatever Google's
current flash model is, so it shouldn't happen again. If it does, check
https://ai.google.dev/gemini-api/docs/models and set `GEMINI_MODEL` to something valid.

## Things I'd still add

- Save history of past snippets/results (was about to add Postgres + Prisma for this)
- Syntax highlighting in the editor instead of a plain textarea
- Auth, if this ever needed to be more than a personal tool
- Tests — there aren't any yet


`.env` is gitignored already so the API key won't get committed.