import { createApplication } from '../apps/api/build/app.js';

// A warm Vercel instance shares one initialized Nest app and MongoDB connection pool.
let application;
export default async function handler(req, res) {
  try {
    application ??= createApplication(true).catch((error) => {
      application = undefined;
      throw error;
    });
    const { server } = await application;
    // Await response completion: SSE must remain within this function's invocation.
    await new Promise((resolve, reject) => {
      res.once('finish', resolve);
      res.once('close', resolve);
      res.once('error', reject);
      server(req, res);
    });
  } catch {
    if (!res.headersSent) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Messaging is temporarily unavailable.' }));
    } else res.end();
  }
}
