# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The personal portfolio site for **shammas.in** — a hand-written, static multi-page site (vanilla HTML/CSS/JS, no framework, no build step). It is served directly by **GitHub Pages** from the repo root; the `CNAME` file binds it to the `shammas.in` custom domain.

## Build / run / deploy

- **No build, no bundler, no package manager, no tests.** There is nothing to compile.
- **Run locally:** serve the repo root over HTTP (e.g. `python3 -m http.server 8000`), then open `http://localhost:8000/`. Use a server rather than `file://` — pages fetch `/header.html` and register `/service-worker.js`, both of which need real HTTP and matching absolute paths.
- **Deploy:** push to the default branch (`main`). GitHub Pages publishes the repo root automatically; there is no CI workflow (`.github/` does not exist).

## Architecture

Each top-level `*.html` is a standalone, fully self-contained page (its own `<head>` meta/OG/schema, its own page CSS in a `<style>` block, and its own inline footer markup). Pages share only two things:

1. **`header.html`** — the global design system (the `:root` and `[data-theme="light"]` CSS variables that define the whole color/spacing/typography system) plus the header/nav and footer-link markup. Every page injects it at runtime:
   ```js
   fetch('/header.html').then(r => r.text()).then(html => {
     document.getElementById('header-placeholder').innerHTML = html;
     if (window.initHeader) window.initHeader();
   });
   ```
2. **`site.js`** — all shared behavior, loaded via `<script src="/site.js">` in each page's `<head>`.

**Critical constraint:** scripts injected through `innerHTML` (i.e. anything inside `header.html`) **do not execute**. That is why `header.html` is markup/CSS only and all shared JS lives in `site.js`. `site.js` exposes `window.initHeader()`, which the fetch callback calls *after* the header HTML is in the DOM to wire up the theme toggle, mobile menu, and active-nav highlight.

`site.js` responsibilities: flash-free theme application (reads `localStorage.theme`, default `dark`, set on `<html data-theme>` before paint), page fade-in, `initHeader()`, scroll progress bar + header elevation, and an `IntersectionObserver` that reveals `.reveal` / `.reveal-left` elements (observer exposed as `window._revealObserver` so late-injected elements can be registered).

`service-worker.js` is a pass-through (network-only `fetch`) — it exists for PWA installability (`manifest.json`), not offline caching.

## Conventions that matter when editing

- **The theme system is the single source of truth for styling.** Use the CSS custom properties from `header.html` (`var(--bg)`, `var(--text)`, `var(--blue)`, `var(--card)`, `var(--radius)`, `var(--t)` for transitions, etc.) instead of hard-coded colors, so light/dark mode and visual consistency are preserved. Both themes must be defined for any new color.
- **Changing the header, nav, or footer = edit `header.html` once.** It propagates to every page. Adding a page to the site nav means editing the desktop `#desktop-nav` and the `#mobile-menu` lists in `header.html`.
- **Adding shared behavior = edit `site.js`.** Do not add `<script>` to `header.html` (it won't run).
- **Adding a new page:** copy an existing page's `<head>` (keep the flash-free theme inline script, the `/site.js` include, and the GA snippet), include `<div id="header-placeholder"></div>` + the fetch snippet, and register the page in `sitemap.xml` and in `header.html`'s nav.
- **Animated elements** opt in with class `reveal` or `reveal-left`; the observer in `site.js` adds `visible` when they scroll into view.
- Use **absolute paths** (`/site.js`, `/header.html`, `/images/...`) so includes resolve identically from any page and on GitHub Pages.

## Pages & external sub-sites

Local pages: `index.html` (home), `career.html`, `music.html`, `check4spam.html`, `sports.html`, `contact.html`, plus `404.html` (standalone, uses CDN Tailwind — it is the one page that does *not* share the design system). Three nav links point to separate deployments on subdomains, not files in this repo: `tools.shammas.in`, `photography.shammas.in`, `blog.shammas.in`.
