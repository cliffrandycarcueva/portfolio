import { createServer } from 'node:http';
import handler from '../../../api/index.js';

// Exercise the same handler Vercel invokes, without deploying or loading project secrets.
createServer((req, res) => handler(req, res)).listen(Number(process.env.API_PORT), '127.0.0.1');
