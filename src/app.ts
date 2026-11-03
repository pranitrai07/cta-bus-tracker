import express, { type ErrorRequestHandler } from 'express';
import { CtaApiError } from './cta/client.js';
import { transitRouter } from './modules/transit/transit.routes.js';

export const app = express();
app.disable('x-powered-by');
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', transitRouter);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof CtaApiError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error('Unhandled API error:', error);
  res.status(500).json({ error: 'Unexpected server error.' });
};
app.use(errorHandler);
