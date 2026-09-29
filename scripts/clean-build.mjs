import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const workspace = fileURLToPath(new URL('../', import.meta.url));
const output = fileURLToPath(new URL('../dist', import.meta.url));
if (resolve(output) !== resolve(workspace, 'dist')) throw new Error('Unexpected build output path');
await rm(output, { recursive: true, force: true });
