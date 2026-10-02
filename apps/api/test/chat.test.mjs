import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes, scryptSync, createHash } from 'node:crypto';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

test(
  'PIN chat, private live events across API instances, sessions and Vercel adapter',
  { timeout: 180000 },
  async (t) => {
    const mongo = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    const client = await MongoClient.connect(mongo.getUri());
    const db = client.db('portfolio_test');
    const origin = 'http://127.0.0.1:3097';
    const functionOrigin = 'http://127.0.0.1:3098';
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
        REALTIME_MODE: 'database',
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
    const functionServer = spawn(process.execPath, ['apps/api/test/vercel-server.mjs'], {
      env: {
        ...process.env,
        VERCEL: '1',
        NODE_ENV: 'test',
        API_PORT: '3098',
        PUBLIC_ORIGIN: origin,
        MONGODB_URI: mongo.getUri(),
        MONGODB_DATABASE: 'portfolio_test',
        OWNER_PIN_HASH: `${salt}:${scryptSync(pin, salt, 64).toString('hex')}`,
      },
      windowsHide: true,
    });
    functionServer.stdout.on('data', (chunk) => {
      output += chunk;
    });
    functionServer.stderr.on('data', (chunk) => {
      output += chunk;
    });
    t.after(async () => {
      server.kill();
      functionServer.kill();
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
        return (
          (await fetch(`${origin}/api/health`)).ok &&
          (await fetch(`${functionOrigin}/api/health`)).ok
        );
      } catch {
        return false;
      }
    });
    function agent(base = origin) {
      return {
        cookie: '',
        async request(path, body, options = {}) {
          const response = await fetch(`${base}/api/${path}`, {
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
    const recruiterPin = '654321';
    async function signup(who, address) {
      const lookup = await who.request('auth/email', { email: address });
      assert.equal(lookup.status, 201);
      const result = await who.request('auth/register', {
        email: address,
        nickname: 'Recruiter',
        pin: recruiterPin,
        confirmPin: recruiterPin,
      });
      assert.equal(result.status, 201);
      assert.match(result.headers.get('set-cookie'), /HttpOnly/);
      assert.equal(result.data.recruiter.pinHash, undefined);
      const stored = await db.collection('recruiters').findOne({ _id: result.data.recruiter._id });
      assert.notEqual(stored.pinHash, recruiterPin);
      return result.data.recruiter._id;
    }
    const recruiter = agent();
    const other = agent();
    const owner = agent(functionOrigin);
    const id = await signup(recruiter, 'first@example.com');
    const otherId = await signup(other, 'other@example.com');
    await t.test('PIN authentication and private conversation access', async () => {
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
            'auth/login',
            { email: 'first@example.com', pin: recruiterPin },
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
      const stream = await fetch(`${functionOrigin}/api/events`, {
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
        (await db.collection('messages').findOne({ _id: sent.data.id })).notificationPending,
        undefined,
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
        const stream = await fetch(`${functionOrigin}/api/events`, {
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
        const login = await returning.request('auth/login', {
          email: ' FIRST@example.com ',
          pin: recruiterPin,
        });
        assert.equal(login.status, 201);
        assert.equal(login.data.recruiter._id, id);
        assert.equal(login.data.recruiter.pinHash, undefined);
        assert.equal((await returning.request('session')).data.recruiter.nickname, 'Recruiter');
      },
    );
    await t.test(
      'registration collisions, invalid PINs, throttling and expired sessions',
      async () => {
        const guest = agent();
        assert.deepEqual((await guest.request('auth/email', { email: 'FIRST@example.com' })).data, {
          exists: true,
        });
        assert.equal(
          (await guest.request('auth/login', { email: 'first@example.com', pin: '000000' })).status,
          401,
        );
        assert.equal(
          (
            await guest.request('auth/register', {
              email: 'first@example.com',
              nickname: 'Impostor',
              pin: '999999',
              confirmPin: '999999',
            })
          ).status,
          409,
        );
        assert.equal(
          (
            await guest.request('auth/register', {
              email: 'invalid@example.com',
              nickname: 'Test',
              pin: '1234',
              confirmPin: '1234',
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await guest.request('auth/register', {
              email: 'invalid@example.com',
              nickname: 'Test',
              pin: '123456',
              confirmPin: '000000',
            })
          ).status,
          400,
        );
        for (let i = 0; i < 5; i++)
          assert.equal(
            (await guest.request('auth/login', { email: 'other@example.com', pin: '000000' }))
              .status,
            401,
          );
        assert.equal(
          (await guest.request('auth/login', { email: 'other@example.com', pin: recruiterPin }))
            .status,
          429,
        );
        await db
          .collection('sessions')
          .updateMany({ recruiterId: otherId }, { $set: { expiresAt: new Date(0) } });
        assert.equal((await other.request(`conversations/${otherId}/messages`)).status, 401);
        await owner.request('auth/logout', {});
        assert.equal((await owner.request('session')).data.role, null);
        assert.equal((await guest.request('auth/verify', { code: '123456' })).status, 404);
      },
    );
    await t.test(
      'existing accounts require their original session to set an initial PIN',
      async () => {
        const legacyId = 'legacy-recruiter';
        await db.collection('recruiters').insertOne({
          _id: legacyId,
          email: 'legacy@example.com',
          nickname: 'Original',
          createdAt: new Date(),
        });
        const stranger = agent();
        assert.equal(
          (
            await stranger.request('auth/register', {
              email: 'legacy@example.com',
              nickname: 'Impostor',
              pin: recruiterPin,
              confirmPin: recruiterPin,
            })
          ).status,
          409,
        );
        assert.equal(
          (
            await stranger.request('auth/set-pin', {
              pin: recruiterPin,
              confirmPin: recruiterPin,
              nickname: 'Impostor',
            })
          ).status,
          401,
        );
        const legacy = agent();
        const secret = randomBytes(32).toString('hex');
        await db.collection('sessions').insertOne({
          _id: createHash('sha256').update(secret).digest('hex'),
          role: 'recruiter',
          recruiterId: legacyId,
          expiresAt: new Date(Date.now() + 60000),
        });
        legacy.cookie = `portfolio_session=${secret}`;
        assert.equal((await legacy.request('session')).data.recruiter.needsPin, true);
        assert.equal(
          (
            await legacy.request('auth/set-pin', {
              pin: recruiterPin,
              confirmPin: recruiterPin,
              nickname: 'Original',
            })
          ).status,
          201,
        );
        assert.equal(
          (
            await legacy.request('auth/set-pin', {
              pin: '111111',
              confirmPin: '111111',
              nickname: 'Changed',
            })
          ).status,
          409,
        );
        assert.equal(
          (await stranger.request('auth/login', { email: 'legacy@example.com', pin: recruiterPin }))
            .status,
          201,
        );
      },
    );
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
            await page.getByRole('button', { name: 'Continue', exact: true }).click();
            await page.getByLabel('What should I call you?').fill(`${framework} recruiter`);
            await page.getByLabel('Choose a PIN', { exact: true }).fill(recruiterPin);
            await page.getByLabel('Confirm PIN', { exact: true }).fill(recruiterPin);
            await page.getByRole('button', { name: 'Start conversation' }).click();
            await page.getByLabel('Message', { exact: true }).fill(`Hello from ${framework}`);
            await page.getByRole('button', { name: 'Send', exact: true }).click();
            await page.getByText(`Hello from ${framework}`, { exact: true }).waitFor();
            await page.reload();
            await page.getByRole('button', { name: 'Message me', exact: true }).click();
            await page.getByText(`Hello from ${framework}`, { exact: true }).waitFor();
            await page.getByRole('button', { name: 'Sign out', exact: true }).click();
            await page.getByLabel('Email', { exact: true }).fill(`${framework}@example.com`);
            await page.getByRole('button', { name: 'Continue', exact: true }).click();
            await page.getByLabel('Your PIN', { exact: true }).fill('000000');
            await page.getByRole('button', { name: 'Open conversation', exact: true }).click();
            await page.getByRole('alert').filter({ hasText: 'Incorrect email or PIN.' }).waitFor();
            await page.getByLabel('Your PIN', { exact: true }).fill(recruiterPin);
            await page.getByRole('button', { name: 'Open conversation', exact: true }).click();
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
