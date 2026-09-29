import { cp, writeFile } from 'node:fs/promises';

await cp(new URL('../public/', import.meta.url), new URL('../dist/', import.meta.url), {
  recursive: true,
});
// Vite applies its base path to the favicon reference in index.html.
await cp(
  new URL('../public/favicon.svg', import.meta.url),
  new URL('../dist/react/favicon.svg', import.meta.url),
);
// A static fallback also supports hosts that do not read vercel.json.
await writeFile(
  new URL('../dist/index.html', import.meta.url),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/react/"><title>Portfolio</title></head><body><a href="/react/">Open portfolio</a></body></html>',
);
