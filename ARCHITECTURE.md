# Architecture

## Overview

This is a client-rendered single-page website using React, TypeScript, Tailwind CSS v4, and Vite. A static site fits this resume portfolio because the content is public, small, and does not need authentication or a backend. Next.js is unnecessary for the current scope. All sections remain on one page and navigation uses native fragment links.

```text
index.html                  HTML entry, metadata, favicon
public/
  favicon.svg               Original typographic favicon
  Cliff_Randy_Carcueva_Resume.pdf
src/
  main.tsx                  React entry, portfolio sections, Tailwind utilities
  data.ts                   Typed-by-inference content collections
  styles.css                Tailwind theme, shared styles, effects, print rules
vite.config.ts              React and Tailwind Vite plugins
.prettierrc.json             Formatting and Tailwind class sorting
playwright.config.ts        Browser test configuration
tests/portfolio.spec.ts     Interaction and mobile checks
```

## Rendering and data flow

`main.tsx` mounts `App` inside React Strict Mode. `App` imports structured resume content from `data.ts`, then renders the introduction, overview, experience timeline, skills, education/languages, and contact sections. Arrays drive experience cards and skill categories, keeping repeated markup consistent. The stylized code illustration is HTML/CSS, not a screenshot, and needs no image downloads. Lucide supplies interface icons; company tiles are typographic initials rather than official logos.

Local React state handles interactions:

- `expanded`: IDs of open experience entries. The current role starts expanded. Every entry can open independently, and the bulk control opens or closes all entries.
- `category`: the selected skill group. The panel reads the corresponding content collection.
- `dark`: theme selection, persisted in `localStorage` when available. CSS custom properties apply the theme through the root `data-theme` attribute.
- `active`: navigation section, updated by an `IntersectionObserver`.
- `copied` and `copyError`: clipboard feedback. The success timer is cleaned up on state changes/unmount. If clipboard access fails, the visible email remains available for manual copying.

There are no remote content requests, cookies, analytics, API credentials, or server processes. Google Fonts is an optional external stylesheet request. The resume is a static asset copied unchanged from the supplied PDF. External GitHub and LinkedIn links open a new tab with `rel="noreferrer"`; email and phone links use native protocols.

## Accessibility and responsive behavior

Experience triggers are native buttons with `aria-expanded` and `aria-controls`. Each panel is a labelled region and uses `hidden` when collapsed, removing its contents from the accessibility tree. Enter and Space activate triggers. Skill categories use tab semantics and arrow/Home/End keyboard controls. The site includes a skip link, visible keyboard focus, labelled icon controls, and a live clipboard status message.

Tailwind responsive variants adapt the two-column hero and skills layout into one column on narrow screens. Experience dates wrap below the role on mobile. Reduced-motion preferences disable scrolling/transition animation. Print styles reveal all experience responsibilities; use the original resume download for the original, consistently formatted resume. Owner-requested skill additions are website content and do not modify that PDF.

## Tailwind architecture

The official `@tailwindcss/vite` plugin compiles Tailwind v4 alongside React. `src/styles.css` imports Tailwind with its source root limited to `src/`, preventing documentation examples and test artifacts from generating unused utilities. Production output contains compiled CSS; users need no runtime Tailwind dependency or CDN.

Most component styling lives directly in JSX as utilities: flex/grid layouts, spacing, borders, typography, responsive overrides, and interaction states. Semantic hooks such as `experience-trigger` remain for browser tests, print styles, and descendant treatments. Shared descendant styles use `@apply` inside `@layer components`, allowing utilities to override them predictably. Handwritten CSS is retained for the dotted illustration, decorative contact circles, accessibility defaults, and print behavior.

`@theme inline` maps semantic color utilities (`bg-canvas`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `text-accent`) to the existing CSS variables. Changing `data-theme` on the document root updates those variables, so the same utility classes work in both themes. Fonts use `font-sans`, `font-heading`, and `font-code`. `@theme` defines the reveal animation and custom breakpoints: 640px (`mobile`), 850px (`tablet`), and 1400px (`wide`). Smaller-screen overrides use `max-mobile:` and `max-tablet:`; large layouts use `wide:`.

Skill tabs use `aria-selected:` utilities. Experience cards use conditional state hooks and group variants for their timeline markers. Company tile colors come from a map of complete literal utility strings. Avoid interpolated utility fragments such as `bg-${color}`: Tailwind must see full class names to include them in the generated stylesheet.

Prettier and its Tailwind plugin format the code and sort utilities using this project's CSS theme. `npm run format` applies formatting and `npm run format:check` validates it. No JavaScript Tailwind configuration or separate PostCSS setup is needed. See the official [Vite integration](https://tailwindcss.com/docs/installation/using-vite) and [CSS theme documentation](https://tailwindcss.com/docs/theme).

## Build and verification

`npm run build` runs TypeScript validation and Vite’s optimized production build. `package-lock.json` pins installed dependency versions; use `npm ci` for reproducible installs. Playwright uses Chromium to verify the primary interactions and viewport behavior. Production deployment consists of serving `dist/` as static files at a domain root; no application server is required.

## Extending the site

Add roles and skill groups to `data.ts`; use unique stable experience IDs. Keep factual statements tied to the resume or other owner-approved content. If adding multiple pages, introduce a router and reconsider prerendering for per-page metadata. If adding a contact form, it will require an actual submission service, validation, and spam prevention; the current contact controls deliberately use email directly.
