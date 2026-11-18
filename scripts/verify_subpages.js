const fs = require('fs');
const files = [
  'dist/quadratic-equation-solver/index.html',
  'dist/formula-sheet/gcse/index.html',
  'dist/learn/how-to-find-domain-and-range/index.html'
];

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
  const desc = (html.match(/<meta\s+name="description"\s+content="([^"]+)"/) || [])[1];
  const canonical = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/) || [])[1];
  const ogUrl = (html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/) || [])[1];
  const ogTitle = (html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) || [])[1];
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim();
  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m => m[1]?.replace(/<[^>]+>/g, '').trim());
  const isSpaRoot = html.includes('<div id="root"></div>');
  
  console.log('----------------------------------------------------');
  console.log('FILE:', f);
  console.log('Title:', title);
  console.log('Description:', desc);
  console.log('Canonical:', canonical);
  console.log('OG URL:', ogUrl);
  console.log('OG Title:', ogTitle);
  console.log('H1 Heading:', h1);
  console.log('H2 Headings:', h2Matches);
  console.log('Page HTML Size:', (html.length / 1024).toFixed(1) + ' KB');
  console.log('Is empty SPA shell (<div id="root"></div>)?', isSpaRoot);
}
