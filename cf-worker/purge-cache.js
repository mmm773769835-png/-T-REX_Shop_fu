const https = require('https');

const CF_ZONE_ID = process.argv[2];
const CF_API_TOKEN = process.argv[3];

if (!CF_ZONE_ID || !CF_API_TOKEN) {
  console.error('Usage: node purge-cache.js <ZONE_ID> <API_TOKEN>');
  process.exit(1);
}

const body = JSON.stringify({ purge_everything: true });

const options = {
  hostname: 'api.cloudflare.com',
  path: '/client/v4/zones/' + CF_ZONE_ID + '/purge_cache',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + CF_API_TOKEN,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

console.log('Purging Cloudflare cache...');
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.success) {
      console.log('SUCCESS: Cache purged! Wait 30 seconds then try /admin again.');
    } else {
      console.error('FAILED:', JSON.stringify(result.errors, null, 2));
    }
  });
});
req.on('error', err => console.error('Error:', err));
req.write(body);
req.end();
