# Cliff Carcueva — Personal Portfolio

A responsive **React + Angular** portfolio using TypeScript and Tailwind CSS v4. Both implementations have separate components and share portfolio data, design styles, and public assets.

## Run locally

Install **Node.js 22.12+** (Node 24 LTS also works), then open a terminal in this project folder:

```sh
npm install
npm run dev
```

Open **http://localhost:5173/react/** or **http://localhost:5173/angular/**. The root redirects to React. The switch beside the theme button navigates between the implementations, preserving the theme and current section.

`npm run dev` starts Vite on port 5173 and Angular on internal port 4201. Vite proxies `/angular/` so both apps use the same origin. React supports hot updates; Angular rebuilds on edits and can be refreshed in the browser. Keep the terminal running; `Ctrl+C` stops both servers.

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd install` and `npm.cmd run dev` instead.

## Production build

```sh
npm run build
npm run preview
```

Open **http://localhost:4173/react/** or **http://localhost:4173/angular/**. The production files are in `dist/`; deploy that folder to a static host. Both applications run on the same domain, with no subdomains or backend required.

For Vercel, import the repository at root `./` with framework preset **Other**. `vercel.json` specifies `npm run build`, output directory `dist`, and the root redirect. Other hosts must serve directory index files and redirect `/` to `/react/`. Do not add a global rewrite to the React entry: it would intercept Angular requests.

`npm run build:react` and `npm run build:angular` build each app independently. The combined build cleans `dist`, runs both compilers, and copies the shared public assets.

## Customize

- Edit `shared/data.ts` for profile details, links, introductory copy, experience, skills, education, and languages. Both applications consume it; `src/data.ts` preserves existing React imports through a re-export.
- Edit `src/components/` for React components and `apps/angular/src/components/` for Angular components and templates. Each app has its own entry point and page composition.
- Edit `shared/styles.css` for theme colors, fonts, breakpoints, shared typography, decorative effects, and print styles.
- Replace `public/Cliff_Randy_Carcueva_Resume.pdf` to update the downloadable resume.
- Update `index.html` and `apps/angular/src/index.html` for page titles and search descriptions.

The PDF and contact details are public website assets. Experience text is transcribed from the supplied resume; introductory copy is adapted from its summary. Skills also include owner-requested additions: PHP and Laravel with minimal knowledge, and Azure DevOps deployments/pipelines with minimal knowledge. No client projects or performance metrics have been invented. Google Fonts enhances typography when online; system fonts serve as fallbacks.

## Tailwind styling

Tailwind v4 uses `@tailwindcss/vite` for React and `@tailwindcss/postcss` for Angular. Both compile `shared/styles.css` with source scanning for both applications. No Tailwind CDN or JavaScript Tailwind configuration is required.

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

Tests start both apps automatically and run the same checks against React and Angular. They cover framework switching, direct routes, public assets, accordion controls, keyboard navigation, skill categories, theme persistence, clipboard feedback, the PDF link, responsive layouts, reduced motion, and print visibility.

If the browser download is unavailable and Chrome is already installed, run the checks in PowerShell with:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd test
```

To test production outputs after `npm run build`, set `$env:TEST_PRODUCTION = '1'` before `npm test`. This starts the shared preview server on port 4173. Remove that environment variable to return to development tests.

Read [ARCHITECTURE.md](./ARCHITECTURE.md) for the project structure and implementation decisions.
