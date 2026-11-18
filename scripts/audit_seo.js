const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(walk(full));
    } else if (full.endsWith('.astro')) {
      files.push(full);
    }
  }
  return files;
}

const pages = walk('src/pages');
const audit = [];

for (const p of pages) {
  const content = fs.readFileSync(p, 'utf8');
  const relPath = path.relative('src/pages', p).replace(/\\/g, '/');
  
  const titleMatch = content.match(/title\s*=\s*['"]([^'"]+)['"]/) || content.match(/const\s+title\s*=\s*['"]([^'"]+)['"]/);
  const descMatch = content.match(/description\s*=\s*['"]([^'"]+)['"]/) || content.match(/const\s+description\s*=\s*['"]([^'"]+)['"]/);
  const canMatch = content.match(/canonical\s*=\s*['"]([^'"]+)['"]/) || content.match(/const\s+canonical\s*=\s*['"]([^'"]+)['"]/);
  
  audit.push({
    file: relPath,
    title: titleMatch ? titleMatch[1] : (content.includes('title={') ? 'DYNAMIC' : 'MISSING'),
    desc: descMatch ? descMatch[1] : (content.includes('description={') ? 'DYNAMIC' : 'MISSING'),
    canonical: canMatch ? canMatch[1] : (content.includes('canonical={') ? 'DYNAMIC' : 'AUTO_PATH')
  });
}

console.log(JSON.stringify(audit, null, 2));
