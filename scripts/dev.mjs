import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const [binary, args] of [
  ['@angular/cli/bin/ng.js', ['serve', '--hmr=false', '--live-reload=false']],
  ['vite/bin/vite.js', process.argv.slice(2)],
]) {
  const child = spawn(
    process.execPath,
    [fileURLToPath(new URL(`../node_modules/${binary}`, import.meta.url)), ...args],
    {
      stdio: 'inherit',
      windowsHide: true,
    },
  );
  children.push(child);
  child.on('error', (error) => {
    console.error(error);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping) stop(code ?? 1);
  });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
