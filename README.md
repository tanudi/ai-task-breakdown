# AI Task Breakdown

AI Task Breakdown is a developer tool that turns a plain-English feature description into a structured list of implementation tasks, each with time estimates and subtasks. You paste in what you want to build, pick a language context, and get back an ordered plan you can drop straight into a sprint. It's useful for solo developers scoping a new feature, tech leads preparing work for their team, or anyone who wants a second opinion on how much a piece of work actually involves.

## How it works

1. **Describe your feature** — write a plain-English description of the project or feature you want to build and choose a language context (JavaScript, Python, Java, or General).
2. **Claude breaks it down** — the app sends your description to Claude, which returns a structured breakdown: a summary, an ordered list of dev tasks with descriptions and time estimates, and a total project estimate.
3. **Project Complexity Score** — the app uses Claude's tool use feature to automatically score the complexity of your project. Tool use lets the model call a defined function during its response; here Claude calls `estimate_complexity`, passing the task count and whether the project involves authentication or a database, and the app runs that function locally to produce a Low / Medium / High complexity rating with a recommendation.

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Anthropic Claude API](https://www.anthropic.com/api) — model `claude-sonnet-4-6`
- Claude tool use for the complexity scoring step
- Plain CSS (no component libraries)

## Getting started

**1. Clone the repo**
```bash
git clone <repo-url>
cd ai-task-breakdown
```

**2. Install dependencies**
```bash
npm install
```

**3. Add your API key**

Create a `.env` file in the project root:
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get a key from [console.anthropic.com](https://console.anthropic.com).

> **Note:** this app calls the Anthropic API directly from the browser. Your API key will be visible in the browser's network tab, so this setup is intended for local use. Before deploying publicly, move the API call behind a server-side proxy.

**4. Start the dev server**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Live demo

[LIVE_URL]
