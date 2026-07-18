/**
 * Cloudflare Worker - Supabase Proxy
 * يعمل كـ proxy لـ Supabase API لتخطي الحجب في اليمن
 * يُشغَّل على Cloudflare Workers ويُربط بمسار /supabase/* على trexshopmax.com
 */

const SUPABASE_URL = 'https://udqnrsrwzifrzseixrcj.supabase.co';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only proxy /supabase/* paths
    if (!url.pathname.startsWith('/supabase')) {
      return new Response('Not Found', { status: 404 });
    }

    // Strip the /supabase prefix and forward to Supabase
    const targetPath = url.pathname.replace('/supabase', '') || '/';
    const targetUrl = SUPABASE_URL + targetPath + (url.search || '');

    // Forward the request with all original headers
    const newHeaders = new Headers(request.headers);

    // Remove host header (will be set by CF)
    newHeaders.delete('host');

    // Add CORS headers
    newHeaders.set('Origin', SUPABASE_URL);

    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'follow',
    });

    try {
      const response = await fetch(proxyRequest);

      // Build response with CORS headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'apikey, authorization, content-type, x-client-info, prefer, range');
      responseHeaders.set('Access-Control-Expose-Headers', 'content-range, content-location');
      responseHeaders.delete('set-cookie'); // Avoid cookie issues

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
