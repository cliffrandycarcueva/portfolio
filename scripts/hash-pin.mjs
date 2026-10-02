import { randomBytes, scryptSync } from 'node:crypto';
import { emitKeypressEvents } from 'node:readline';

if (!process.stdin.isTTY) throw new Error('Run this command in an interactive terminal.');
process.stdout.write('Choose an owner PIN (at least 10 digits; input is hidden): ');
emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
let pin = '';
process.stdin.on('keypress', (character, key) => {
  if (key.ctrl && key.name === 'c') {
    process.stdin.setRawMode(false);
    process.exit(1);
  }
  if (key.name === 'backspace') {
    pin = pin.slice(0, -1);
    return;
  }
  if (key.name === 'return') {
    process.stdin.setRawMode(false);
    if (!/^\d{10,128}$/.test(pin)) {
      console.error('\nUse 10–128 digits.');
      process.exit(1);
    }
    const salt = randomBytes(16).toString('hex');
    console.log(`\nOWNER_PIN_HASH=${salt}:${scryptSync(pin, salt, 64).toString('hex')}`);
    process.exit(0);
  }
  if (/^\d$/.test(character ?? '')) pin += character;
});
