const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'dist', 'sitemap-index.xml');
const dest = path.join(__dirname, '..', 'dist', 'sitemap.xml');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Copied sitemap-index.xml to sitemap.xml');
}
