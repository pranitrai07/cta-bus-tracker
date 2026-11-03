import 'dotenv/config';

function required(value: string | undefined, name: string): string {
  if (!value?.trim()) {
    throw new Error(`${name} is required. Copy .env.example to .env and configure it.`);
  }
  return value.trim();
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  ctaApiKey: required(process.env.CTA_API_KEY, 'CTA_API_KEY'),
  ctaApiBaseUrl: (process.env.CTA_API_BASE_URL ?? 'https://www.ctabustracker.com/bustime/api/v3').replace(/\/$/, ''),
  ctaDataFeed: process.env.CTA_DATA_FEED?.trim() || undefined,
};
