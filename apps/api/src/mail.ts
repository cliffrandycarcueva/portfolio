import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Store } from './store';

@Injectable()
export class Mail implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private working = false;
  constructor(private readonly store: Store) {}
  async send(to: string, subject: string, body: string, key: string) {
    if (process.env.MAIL_MODE === 'console' && process.env.NODE_ENV !== 'production') {
      console.log(`[Development email] To: ${to}\n${subject}\n${body}`);
      return;
    }
    if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM)
      throw new ServiceUnavailableException(
        'Email delivery is not configured. Please use the email contact link.',
      );
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text: body }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      throw new ServiceUnavailableException(
        'Email delivery is temporarily unavailable. Please try again.',
      );
  }
  onModuleInit() {
    this.timer = setInterval(
      () =>
        void this.process().catch(() => console.error('Notification worker failed; will retry.')),
      10000,
    );
  }
  onModuleDestroy() {
    clearInterval(this.timer);
  }
  async process() {
    if (this.working || !process.env.OWNER_EMAIL) return;
    this.working = true;
    try {
      // One API instance owns this worker. Message documents form the durable outbox.
      const pending = await this.store.messages
        .find({ notificationPending: true, notifyAfter: { $lte: new Date() } })
        .sort({ createdAt: 1 })
        .limit(50)
        .toArray();
      const handled = new Set<string>();
      for (const message of pending) {
        const minute = Math.floor(message.createdAt.getTime() / 60000);
        const key = `${message.conversationId}-${minute}`;
        if (handled.has(key)) continue;
        handled.add(key);
        const batch = {
          conversationId: message.conversationId,
          sender: 'recruiter' as const,
          notificationPending: true,
          createdAt: { $gte: new Date(minute * 60000), $lt: new Date((minute + 1) * 60000) },
        };
        if (await this.store.messages.countDocuments({ ...batch, read: false })) {
          const recruiter = await this.store.recruiters.findOne({ _id: message.conversationId });
          const link = `${process.env.PUBLIC_ORIGIN}/react/?conversation=${message.conversationId}#contact`;
          try {
            await this.send(
              process.env.OWNER_EMAIL,
              'New portfolio messages',
              `You have new messages from ${recruiter?.email}.\n\nOpen conversation: ${link}\nYour owner PIN is required.`,
              `conversation-${key}`,
            );
          } catch {
            const delay = Math.min(3600000, 30000 * 2 ** Math.min(message.notificationAttempt, 7));
            await this.store.messages.updateMany(batch, {
              $inc: { notificationAttempt: 1 },
              $set: { notifyAfter: new Date(Date.now() + delay) },
            });
            continue;
          }
        }
        await this.store.messages.updateMany(batch, { $set: { notificationPending: false } });
      }
    } finally {
      this.working = false;
    }
  }
}
