import { config } from '../config.js';

export class CtaApiError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
    this.name = 'CtaApiError';
  }
}

type CtaEnvelope = {
  'bustime-response'?: Record<string, unknown>;
};

export async function ctaGet<T>(endpoint: string, params: Record<string, string | undefined> = {}): Promise<T> {
  const url = new URL(`${config.ctaApiBaseUrl}/${endpoint}`);
  url.searchParams.set('key', config.ctaApiKey);
  url.searchParams.set('format', 'json');
  if (config.ctaDataFeed) url.searchParams.set('rtpidatafeed', config.ctaDataFeed);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new CtaApiError('Could not reach the CTA Bus Tracker API. Please try again.', 503);
  }

  if (!response.ok) {
    throw new CtaApiError(`CTA Bus Tracker API returned HTTP ${response.status}.`);
  }

  let payload: CtaEnvelope;
  try {
    payload = (await response.json()) as CtaEnvelope;
  } catch {
    throw new CtaApiError('CTA Bus Tracker API returned an unreadable response.');
  }

  const body = payload['bustime-response'];
  if (!body) throw new CtaApiError('CTA Bus Tracker API response was missing its data.');
  const errors = body.error;
  if (errors) {
    const first = Array.isArray(errors) ? errors[0] : errors;
    const message = typeof first === 'object' && first !== null && 'msg' in first
      ? String((first as { msg: unknown }).msg)
      : String(first);
    throw new CtaApiError(message, 400);
  }

  return body as T;
}

export function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}
