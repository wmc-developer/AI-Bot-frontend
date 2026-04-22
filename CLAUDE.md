# CLAUDE.md

Guidance for Claude when working in this repo.

## Project

**Learn Your Marketing Score** — a Vite + React chatbot for Wingman Creative (https://wingmancreative.com.au/). It's a full-screen, mobile-first AI chat that helps visitors diagnose their marketing. Currently uses mock replies; a real LLM backend will be wired in later.

## Stack

- Vite + React 19 (JavaScript, no TypeScript yet)
- Plain CSS with CSS variables — no Tailwind, no CSS-in-JS
- Google Fonts: Inter (body) + Space Grotesk (headings/brand)
- No backend, no router, no state library

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
```

## File map

- [index.html](index.html) — viewport meta, fonts, theme-color
- [src/main.jsx](src/main.jsx) — React entry
- [src/App.jsx](src/App.jsx) — entire chat UI + state
- [src/App.css](src/App.css) — layout, components, mobile breakpoints
- [src/index.css](src/index.css) — design tokens, globals, keyframes

## Design system

Keep the futuristic-but-professional aesthetic inspired by Wingman Creative. Tokens live in [src/index.css](src/index.css#L1-L20). Don't hardcode colors in components — use the variables.

- Background: dark gradient (`--bg-0` → `--bg-1`) with animated orbs + grid mask
- Accents: cyan `--accent` (#22d3ee), indigo `--accent-2` (#6366f1), purple `--accent-3` (#a855f7)
- Surfaces: translucent white on dark with `backdrop-filter: blur()`
- Radius: 12–20px, generous
- Typography: Space Grotesk for headings/brand, Inter for body
- Motion: subtle — fade-up entry, shimmer headline, pulsing status dot, typing dots. Don't add aggressive animations.

## Coding rules

**Follow these. They reflect how this codebase is already written.**

1. **Edit, don't rewrite.** Small focused Edits over full-file Writes. Never duplicate App.jsx or split components unless asked.
2. **No new dependencies without asking.** No Tailwind, no UI kit, no icon library, no state lib. SVG icons are inline in App.jsx — keep it that way.
3. **No TypeScript migration** unless explicitly requested.
4. **Keep mobile-first.** Every UI change must still work at ≤640px. The app uses `position: fixed; inset: 0` + internal scroll — don't break that shell.
5. **Use CSS variables** from `:root`. If a new color is truly needed, add a token, don't inline hex.
6. **No comments explaining what code does.** Only comment non-obvious *why*. Don't add JSDoc blocks.
7. **No README/docs files** unless the user asks.
8. **Don't add error handling or loading states for cases that can't happen.** The mock `send()` flow is trusted — don't wrap it in try/catch.
9. **Preserve accessibility.** `aria-label` on icon-only buttons, semantic `<header>`/`<main>`, keyboard Enter-to-send already works.
10. **Verify builds.** After non-trivial changes run `npm run build` to catch issues.

## When wiring a real LLM

The mock reply lives in `send()` in [src/App.jsx](src/App.jsx). Replace the `setTimeout` block with a fetch to the backend. Keep the optimistic user-message append and the `typing` state — the UI depends on both. Stream tokens into the last bot message if the API supports it.

## Out of scope (don't do unprompted)

- Auth, user accounts, chat history persistence
- Analytics / tracking scripts
- Multi-page routing
- Theming / light mode (design is intentionally dark-only)
- Refactoring App.jsx into multiple files — it's deliberately one file right now
