# Architecture

## Application boundaries

This portfolio uses route-based micro-frontends on one origin. React owns `/react/`; Angular owns `/angular/`. Each has its own entry point, components, state, compiler, and JavaScript bundle. Native document navigation switches frameworks, loading only the selected implementation. No iframe or runtime module federation is needed.

The applications share framework-neutral content, a Tailwind design system, and static assets. They build independently but are released together. The frontends support static deployment; live messaging requires the NestJS service described below. Separate deployments could later assign each path prefix to its own artifact at a gateway.

```text
src/                        React application (Vite)
  main.tsx, App.tsx          Entry and page composition
  components/               Sections, social links, framework switch
  hooks/                    Theme and section observation
  data.ts, styles.css        Compatibility imports of shared sources
apps/angular/
  src/main.ts, app.ts        Standalone Angular bootstrap and composition
  src/components/           Angular section classes and templates
  src/theme.service.ts      Signal-based theme state
  tsconfig.app.json         TypeScript and strict template checks
  .postcssrc.json            Tailwind PostCSS integration
shared/
  data.ts                   Profile, navigation, resume, contact links
  styles.css                Design tokens, responsive and print rules
  framework.ts              Typed cross-application URL helper
public/                     Resume, favicon, Lucide sprite and license
scripts/
  dev.mjs                   Starts both development servers
  clean-build.mjs            Cleans only the workspace dist directory
  finalize-build.mjs         Copies assets and adds root fallback
  preview.mjs                Serves both production outputs locally
angular.json                Angular build and development configuration
vite.config.ts              React build and same-origin Angular proxy
vercel.json                 Combined build and root redirect
```

## Data and state

### Messaging backend

`apps/api` contains a NestJS service backed by MongoDB, with email verification, cookie sessions, owner PIN authentication, private conversation APIs, an email outbox, and authenticated server-sent events. `shared/messaging.ts` owns framework-neutral client state and transport; React and Angular each render their own Contact chat UI. The API can serve both built frontends for one same-origin deployment. See [MESSAGING.md](./MESSAGING.md) for setup, security boundaries, tests, and the single-instance deployment constraint.

Both implementations consume `shared/data.ts`; React retains `src/data.ts` as a compatibility re-export. Profile facts, links, skills, education, and introductory content are edited once. The role count derives from the experience array; years of experience remain owner-maintained.

React uses local hooks. Angular uses standalone components, OnPush change detection, signals, computed values, and a theme service. Current jobs are explicitly marked. Each implementation owns its accordion, tabs, and clipboard feedback. Timers and section observers are cleaned up.

The native framework button exposes switch semantics: off means React, on means Angular. The destination URL keeps the current fragment, which each app restores after mounting. Both share the `theme` localStorage key and tolerate unavailable storage. Accordion expansion and skill selection reset when switching applications.

## Styles and assets

Both pipelines compile `shared/styles.css` with Tailwind v4. Scanning includes React and Angular sources. Tokens, typography, theme colors, responsive breakpoints, reduced motion, and print rules are shared.

Angular section hosts use `display: contents` to preserve grid and flex layouts. On tablet/mobile widths, navigation occupies a second header row. Both apps retain the skip link, native fragment navigation, labelled accordion regions, and arrow/Home/End keyboard controls for tabs.

Public assets are served at the domain root. Angular uses an SVG symbol sprite with the same Lucide icons as React; the license is in `public/icons.LICENSE.txt`. There is no runtime HTML injection. Vite prefixes the HTML favicon URL, so the combined build also places it under `/react/`. Google Fonts remains optional with system font fallbacks.

## Development and deployment

`npm run dev` starts Vite on 5173 and Angular on internal port 4201. Vite proxies `/angular/` before React base-path handling. Angular rebuilds when edited; refresh to load its changes. The supervisor stops both child servers when interrupted or when either server fails. Stop an existing session before reusing its ports.

`npm run build` validates TypeScript, builds React to `dist/react`, compiles Angular with strict templates to `dist/angular`, and copies shared public assets to `dist`. The root HTML is a fallback redirect for static hosts. `npm run preview` serves both outputs on port 4173. Vercel uses the combined build via `vercel.json`.

Both applications are single pages with fragment navigation. Static directory indexes support direct links and reloads. Do not add a global rewrite to React; it would intercept Angular assets and entry points. Future client-side subroutes would need application-specific fallback rules.

## Verification

Playwright runs the interaction suite against both apps. It covers independent bootstrap, assets, framework round trips, theme/fragment preservation, clipboard feedback, accordions, tabs, resume downloads, mobile layout, keyboard access, reduced motion, and print visibility. Set `TEST_PRODUCTION=1` to test the built deployment through the preview server.

Use `npm ci` for locked dependencies, `npm run build` for both compilers, and `npm run format:check` for formatting. Prettier parses Angular templates separately. UI markup intentionally exists in both frameworks; put content and design changes in shared sources when possible.
