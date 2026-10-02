import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

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
export function checkPin(value: unknown) {
  const pin = text(value, 128, 'PIN');
  const [salt, expected] = (process.env.OWNER_PIN_HASH ?? '').split(':');
  if (!salt || !expected || !/^[a-f0-9]{128}$/.test(expected))
    throw new UnauthorizedException('Owner login is not configured.');
  if (!timingSafeEqual(scryptSync(pin, salt, 64), Buffer.from(expected, 'hex')))
    throw new UnauthorizedException('Incorrect PIN.');
}
