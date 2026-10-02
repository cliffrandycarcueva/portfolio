import { Injectable, OnModuleInit, OnModuleDestroy, HttpException } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { digest } from './security';

export interface Recruiter {
  _id: string;
  email: string;
  nickname: string;
  pinHash?: string;
  createdAt: Date;
}
export interface Session {
  _id: string;
  role: 'owner' | 'recruiter';
  recruiterId?: string;
  expiresAt: Date;
}
export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: 'owner' | 'recruiter';
  body: string;
  createdAt: Date;
  read: boolean;
}

@Injectable()
export class Store implements OnModuleInit, OnModuleDestroy {
  readonly client = new MongoClient(process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017', {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    maxIdleTimeMS: 60000,
  });
  readonly db = this.client.db(process.env.MONGODB_DATABASE ?? 'portfolio');
  readonly recruiters = this.db.collection<Recruiter>('recruiters');
  readonly sessions = this.db.collection<Session>('sessions');
  readonly messages = this.db.collection<ChatMessage>('messages');
  readonly limits = this.db.collection<{ _id: string; count: number; expiresAt: Date }>(
    'rate_limits',
  );
  async onModuleInit() {
    await this.client.connect();
    await Promise.all([
      this.recruiters.createIndex({ email: 1 }, { unique: true }),
      this.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      this.limits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      this.messages.createIndex({ conversationId: 1, createdAt: -1, _id: -1 }),
      this.messages.createIndex({ conversationId: 1, sender: 1, read: 1 }),
    ]);
  }
  async limit(key: string, max: number, seconds: number) {
    const bucket = Math.floor(Date.now() / (seconds * 1000));
    const result = await this.limits.findOneAndUpdate(
      { _id: digest(`${key}:${bucket}`) },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * seconds * 1000) } },
      { upsert: true, returnDocument: 'after' },
    );
    if (result!.count > max)
      throw new HttpException('Too many attempts. Please try again later.', 429);
  }
  async onModuleDestroy() {
    await this.client.close();
  }
}
