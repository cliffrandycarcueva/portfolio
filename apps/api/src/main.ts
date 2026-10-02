import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Store } from './store';
import { Mail } from './mail';
import { ChatController } from './chat.controller';

@Module({ controllers: [ChatController], providers: [Store, Mail] })
class AppModule {}

async function bootstrap() {
  if (existsSync('.env')) process.loadEnvFile('.env');
  const origin = process.env.PUBLIC_ORIGIN ?? 'http://localhost:5173';
  process.env.PUBLIC_ORIGIN = new URL(origin).origin;
  if (process.env.NODE_ENV === 'production') {
    for (const key of [
      'MONGODB_URI',
      'OWNER_PIN_HASH',
      'OWNER_EMAIL',
      'RESEND_API_KEY',
      'MAIL_FROM',
    ])
      if (!process.env[key]) throw new Error(`Missing ${key}`);
    if (!origin.startsWith('https://'))
      throw new Error('PUBLIC_ORIGIN must use HTTPS in production.');
  }
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableShutdownHooks();
  if (process.env.TRUST_PROXY_HOPS)
    app.getHttpAdapter().getInstance().set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
  app.use(express.json({ limit: '16kb' }));
  app.use(cookieParser());
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (req.get('origin') !== process.env.PUBLIC_ORIGIN || !req.is('application/json')) {
          res.status(403).json({ message: 'Request origin or content type is not allowed.' });
          return;
        }
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
          res.status(400).json({ message: 'A JSON object is required.' });
          return;
        }
      }
    }
    next();
  });
  const staticRoot = resolve('dist');
  if (existsSync(staticRoot)) {
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) =>
      req.path === '/' ? res.redirect('/react/') : next(),
    );
    app.use(express.static(staticRoot));
  }
  await app.listen(Number(process.env.API_PORT ?? 3001), process.env.API_HOST ?? '127.0.0.1');
}
void bootstrap().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
