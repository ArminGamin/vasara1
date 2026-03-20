const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
if (!m) {
  console.log('No match');
  process.exit(1);
}
try {
  const parsed = JSON.parse(m[1].trim());
  console.log('Valid JSON. @graph length:', parsed['@graph']?.length);
} catch (e) {
  console.log('Parse error:', e.message);
  process.exit(1);
}
