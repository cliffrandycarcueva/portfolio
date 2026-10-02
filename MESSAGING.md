# Portfolio messaging

Both Contact sections use the NestJS API in `apps/api`. Recruiters enter their email first. A new email leads to nickname, PIN, and PIN confirmation; a returning email requires its existing PIN. PINs contain 6 to 32 digits. A remembered browser session resumes the conversation directly for up to 30 days, including across framework switches.

Click the small circle beside CRC for owner login. The owner PIN opens the inbox and its unread bell. Owner sessions last 12 hours. The owner PIN is independent of recruiter PINs.

**No email is sent.** There are no verification codes, mail-provider credentials, background notification jobs, or sender-domain requirements. The portfolio can keep its free Vercel address. The normal contact email links remain available.

## Local setup

You do not need to install MongoDB directly. Use MongoDB Atlas, the included Docker database (`docker compose up -d mongodb`), or an existing local MongoDB installation.

From the repository root:

```powershell
npm.cmd install
# Only if .env does not already exist:
Copy-Item .env.example .env
npm.cmd run pin:hash
npm.cmd run dev:full
```

Before starting, put the generated hash in `OWNER_PIN_HASH` and set `MONGODB_URI`. The owner hash helper prompts privately and recommends a longer PIN by requiring at least 10 digits; an existing owner PIN/hash is preserved by this update. The recruiter UI requires 6 or more digits.

Open http://localhost:5173/react/ or http://localhost:5173/angular/. Use the exact hostname in `PUBLIC_ORIGIN`: localhost and 127.0.0.1 differ. Use a private browser window for a recruiter and your normal browser for the owner. `npm run dev` still runs just the frontends; `dev:full` also compiles and watches NestJS.

Local single-process mode uses direct SSE broadcasts and works with a standalone MongoDB server. Set `REALTIME_MODE=database` with Atlas or a replica set to exercise the same database change streams used on Vercel.

## Vercel deployment

Keep the existing Vercel project, repository, and automatic Git deployments. Use repository root `./`, framework preset **Other**, Node.js **22.x**, and the configuration committed in `vercel.json`:

- Build command: `npm run build:full`.
- Frontend output: `dist` (both /react/ and /angular/).
- API entry: `api/index.js`, forwarding /api/* into NestJS.
- Function maximum duration: 60 seconds. Streams intentionally end at 45 seconds and reconnect.
- The Node function's `vercel-build` hook compiles the backend with TypeScript decorator metadata before packaging. The backend is not compiled with the frontend's TypeScript options.

In **portfolio > Environment Variables**, add these for **Production**:

| Key              | Value                                                  | Type   |
| ---------------- | ------------------------------------------------------ | ------ |
| PUBLIC_ORIGIN    | https://portfolio-cliffrandycarcueva.vercel.app        | Config |
| MONGODB_URI      | Your Atlas connection string                           | Secret |
| MONGODB_DATABASE | portfolio                                              | Config |
| OWNER_PIN_HASH   | The owner PIN hash from your local .env or hash helper | Secret |
| NODE_ENV         | production                                             | Config |

No OWNER_EMAIL, MAIL_MODE, MAIL_FROM, or RESEND_API_KEY is used. Remove any old mail settings from Vercel. API_PORT and API_HOST are only for running a standalone server, not Vercel Functions. Vercel's proxy is handled by the function adapter; do not copy a Docker-specific proxy setting.

Atlas must accept Vercel's outbound connections. The database user needs only readWrite on portfolio. The Hobby setup uses the configured IP access list plus the user's strong database password. Atlas provides the replica set needed for MongoDB change streams.

After pushing the change and finishing the environment settings, deploy the latest commit. Open /api/health (expect status ok), then verify recruiter registration, returning email/PIN login, owner replies, unread counts, and session restoration. A successful static frontend deployment alone does not prove that the API is working: inspect the deployment's Functions/runtime logs if /api/health fails.

Preview deployments need their own matching PUBLIC_ORIGIN and separate test database settings. Production-only variables intentionally do not configure previews.

### How live updates work

The browser uses EventSource to keep an authenticated SSE request open. Sending and reading messages uses HTTP endpoints. On Vercel, each SSE request watches authorized MongoDB message changes, so a message written by another function instance still reaches its recipient. Each request closes its database cursor on disconnect or expiry. A 45-second connection lifetime keeps it below the configured function limit; reconnection fetches current history to cover any gap. There is also a 30-second recovery poll while the page is visible.

This preserves server push; it is not a switch to five-second browser polling and does not require a WebSocket or paid real-time provider. Open streams still consume Vercel runtime resources and database connections. The MongoDB pool is capped at 10 connections per warm function instance. This is intended for low-volume portfolio traffic; monitor Vercel and Atlas usage before increasing traffic.

## Identity and access

PINs are salted scrypt hashes, never returned to browsers. PIN attempts are rate-limited by email and IP in MongoDB. Session tokens are random, stored hashed, and checked for expiry; cookies are HttpOnly, SameSite=Strict, and Secure in production. Each send/history/read operation checks conversation ownership. Messages are escaped plain text, capped at 4,000 characters, with unique retry identifiers preventing duplicate sends.

An email is now a claimed identifier, not a verified address. Anyone can register an unused email, but an existing conversation requires its PIN or an already authenticated session. The email-first lookup deliberately reveals whether the email is registered, but returns no nickname, message history, or PIN data.

There is no automated forgotten-PIN reset. An owner-assisted recovery process must verify identity separately; do not expose a public reset-by-email endpoint. This first version does not include an owner reset UI.

### Existing email-code test accounts

A recruiter with a still-valid session from the previous version is asked to choose their first PIN before continuing. The set-PIN endpoint requires that original session and cannot overwrite an existing PIN. Existing accounts without a session cannot be claimed merely by registering their email again. Preserve their data; use a new email for fresh local tests or arrange an identity-checked manual migration. Old verification challenge documents expire through their existing TTL index; legacy notification fields are unused and never send mail.

## Other hosting

`npm run build:full` followed by `npm start` serves both frontends and the API. Use NODE_ENV=production, HTTPS PUBLIC_ORIGIN, database credentials, and OWNER_PIN_HASH. Set API_HOST=0.0.0.0 in a container and configure API_PORT (or PORT) for the host. The Dockerfile remains supported.

For multiple persistent API instances, enable REALTIME_MODE=database with Atlas or a replica set. Standalone MongoDB only supports the local single-process broadcast mode.

## Verification

```powershell
npm.cmd run build:full
npm.cmd run test:api
$env:TEST_CHAT_BROWSER = '1'
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run test:api
Remove-Item Env:TEST_CHAT_BROWSER
npm.cmd test
```

API tests start a temporary MongoDB replica set, a normal Nest server, and the actual Vercel handler in a second process. They check private events across instances, PIN authentication, collisions, rate limits, expiry, and safe migration of old accounts. No cloud database or email service is contacted. The first run downloads a temporary MongoDB binary if needed.

With TEST_CHAT_BROWSER=1, the suite also checks both built frontends against the API. The ordinary Playwright suite checks the rest of the portfolio. Local tests do not replace verifying the deployed Vercel build and live Atlas connection.
