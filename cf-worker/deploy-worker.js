const https = require('https');

// ==============================
// إعدادات - يجب تعبئتها
// ==============================
const CF_ACCOUNT_ID = process.argv[2]; // Account ID من Cloudflare Dashboard
const CF_API_TOKEN  = process.argv[3]; // API Token من Cloudflare Dashboard
const WORKER_NAME   = 'trexshop-supabase-proxy';

const WORKER_SCRIPT = `
const SUPABASE_URL = 'https://udqnrsrwzifrzseixrcj.supabase.co';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info, prefer, range',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const targetPath = url.pathname.replace('/supabase', '') || '/';
    const targetUrl = SUPABASE_URL + targetPath + (url.search || '');

    const newHeaders = new Headers(request.headers);
    newHeaders.delete('host');

    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'follow',
    });

    try {
      const response = await fetch(proxyRequest);
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'apikey, authorization, content-type, x-client-info, prefer, range');
      responseHeaders.set('Access-Control-Expose-Headers', 'content-range, content-location, sb-project-ref');
      responseHeaders.delete('set-cookie');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Proxy error', details: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
`;

if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error('Usage: node deploy-worker.js <ACCOUNT_ID> <API_TOKEN>');
  process.exit(1);
}

const boundary = '----FormBoundary' + Date.now();
const body = [
  '--' + boundary,
  'Content-Disposition: form-data; name="metadata"',
  'Content-Type: application/json',
  '',
  JSON.stringify({ main_module: 'worker.js', compatibility_date: '2024-01-01' }),
  '--' + boundary,
  'Content-Disposition: form-data; name="worker.js"; filename="worker.js"',
  'Content-Type: application/javascript+module',
  '',
  WORKER_SCRIPT,
  '--' + boundary + '--',
].join('\r\n');

const options = {
  hostname: 'api.cloudflare.com',
  path: '/client/v4/accounts/' + CF_ACCOUNT_ID + '/workers/scripts/' + WORKER_NAME,
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + CF_API_TOKEN,
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': Buffer.byteLength(body),
  },
};

console.log('Deploying Worker to Cloudflare...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.success) {
        console.log('SUCCESS: Worker deployed!');
      } else {
        console.error('FAILED:', JSON.stringify(result.errors, null, 2));
      }
    } catch(e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(body);
req.end();
