import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer, get as httpGet, type Server } from 'node:http';
import { afterEach, test } from 'node:test';

process.env.CTA_API_KEY = 'test-api-key';

const { app } = await import('./app.js');

let server: Server | undefined;
let originalFetch: typeof fetch | undefined;

async function startServer(): Promise<string> {
  server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');
  return `http://127.0.0.1:${address.port}`;
}

async function request(path: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const baseUrl = await startServer();
  return new Promise((resolve, reject) => {
    const req = httpGet(`${baseUrl}${path}`, (response) => {
      let raw = '';
      response.setEncoding('utf8');
      response.on('data', (chunk: string) => { raw += chunk; });
      response.on('end', () => {
        try {
          resolve({ status: response.statusCode ?? 0, body: JSON.parse(raw) as Record<string, unknown> });
        } catch (error) { reject(error); }
      });
    });
    req.on('error', reject);
  });
}

function mockCtaResponse(payload: unknown, inspect?: (url: URL) => void): void {
  originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    inspect?.(url);
    return new Response(JSON.stringify({ 'bustime-response': payload }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;
}

afterEach(async () => {
  if (originalFetch) globalThis.fetch = originalFetch;
  originalFetch = undefined;
  if (server?.listening) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => error ? reject(error) : resolve());
    });
  }
  server = undefined;
});

test('health endpoint responds without calling CTA', async () => {
  const response = await request('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('routes are returned and the server adds its key to the CTA request', async () => {
  mockCtaResponse({ routes: [{ rt: '20', rtnm: 'Madison' }] }, (url) => {
    assert.equal(url.pathname, '/bustime/api/v3/getroutes');
    assert.equal(url.searchParams.get('key'), 'test-api-key');
    assert.equal(url.searchParams.get('format'), 'json');
  });

  const response = await request('/api/routes');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { routes: [{ rt: '20', rtnm: 'Madison' }] });
});

test('route directions use the requested CTA route ID', async () => {
  mockCtaResponse({ directions: [{ id: 'Eastbound', name: 'Eastbound' }] }, (url) => {
    assert.equal(url.pathname, '/bustime/api/v3/getdirections');
    assert.equal(url.searchParams.get('rt'), '20');
  });

  const response = await request('/api/routes/20/directions');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { directions: [{ id: 'Eastbound', name: 'Eastbound' }] });
});

test('stop lookup forwards route and direction; missing search parameters are rejected', async () => {
  mockCtaResponse({ stops: [{ stpid: '1234', stpnm: 'Madison & State' }] }, (url) => {
    assert.equal(url.pathname, '/bustime/api/v3/getstops');
    assert.equal(url.searchParams.get('rt'), '20');
    assert.equal(url.searchParams.get('dir'), 'Eastbound');
  });

  const response = await request('/api/stops?routeId=20&direction=Eastbound');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { stops: [{ stpid: '1234', stpnm: 'Madison & State' }] });

  const invalid = await request('/api/stops');
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error, 'Provide stopId or both routeId and direction.');
});

test('predictions request Unix timestamps and return CTA predictions', async () => {
  mockCtaResponse({ prd: [{ stpid: '1234', rt: '20', prdctdn: '5', prdtm: '1730000000000' }] }, (url) => {
    assert.equal(url.pathname, '/bustime/api/v3/getpredictions');
    assert.equal(url.searchParams.get('stpid'), '1234');
    assert.equal(url.searchParams.get('unixTime'), 'true');
    assert.equal(url.searchParams.get('tmres'), 's');
  });

  const response = await request('/api/stops/1234/predictions');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    stopId: '1234',
    predictions: [{ stpid: '1234', rt: '20', prdctdn: '5', prdtm: '1730000000000' }],
  });
});
