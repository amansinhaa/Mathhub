const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const sitemapChunk = path.join(distDir, 'sitemap-0.xml');
const sitemapIndex = path.join(distDir, 'sitemap-index.xml');
const sitemapDest = path.join(distDir, 'sitemap.xml');
const publicDest = path.join(__dirname, '..', 'public', 'sitemap.xml');

// Prefer copying the full urlset from sitemap-0.xml directly to sitemap.xml
if (fs.existsSync(sitemapChunk)) {
  fs.copyFileSync(sitemapChunk, sitemapDest);
  fs.copyFileSync(sitemapChunk, publicDest);
  console.log('Successfully generated dist/sitemap.xml with full urlset (from sitemap-0.xml)');
} else if (fs.existsSync(sitemapIndex)) {
  fs.copyFileSync(sitemapIndex, sitemapDest);
  fs.copyFileSync(sitemapIndex, publicDest);
  console.log('Copied sitemap-index.xml to dist/sitemap.xml');
}
