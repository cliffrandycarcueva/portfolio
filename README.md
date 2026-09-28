# Cliff Carcueva — Personal Portfolio

A responsive React + TypeScript + **Tailwind CSS v4** portfolio based on Cliff Randy D. Carcueva’s resume. Includes seven expandable experience entries with the original responsibilities, skill category tabs, a persistent light/dark theme, email copying, social links, and the downloadable resume.

## Run locally

Install **Node.js 22.12+** (Node 24 LTS also works), then open a terminal in this project folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, normally **http://localhost:5173**. Keep the terminal running. Stop it with `Ctrl+C`.

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd install` and `npm.cmd run dev` instead.

## Production build

```sh
npm run build
npm run preview
```

Open the preview URL printed in the terminal, normally **http://localhost:4173**. The production files are in `dist/`; deploy that folder to a static host. No server, database, environment variables, or API keys are needed. The default configuration assumes deployment at the domain root; subdirectory deployments require a matching Vite `base` and asset URLs.

## Customize

- Edit `src/data.ts` for profile details, social/contact URLs, navigation, introductory copy, experience responsibilities, skills, education, and languages. Social links and email/phone protocols are shared across the page; statistics derive their role count from the experience collection.
- Edit `src/components/` for section markup and Tailwind utilities. `src/App.tsx` composes the page; `src/main.tsx` only mounts React.
- Edit `src/styles.css` for theme colors, fonts, breakpoints, shared typography, decorative effects, and print styles.
- Replace `public/Cliff_Randy_Carcueva_Resume.pdf` to update the downloadable resume.
- Update `index.html` for the page title and search description.

The PDF and contact details are public website assets. Experience text is transcribed from the supplied resume; introductory copy is adapted from its summary. Skills also include owner-requested additions: PHP and Laravel with minimal knowledge, and Azure DevOps deployments/pipelines with minimal knowledge. No client projects or performance metrics have been invented. Google Fonts enhances typography when online; system fonts serve as fallbacks.

## Tailwind styling

Tailwind v4 runs through the official `@tailwindcss/vite` plugin. It is compiled locally during development and into static CSS during production builds; no Tailwind CDN or extra deployment configuration is required. The CSS-first setup lives in `src/styles.css`, so there is no `tailwind.config.js`.

- Semantic utilities such as `bg-surface`, `text-muted`, and `border-line` share light/dark theme tokens.
- Responsive utilities such as `max-mobile:grid-cols-[1fr]` preserve the original layout at narrow widths. The custom breakpoints are `mobile` (640px), `tablet` (850px), and `wide` (1400px).
- State variants such as `aria-selected:bg-soft`, `hover:-translate-y-0.5`, and group variants style interactions.
- Repeated descendant treatments use `@apply` in the components layer. Keep new layout styles in JSX utilities and use shared CSS only where it improves reuse or handles specialized effects.
- Write complete class names, including conditional variants, so Tailwind can discover them. Company colors use a static class map rather than dynamically constructing class names.

Use `npm run format` to format the project and sort Tailwind classes, or `npm run format:check` to check formatting without changing files. Prettier reads the custom theme through `.prettierrc.json`.

Official references: [Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite) and [theme variables](https://tailwindcss.com/docs/theme).

## Browser checks

```sh
npx playwright install chromium
npm test
```

Tests start a local Vite server automatically and cover individual and bulk accordion controls, keyboard navigation, skill categories, theme persistence, the PDF link, responsive layouts, reduced motion, and print visibility.

If the browser download is unavailable and Chrome is already installed, run the checks in PowerShell with:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd test
```

The browser tests support installed Chrome through the command above; this avoids downloading a separate Chromium build when the download service is unavailable.

Read [ARCHITECTURE.md](./ARCHITECTURE.md) for the project structure and implementation decisions.
