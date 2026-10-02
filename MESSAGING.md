# Portfolio messaging

The React and Angular Contact sections share a NestJS API in `apps/api`. Recruiters verify their email with a six-digit code, enter a nickname once, and return directly to their conversation while their 30-day browser session is valid. A new browser or expired session requires another email code. Both framework routes share the same session cookie.

Click the small circle beside CRC in the footer for owner login. A valid owner PIN opens the inbox and changes the Contact message button into a bell with an unread count. Owner sessions last 12 hours. Email notification links open the relevant conversation after login.

## Local setup

You **do not need to install MongoDB directly on your machine**. Choose either:

- A MongoDB Atlas database: put its connection string in `MONGODB_URI`, allow your development IP in Atlas, and use a database user limited to this database.
- Docker Desktop: run `docker compose up -d mongodb`. The included compose file binds MongoDB only to localhost and preserves data in a named volume.
- An existing local MongoDB installation also works with the default URI.

From the repository root, in PowerShell:

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd run pin:hash
```

Paste the generated `OWNER_PIN_HASH` into `.env`, set your `OWNER_EMAIL`, and set your database connection string if using Atlas. The PIN prompt hides input and requires at least 10 digits. `.env` is ignored by Git; never put these secrets in Vite variables or `shared/` files.

```powershell
# Only needed for the Docker database option:
docker compose up -d mongodb

# Starts React, Angular, the NestJS API and its TypeScript watcher:
npm.cmd run dev:full
```

Open **http://localhost:5173/react/** or **http://localhost:5173/angular/**. Use the exact origin configured in `PUBLIC_ORIGIN`; `localhost` and `127.0.0.1` are different origins. The development proxy forwards `/api` to port 3001. If you change `API_PORT`, update that proxy too.

With `MAIL_MODE=console`, verification codes and owner notification emails appear in the API terminal. No real emails are sent. This mode is disabled in production. Use a separate browser profile or private window for the recruiter while your normal browser is signed in as owner.

`npm run dev` continues to run the frontends alone. The contact email links remain available if the API is offline. `npm run dev:api` builds and runs just the API with Node's output watcher; rerun `npm run build:api` after source changes, or use `dev:full` for automatic TypeScript rebuilding.

## Real email delivery

Set `MAIL_MODE=resend`, `RESEND_API_KEY`, and `MAIL_FROM` to an address on your verified Resend domain. Set `OWNER_EMAIL` to your destination inbox. Verification emails are delivered immediately. New messages are grouped by conversation and one-minute time window; notifications are processed after about 60–70 seconds, and messages already read by the owner are skipped. Notification failures retry with exponential backoff, capped at one hour. The pending notification is stored in the message document, so an API restart cannot lose it.

Email delivery is at-least-once: Resend idempotency keys suppress duplicate retries within its supported retention window, but delivery after a long outage can still duplicate a notification. Notifications contain a conversation link and contact email, not the message body. Recruiter reply-notification emails are not enabled; replies appear live or on the next visit.

## Production deployment

The simplest deployment is **one persistent Node service** serving both built frontends and NestJS, with managed MongoDB. All source code remains in this repository.

```powershell
npm.cmd run build:full
npm.cmd start
```

Set `NODE_ENV=production`, `API_HOST=0.0.0.0`, `API_PORT` to the port expected by your host, and `PUBLIC_ORIGIN` to your public HTTPS origin. Configure all database, owner, and email secrets in your host's environment. Production startup rejects missing required credentials or a non-HTTPS origin. TLS should terminate at your host's reverse proxy. Set `TRUST_PROXY_HOPS` to the exact number of trusted proxy hops (usually 1 for a single proxy); otherwise leave it at 0.

The included `Dockerfile` builds both frontends and the API, then runs them on port 3001. Supply production secrets at runtime, not at image build time.

The existing `vercel.json` still deploys only the static portfolio. It does **not** deploy this persistent NestJS service. To retain separate frontend hosting, you must route `/api/*` to the API through the same public origin, preserve streaming responses and cookies, and configure the proxy trust boundary. No cross-origin API access is enabled by default.

Run **one API instance** initially. Live event fan-out is process-local, and the email worker assumes a single instance. Multiple replicas require a shared event bus and distributed job claiming. This is intentionally a small service without Redis.

## Transport and access controls

- HTTP handles commands and paginated history. Authenticated server-sent events notify the browser of changes; the browser fetches the authorized conversation data. This is real-time server push, with a 30-second recovery poll while the page is visible.
- Refresh, reconnect, framework switches, and offline periods recover history from MongoDB. Message request identifiers prevent duplicate inserts after a network retry.
- Cookies are HttpOnly, SameSite=Strict, and Secure in production. State-changing requests require the configured Origin and JSON content type.
- Session expiry is checked on access; MongoDB TTL indexes handle eventual cleanup. PIN checks and email verification are rate-limited using database-backed counters. PINs use scrypt; session tokens and verification codes are hashed at rest.
- Every history, send, and read operation checks ownership. Recruiters cannot select someone else's conversation or assign themselves an owner role. A submitted email never unlocks history by itself.
- The nickname step appears only after email verification, so the public flow does not reveal whether an email already has an account.
- Messages are plain text, capped at 4,000 characters, and escaped by each frontend. There are no attachments, HTML rendering, typing indicators, or push notifications.

## Verification

```powershell
npm.cmd run test:api
npm.cmd run build:full
$env:TEST_CHAT_BROWSER = '1'
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run test:api
Remove-Item Env:TEST_CHAT_BROWSER
npm.cmd test
```

API tests use `mongodb-memory-server`, which downloads and starts a temporary MongoDB binary automatically. No installed database, Docker daemon, or Atlas credentials are needed for those tests. The first run requires network access. Data is discarded afterward.

With `TEST_CHAT_BROWSER=1`, the API suite also checks both built frontends against the real API using Chrome (or the channel selected by `PLAYWRIGHT_CHANNEL`), including recruiter onboarding, session restoration, owner replies, and mobile dock bounds. Build the frontends first. The ordinary Playwright suite still covers the rest of the portfolio.
