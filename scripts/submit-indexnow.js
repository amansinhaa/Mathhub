const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'www.easyequate.com';
const KEY = '9f881cd700de4aef9b450e4605dae36d';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function getUrls() {
  const sitemapPath = path.join(__dirname, '..', 'dist', 'sitemap-0.xml');
  const fallbackPath = path.join(__dirname, '..', 'dist', 'sitemap.xml');
  const fileToRead = fs.existsSync(sitemapPath) ? sitemapPath : fallbackPath;

  if (!fs.existsSync(fileToRead)) {
    console.error('No sitemap found. Run `npm run build` first.');
    return [];
  }

  const content = fs.readFileSync(fileToRead, 'utf8');
  const matches = content.match(/<loc>(https:\/\/[^<]+)<\/loc>/g) || [];
  return matches.map(m => m.replace(/<\/?loc>/g, ''));
}

async function submitIndexNow() {
  const urls = getUrls();
  if (urls.length === 0) {
    console.log('No URLs to submit.');
    return;
  }

  console.log(`Submitting ${urls.length} URLs to IndexNow (Bing & Copilot)...`);

  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  });

  const endpoints = ['yandex.com', 'api.indexnow.org', 'www.bing.com'];

  for (const endpoint of endpoints) {
    try {
      const res = await sendRequest(endpoint, payload);
      console.log(`✓ Successfully notified ${endpoint} (Status: ${res.status})`);
    } catch (err) {
      console.error(`✗ Notice for ${endpoint}:`, err.message);
    }
  }
}

function sendRequest(hostname, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          resolve({ status: res.statusCode, body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body || res.statusMessage}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

submitIndexNow();
