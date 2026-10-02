import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes, scryptSync } from 'node:crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

test(
  'private recruiter chat, owner replies, sessions, retries and email outbox',
  { timeout: 180000 },
  async (t) => {
    const mongo = await MongoMemoryServer.create();
    const client = await MongoClient.connect(mongo.getUri());
    const db = client.db('portfolio_test');
    const origin = 'http://127.0.0.1:3097';
    const pin = '123456789012';
    const salt = randomBytes(16).toString('hex');
    let output = '';
    const server = spawn(process.execPath, ['apps/api/build/main.js'], {
      env: {
        ...process.env,
        NODE_ENV: 'test',
        API_PORT: '3097',
        PUBLIC_ORIGIN: origin,
        MONGODB_URI: mongo.getUri(),
        MONGODB_DATABASE: 'portfolio_test',
        MAIL_MODE: 'console',
        OWNER_EMAIL: 'owner@example.com',
        OWNER_PIN_HASH: `${salt}:${scryptSync(pin, salt, 64).toString('hex')}`,
      },
      windowsHide: true,
    });
    server.stdout.on('data', (chunk) => {
      output += chunk;
    });
    server.stderr.on('data', (chunk) => {
      output += chunk;
    });
    t.after(async () => {
      server.kill();
      await client.close();
      await mongo.stop();
    });
    async function waitFor(check, timeout = 20000) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        if (await check()) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error(`Timed out. API output: ${output}`);
    }
    await waitFor(async () => {
      try {
        return (await fetch(`${origin}/api/health`)).ok;
      } catch {
        return false;
      }
    });
    function agent() {
      return {
        cookie: '',
        async request(path, body, options = {}) {
          const response = await fetch(`${origin}/api/${path}`, {
            method: body === undefined ? 'GET' : 'POST',
            headers: {
              Origin: origin,
              'Content-Type': 'application/json',
              Cookie: this.cookie,
              ...options.headers,
            },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          });
          const cookie = response.headers.getSetCookie()[0];
          if (cookie) this.cookie = cookie.split(';')[0];
          return {
            status: response.status,
            data: await response.json(),
            headers: response.headers,
          };
        },
      };
    }
    async function signup(who, address) {
      const start = await who.request('auth/email', { email: address });
      assert.equal(start.status, 201);
      const code = output
        .match(/Your verification code is (\d{6})/g)
        .at(-1)
        .match(/\d{6}/)[0];
      const verified = await who.request('auth/verify', {
        challengeId: start.data.challengeId,
        code,
      });
      assert.equal(verified.status, 201);
      assert.match(verified.headers.get('set-cookie'), /HttpOnly/);
      assert.equal(
        (await who.request('auth/verify', { challengeId: start.data.challengeId, code })).status,
        401,
      );
      await who.request('auth/nickname', { nickname: 'Recruiter' });
      return verified.data.recruiter._id;
    }
    const recruiter = agent();
    const other = agent();
    const owner = agent();
    const id = await signup(recruiter, 'first@example.com');
    const otherId = await signup(other, 'other@example.com');
    await t.test('email possession and private conversation access', async () => {
      assert.equal((await agent().request(`conversations/${id}/messages`)).status, 401);
      assert.equal((await other.request(`conversations/${id}/messages`)).status, 403);
      assert.equal(
        (
          await other.request(`conversations/${id}/messages`, {
            body: 'intrude',
            requestId: 'intrude',
          })
        ).status,
        403,
      );
      assert.equal(
        (await other.request(`conversations/${id}/read`, { through: 'fake' })).status,
        403,
      );
      assert.equal((await other.request('conversations')).data.length, 1);
      assert.equal((await other.request('conversations')).data[0]._id, otherId);
      assert.equal((await recruiter.request('session')).data.recruiter._id, id);
      assert.equal(
        (
          await recruiter.request(
            'auth/nickname',
            { nickname: 'bad' },
            { headers: { Origin: 'https://evil.example' } },
          )
        ).status,
        403,
      );
    });
    await t.test('owner PIN and live notifications', async () => {
      assert.equal((await owner.request('auth/owner', { pin: 'wrong' })).status, 401);
      assert.equal((await owner.request('auth/owner', { pin })).status, 201);
      const abort = new AbortController();
      const stream = await fetch(`${origin}/api/events`, {
        headers: { Cookie: owner.cookie },
        signal: abort.signal,
      });
      const reader = stream.body.getReader();
      await reader.read();
      const sent = await recruiter.request(`conversations/${id}/messages`, {
        body: 'Hello Cliff',
        requestId: 'first-message',
      });
      assert.equal(sent.status, 201);
      const event = await reader.read();
      assert.match(new TextDecoder().decode(event.value), new RegExp(id));
      abort.abort();
      await recruiter.request(`conversations/${id}/messages`, {
        body: 'Hello Cliff',
        requestId: 'first-message',
      });
      assert.equal(
        (await recruiter.request(`conversations/${id}/messages`)).data.messages.length,
        1,
      );
      assert.equal(
        (await owner.request('conversations')).data.find((row) => row._id === id).unread,
        1,
      );
      assert.equal(
        await db.collection('messages').countDocuments({ notificationPending: true }),
        1,
      );
      await owner.request(`conversations/${id}/read`, { through: sent.data.id });
      assert.equal(
        (await owner.request('conversations')).data.find((row) => row._id === id).unread,
        0,
      );
      await owner.request(`conversations/${id}/messages`, {
        body: 'Thanks for reaching out!',
        requestId: 'owner-reply',
      });
      assert.equal((await recruiter.request('conversations')).data[0].unread, 1);
    });
    await t.test(
      'event streams remain private and a new browser restores the existing identity',
      async () => {
        const denied = await fetch(`${origin}/api/events`);
        assert.equal(denied.status, 401);
        const abort = new AbortController();
        const stream = await fetch(`${origin}/api/events`, {
          headers: { Cookie: other.cookie },
          signal: abort.signal,
        });
        const reader = stream.body.getReader();
        await reader.read();
        await recruiter.request(`conversations/${id}/messages`, {
          body: 'Private message',
          requestId: 'private-event',
        });
        await other.request(`conversations/${otherId}/messages`, {
          body: 'My own message',
          requestId: 'own-event',
        });
        const received = new TextDecoder().decode((await reader.read()).value);
        assert.match(received, new RegExp(otherId));
        assert.ok(!received.includes(id));
        abort.abort();
        const returning = agent();
        assert.equal(await signup(returning, 'first@example.com'), id);
        assert.equal((await returning.request('session')).data.recruiter.nickname, 'Recruiter');
      },
    );
    await t.test('expired sessions and verification attempt limits', async () => {
      const challenge = await other.request('auth/email', { email: 'other@example.com' });
      for (let i = 0; i < 6; i++)
        assert.equal(
          (
            await other.request('auth/verify', {
              challengeId: challenge.data.challengeId,
              code: '000000',
            })
          ).status,
          401,
        );
      await db
        .collection('sessions')
        .updateMany({ recruiterId: otherId }, { $set: { expiresAt: new Date(0) } });
      assert.equal((await other.request(`conversations/${otherId}/messages`)).status, 401);
      await owner.request('auth/logout', {});
      assert.equal((await owner.request('session')).data.role, null);
    });
    await t.test('notification batching, retry persistence and read suppression', async () => {
      const { Mail } = await import('../build/mail.js');
      process.env.OWNER_EMAIL = 'owner@example.com';
      process.env.PUBLIC_ORIGIN = origin;
      const worker = new Mail({
        messages: db.collection('messages'),
        recruiters: db.collection('recruiters'),
      });
      const createdAt = new Date(Math.floor(Date.now() / 60000) * 60000 - 120000);
      const base = {
        conversationId: id,
        sender: 'recruiter',
        body: 'New opportunity',
        createdAt,
        read: false,
        notificationPending: true,
        notificationAttempt: 0,
        notifyAfter: new Date(0),
      };
      await db.collection('messages').insertMany([
        { ...base, _id: 'mail-one' },
        { ...base, _id: 'mail-two' },
      ]);
      worker.send = async () => {
        throw new Error('temporary failure');
      };
      await worker.process();
      assert.equal(
        (await db.collection('messages').findOne({ _id: 'mail-one' })).notificationAttempt,
        1,
      );
      await db
        .collection('messages')
        .updateMany(
          { _id: { $in: ['mail-one', 'mail-two'] } },
          { $set: { notifyAfter: new Date(0) } },
        );
      const delivered = [];
      worker.send = async (...args) => {
        delivered.push(args);
      };
      await worker.process();
      assert.equal(delivered.length, 1);
      assert.match(delivered[0][2], /conversation=/);
      assert.equal(
        await db
          .collection('messages')
          .countDocuments({ _id: { $in: ['mail-one', 'mail-two'] }, notificationPending: true }),
        0,
      );
      await db.collection('messages').insertOne({ ...base, _id: 'mail-read', read: true });
      await worker.process();
      assert.equal(delivered.length, 1);
    });
    if (process.env.TEST_CHAT_BROWSER === '1') {
      await t.test('React and Angular Contact UI with real API', async () => {
        const { chromium } = await import('@playwright/test');
        const browser = await chromium.launch({
          channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
        });
        try {
          for (const framework of ['react', 'angular']) {
            const context = await browser.newContext();
            const page = await context.newPage();
            page.setDefaultTimeout(12000);
            await page.goto(`${origin}/${framework}/`);
            await page.getByRole('button', { name: 'Message me', exact: true }).click();
            await page.getByLabel('Email', { exact: true }).fill(`${framework}@example.com`);
            await page.getByRole('button', { name: 'Send verification code' }).click();
            await page.getByLabel('Verification code', { exact: true }).waitFor();
            const code = output
              .match(/Your verification code is (\d{6})/g)
              .at(-1)
              .match(/\d{6}/)[0];
            await page.getByLabel('Verification code', { exact: true }).fill(code);
            await page.getByRole('button', { name: 'Continue', exact: true }).click();
            await page.getByLabel('What should I call you?').fill(`${framework} recruiter`);
            await page.getByRole('button', { name: 'Start conversation' }).click();
            await page.getByLabel('Message', { exact: true }).fill(`Hello from ${framework}`);
            await page.getByRole('button', { name: 'Send', exact: true }).click();
            await page.getByText(`Hello from ${framework}`, { exact: true }).waitFor();
            await page.reload();
            await page.getByRole('button', { name: 'Message me', exact: true }).click();
            await page.getByText(`Hello from ${framework}`, { exact: true }).waitFor();
            await page.getByRole('button', { name: 'Close messages' }).click();
            const recruiterContext = await browser.newContext({
              storageState: await context.storageState(),
            });
            const recruiterPage = await recruiterContext.newPage();
            await recruiterPage.goto(`${origin}/${framework === 'react' ? 'angular' : 'react'}/`);
            await recruiterPage.getByRole('button', { name: 'Message me', exact: true }).click();
            await recruiterPage.getByText(`Hello from ${framework}`, { exact: true }).waitFor();
            await page.getByRole('button', { name: 'Owner sign in' }).click();
            await page.getByLabel('Owner PIN').fill(pin);
            await page.getByRole('button', { name: 'Open inbox', exact: true }).click();
            await page.getByRole('button', { name: new RegExp(`${framework} recruiter`) }).click();
            await page.getByLabel('Message', { exact: true }).fill(`Reply to ${framework}`);
            await page.getByRole('button', { name: 'Send', exact: true }).click();
            await page.getByText(`Reply to ${framework}`, { exact: true }).waitFor();
            await recruiterPage.getByText(`Reply to ${framework}`, { exact: true }).waitFor();
            await page.setViewportSize({ width: 390, height: 844 });
            const box = await page.getByRole('dialog').boundingBox();
            assert.ok(box.x >= 0 && box.x + box.width <= 390);
            await page.screenshot({ path: `test-results/chat-${framework}.png`, fullPage: false });
            await recruiterContext.close();
            await context.close();
          }
        } finally {
          await browser.close();
        }
      });
    }
  },
);
