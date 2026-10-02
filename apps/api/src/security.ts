import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const deriveKey = promisify(scrypt);

export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export const token = () => randomBytes(32).toString('hex');
export function text(value: unknown, max: number, label: string) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max)
    throw new BadRequestException(`Enter a valid ${label}.`);
  return value.trim();
}
export function email(value: unknown) {
  const result = text(value, 254, 'email address').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))
    throw new BadRequestException('Enter a valid email address.');
  return result;
}
export function recruiterPin(value: unknown) {
  if (typeof value !== 'string' || !/^\d{6,32}$/.test(value))
    throw new BadRequestException('Choose a PIN of 6 to 32 digits.');
  return value;
}
export async function hashPin(pin: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${((await deriveKey(pin, salt, 64)) as Buffer).toString('hex')}`;
}
export async function matchesPin(pin: string, hash: string) {
  const [salt, expected] = hash.split(':');
  if (!salt || !expected || !/^[a-f0-9]{128}$/.test(expected)) return false;
  return timingSafeEqual((await deriveKey(pin, salt, 64)) as Buffer, Buffer.from(expected, 'hex'));
}
export async function checkPin(value: unknown) {
  const pin = text(value, 128, 'PIN');
  const [salt, expected] = (process.env.OWNER_PIN_HASH ?? '').split(':');
  if (!salt || !expected || !/^[a-f0-9]{128}$/.test(expected))
    throw new UnauthorizedException('Owner login is not configured.');
  if (!(await matchesPin(pin, `${salt}:${expected}`)))
    throw new UnauthorizedException('Incorrect PIN.');
}
