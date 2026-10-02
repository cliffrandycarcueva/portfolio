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
  ConflictException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Store, Session, Recruiter } from './store';
import { MongoServerError } from 'mongodb';
import {
  checkPin,
  digest,
  email,
  text,
  token,
  recruiterPin,
  hashPin,
  matchesPin,
} from './security';

@Controller('api')
export class ChatController {
  private readonly listeners = new Set<{ session: Session; response: Response }>();
  constructor(private readonly store: Store) {}
  private publicRecruiter(recruiter: Recruiter | null) {
    return recruiter
      ? {
          _id: recruiter._id,
          email: recruiter.email,
          nickname: recruiter.nickname,
          needsPin: !recruiter.pinHash,
        }
      : null;
  }
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
    if (process.env.VERCEL === '1' || process.env.REALTIME_MODE === 'database') return;
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
      return { role: session.role, recruiter: this.publicRecruiter(recruiter) };
    } catch (error) {
      if (error instanceof UnauthorizedException) return { role: null };
      throw error;
    }
  }
  @Post('auth/email') async identify(@Body() body: Record<string, unknown>, @Req() req: Request) {
    const address = email(body.email);
    await this.store.limit(`identify:${req.ip}`, 30, 600);
    const recruiter = await this.store.recruiters.findOne(
      { email: address },
      { projection: { _id: 1 } },
    );
    // This email-first flow intentionally reveals registration status, never profile/history.
    return { exists: Boolean(recruiter) };
  }
  @Post('auth/register') async register(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const address = email(body.email);
    const pin = recruiterPin(body.pin);
    if (body.confirmPin !== pin) throw new BadRequestException('The PINs do not match.');
    const nickname = text(body.nickname, 60, 'nickname');
    await this.store.limit(`register:${req.ip}`, 10, 3600);
    const recruiter: Recruiter = {
      _id: randomUUID(),
      email: address,
      nickname,
      pinHash: await hashPin(pin),
      createdAt: new Date(),
    };
    try {
      await this.store.recruiters.insertOne(recruiter);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000)
        throw new ConflictException(
          'This email already has a conversation. Go back and sign in with its PIN.',
        );
      throw error;
    }
    await this.issue(res, 'recruiter', recruiter._id);
    return { role: 'recruiter', recruiter: this.publicRecruiter(recruiter) };
  }
  @Post('auth/login') async login(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const address = email(body.email);
    const pin = recruiterPin(body.pin);
    await this.store.limit(`login-ip:${req.ip}`, 20, 900);
    await this.store.limit(`login-email:${address}`, 5, 900);
    const recruiter = await this.store.recruiters.findOne({ email: address });
    if (!recruiter?.pinHash || !(await matchesPin(pin, recruiter.pinHash)))
      throw new UnauthorizedException('Incorrect email or PIN.');
    await this.issue(res, 'recruiter', recruiter._id);
    return { role: 'recruiter', recruiter: this.publicRecruiter(recruiter) };
  }
  @Post('auth/set-pin') async setPin(@Body() body: Record<string, unknown>, @Req() req: Request) {
    // Existing email-verified sessions may set their first PIN. Knowing an old email is insufficient.
    const session = await this.session(req);
    if (session.role !== 'recruiter') throw new ForbiddenException();
    const pin = recruiterPin(body.pin);
    if (body.confirmPin !== pin) throw new BadRequestException('The PINs do not match.');
    await this.store.limit(`set-pin:${session._id}`, 5, 900);
    const result = await this.store.recruiters.updateOne(
      { _id: session.recruiterId, pinHash: { $exists: false } },
      { $set: { pinHash: await hashPin(pin), nickname: text(body.nickname, 60, 'nickname') } },
    );
    if (!result.modifiedCount) throw new ConflictException('A PIN is already set.');
    return this.current(req);
  }
  @Post('auth/owner') async owner(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.store.limit(`pin:${req.ip}`, 5, 900);
    await this.store.limit('pin-global', 30, 900);
    await checkPin(body.pin);
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
        .map((message) => ({
          _id: message._id,
          conversationId: message.conversationId,
          sender: message.sender,
          body: message.body,
          createdAt: message.createdAt,
          read: message.read,
        })),
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
    const databaseEvents = process.env.VERCEL === '1' || process.env.REALTIME_MODE === 'database';
    const changes = databaseEvents
      ? this.store.messages.watch(
          session.role === 'owner'
            ? []
            : [{ $match: { 'fullDocument.conversationId': session.recruiterId } }],
          { fullDocument: 'updateLookup', maxAwaitTimeMS: 1000 },
        )
      : undefined;
    // Prime the cursor before advertising a connected stream, so the first send is observed.
    try {
      if (changes) await changes.tryNext();
    } catch (error) {
      await changes?.close();
      throw error;
    }
    if (res.destroyed) {
      await changes?.close();
      return;
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    const listener = { session, response: res };
    this.listeners.add(listener);
    res.write('retry: 1000\ndata: {"connected":true}\n\n');
    let closed = false;
    let checking = false;
    const close = () => {
      if (!res.writableEnded) res.end();
    };
    const heartbeat = setInterval(async () => {
      if (checking || closed) return;
      checking = true;
      try {
        const active = await this.store.sessions.findOne({
          _id: session._id,
          expiresAt: { $gt: new Date() },
        });
        if (!active) close();
        else if (!closed) res.write(': heartbeat\n\n');
      } catch {
        close();
      } finally {
        checking = false;
      }
    }, 10000);
    // Vercel streams end before the configured 60-second function limit; EventSource reconnects.
    const deadline = setTimeout(close, 45000);
    res.on('close', () => {
      closed = true;
      clearInterval(heartbeat);
      clearTimeout(deadline);
      this.listeners.delete(listener);
      void changes?.close().catch(() => undefined);
    });
    if (changes) {
      try {
        for await (const change of changes) {
          if (closed) break;
          if ('fullDocument' in change && change.fullDocument) {
            const conversationId = change.fullDocument.conversationId;
            if (session.role === 'owner' || session.recruiterId === conversationId)
              res.write(`data: ${JSON.stringify({ conversationId })}\n\n`);
          }
        }
      } catch {
        /* Reconnect fetches database history after a cursor/network interruption. */
      } finally {
        close();
        await changes.close().catch(() => undefined);
      }
    }
  }
}
