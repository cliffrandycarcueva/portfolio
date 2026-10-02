import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Store } from './store';
import { ChatController } from './chat.controller';

@Module({ controllers: [ChatController], providers: [Store] })
class AppModule {}

export async function createApplication(serverless = false) {
  if (!serverless && existsSync('.env')) process.loadEnvFile('.env');
  const origin = process.env.PUBLIC_ORIGIN ?? 'http://localhost:5173';
  process.env.PUBLIC_ORIGIN = new URL(origin).origin;
  if (process.env.NODE_ENV === 'production') {
    for (const key of ['MONGODB_URI', 'OWNER_PIN_HASH'])
      if (!process.env[key]) throw new Error(`Missing ${key}`);
    if (!origin.startsWith('https://'))
      throw new Error('PUBLIC_ORIGIN must use HTTPS in production.');
  }
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: false,
  });
  if (!serverless) app.enableShutdownHooks();
  if (serverless) server.set('trust proxy', 1);
  else if (process.env.TRUST_PROXY_HOPS)
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
  if (!serverless && existsSync(staticRoot)) {
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) =>
      req.path === '/' ? res.redirect('/react/') : next(),
    );
    app.use(express.static(staticRoot));
  }
  await app.init();
  return { app, server };
}
