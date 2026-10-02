import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomInt, randomUUID } from 'node:crypto';
import { Store, Session } from './store';
import { Mail } from './mail';
import { checkPin, digest, email, text, token } from './security';

@Controller('api')
export class ChatController {
  private readonly listeners = new Set<{ session: Session; response: Response }>();
  constructor(
    private readonly store: Store,
    private readonly mail: Mail,
  ) {}
  private async session(req: Request) {
    const value = req.cookies?.portfolio_session;
    const session =
      typeof value === 'string'
        ? await this.store.sessions.findOne({ _id: digest(value), expiresAt: { $gt: new Date() } })
        : null;
    if (!session) throw new UnauthorizedException('Please sign in to continue.');
    return session;
  }
  private async issue(res: Response, role: Session['role'], recruiterId?: string) {
    const value = token();
    const maxAge = (role === 'owner' ? 12 * 60 * 60 : 30 * 24 * 60 * 60) * 1000;
    await this.store.sessions.insertOne({
      _id: digest(value),
      role,
      recruiterId,
      expiresAt: new Date(Date.now() + maxAge),
    });
    res.cookie('portfolio_session', value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge,
    });
  }
  private async access(req: Request, conversation: string) {
    const session = await this.session(req);
    if (session.role !== 'owner' && session.recruiterId !== conversation)
      throw new ForbiddenException();
    if (!(await this.store.recruiters.findOne({ _id: conversation })))
      throw new NotFoundException();
    return session;
  }
  private publish(conversation: string) {
    for (const listener of this.listeners) {
      if (listener.session.expiresAt <= new Date()) {
        listener.response.end();
        continue;
      }
      if (listener.session.role === 'owner' || listener.session.recruiterId === conversation)
        listener.response.write(`data: ${JSON.stringify({ conversationId: conversation })}\n\n`);
    }
  }
  @Get('health') health() {
    return { status: 'ok' };
  }
  @Get('session') async current(@Req() req: Request) {
    try {
      const session = await this.session(req);
      const recruiter = session.recruiterId
        ? await this.store.recruiters.findOne({ _id: session.recruiterId })
        : null;
      return { role: session.role, recruiter };
    } catch (error) {
      if (error instanceof UnauthorizedException) return { role: null };
      throw error;
    }
  }
  @Post('auth/email') async start(@Body() body: Record<string, unknown>, @Req() req: Request) {
    const address = email(body.email);
    await this.store.limit(`email-ip:${req.ip}`, 10, 600);
    await this.store.limit(`email:${address}`, 3, 600);
    const id = token();
    const code = String(randomInt(100000, 1000000));
    await this.store.challenges.insertOne({
      _id: id,
      email: address,
      hash: digest(`${id}:${code}`),
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60000),
    });
    try {
      await this.mail.send(
        address,
        'Your portfolio chat verification code',
        `Your verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`,
        `verify-${id}`,
      );
    } catch (error) {
      await this.store.challenges.deleteOne({ _id: id });
      throw error;
    }
    return { challengeId: id };
  }
  @Post('auth/verify') async verify(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.store.limit(`verify:${req.ip}`, 30, 600);
    const id = text(body.challengeId, 64, 'verification request');
    const code = text(body.code, 6, 'verification code');
    const challenge = await this.store.challenges.findOneAndUpdate(
      { _id: id, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } },
      { $inc: { attempts: 1 } },
      { returnDocument: 'after' },
    );
    if (!challenge || challenge.hash !== digest(`${id}:${code}`))
      throw new UnauthorizedException('Invalid or expired code. Request a new code if needed.');
    const consumed = await this.store.challenges.deleteOne({ _id: id });
    if (!consumed.deletedCount) throw new UnauthorizedException('Code already used.');
    const recruiter = await this.store.recruiters.findOneAndUpdate(
      { email: challenge.email },
      { $setOnInsert: { _id: randomUUID(), nickname: '', createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' },
    );
    await this.issue(res, 'recruiter', recruiter!._id);
    return { role: 'recruiter', recruiter };
  }
  @Post('auth/nickname') async nickname(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    const session = await this.session(req);
    if (session.role !== 'recruiter') throw new ForbiddenException();
    await this.store.recruiters.updateOne(
      { _id: session.recruiterId },
      { $set: { nickname: text(body.nickname, 60, 'nickname') } },
    );
    return this.current(req);
  }
  @Post('auth/owner') async owner(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.store.limit(`pin:${req.ip}`, 5, 900);
    await this.store.limit('pin-global', 30, 900);
    checkPin(body.pin);
    await this.issue(res, 'owner');
    return { role: 'owner', recruiter: null };
  }
  @Post('auth/logout') async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const value = req.cookies?.portfolio_session;
    if (typeof value === 'string') {
      const id = digest(value);
      await this.store.sessions.deleteOne({ _id: id });
      for (const listener of this.listeners)
        if (listener.session._id === id) listener.response.end();
    }
    res.clearCookie('portfolio_session', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return { ok: true };
  }
  @Get('conversations') async conversations(@Req() req: Request) {
    const session = await this.session(req);
    const match = session.role === 'owner' ? {} : { _id: session.recruiterId };
    return this.store.recruiters
      .aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'messages',
            let: { id: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$conversationId', '$$id'] } } },
              { $sort: { createdAt: -1, _id: -1 } },
              { $limit: 1 },
            ],
            as: 'latest',
          },
        },
        {
          $lookup: {
            from: 'messages',
            let: { id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$conversationId', '$$id'] },
                  sender: session.role === 'owner' ? 'recruiter' : 'owner',
                  read: false,
                },
              },
              { $count: 'count' },
            ],
            as: 'unread',
          },
        },
        {
          $project: {
            email: 1,
            nickname: 1,
            latest: { $arrayElemAt: ['$latest', 0] },
            unread: { $ifNull: [{ $arrayElemAt: ['$unread.count', 0] }, 0] },
          },
        },
        { $sort: { 'latest.createdAt': -1, _id: 1 } },
      ])
      .toArray();
  }
  @Get('conversations/:id/messages') async history(
    @Param('id') id: string,
    @Query('before') before: string | undefined,
    @Req() req: Request,
  ) {
    await this.access(req, id);
    let cursor;
    if (before) {
      cursor = await this.store.messages.findOne({ _id: before, conversationId: id });
      if (!cursor) throw new BadRequestException('Invalid message cursor.');
    }
    const rows = await this.store.messages
      .find({
        conversationId: id,
        ...(cursor
          ? {
              $or: [
                { createdAt: { $lt: cursor.createdAt } },
                { createdAt: cursor.createdAt, _id: { $lt: cursor._id } },
              ],
            }
          : {}),
      })
      .sort({ createdAt: -1, _id: -1 })
      .limit(51)
      .toArray();
    const more = rows.length > 50;
    return {
      messages: rows
        .slice(0, 50)
        .reverse()
        .map(({ notificationPending, notificationAttempt, notifyAfter, ...message }) => message),
      more,
    };
  }
  @Post('conversations/:id/messages') async send(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    const session = await this.access(req, id);
    if (
      session.role === 'recruiter' &&
      !(await this.store.recruiters.findOne({ _id: id }))?.nickname
    )
      throw new BadRequestException('Please enter your nickname first.');
    await this.store.limit(`send:${session.role}:${session.recruiterId ?? 'owner'}`, 30, 60);
    const requestId = text(body.requestId, 64, 'message identifier');
    if (!/^[a-zA-Z0-9-]+$/.test(requestId))
      throw new BadRequestException('Invalid message identifier.');
    const messageId = digest(`${id}:${session.role}:${requestId}`);
    await this.store.messages.updateOne(
      { _id: messageId },
      {
        $setOnInsert: {
          conversationId: id,
          sender: session.role,
          body: text(body.body, 4000, 'message (up to 4,000 characters)'),
          createdAt: new Date(),
          read: false,
          notificationPending: session.role === 'recruiter',
          notificationAttempt: 0,
          notifyAfter: new Date(Date.now() + 60000),
        },
      },
      { upsert: true },
    );
    this.publish(id);
    return { id: messageId };
  }
  @Post('conversations/:id/read') async read(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    const session = await this.access(req, id);
    const through = await this.store.messages.findOne({
      _id: text(body.through, 64, 'message identifier'),
      conversationId: id,
    });
    if (!through) throw new BadRequestException();
    const result = await this.store.messages.updateMany(
      {
        conversationId: id,
        sender: session.role === 'owner' ? 'recruiter' : 'owner',
        read: false,
        $or: [
          { createdAt: { $lt: through.createdAt } },
          { createdAt: through.createdAt, _id: { $lte: through._id } },
        ],
      },
      { $set: { read: true } },
    );
    if (result.modifiedCount) this.publish(id);
    return { ok: true };
  }
  @Get('events') async events(@Req() req: Request, @Res() res: Response) {
    const session = await this.session(req);
    if ([...this.listeners].filter((item) => item.session._id === session._id).length >= 5)
      throw new BadRequestException('Too many open chat tabs.');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    const listener = { session, response: res };
    this.listeners.add(listener);
    res.write('data: {"connected":true}\n\n');
    const timer = setInterval(() => {
      if (session.expiresAt <= new Date()) res.end();
      else res.write(': heartbeat\n\n');
    }, 20000);
    res.on('close', () => {
      clearInterval(timer);
      this.listeners.delete(listener);
    });
  }
}
