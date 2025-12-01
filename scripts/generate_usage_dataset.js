const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT_DIR = path.join(ROOT, 'dataset');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const OUT_FILE = path.join(OUT_DIR, 'usage_dataset.jsonl');

function walk(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) {
      files.push(...walk(p));
    } else {
      files.push(p);
    }
  }
  return files;
}

function extractTextFromJSX(content) {
  const results = new Set();
  // naive: capture text between >...< for JSX
  const re = />\s*([^<>\n]+?)\s*</g;
  let m;
  while ((m = re.exec(content))) {
    const t = m[1].trim();
    if (t && t.length > 2 && t.length < 200) results.add(t);
  }
  // also capture strings in template literals or normal quotes for labels
  const quoteRe = /['"`]([A-Za-z0-9 \-:,.()\/&]+?)['"`]/g;
  while ((m = quoteRe.exec(content))) {
    const t = m[1].trim();
    if (t && t.length > 2 && t.length < 120 && /[a-zA-Z]/.test(t)) results.add(t);
  }
  return Array.from(results);
}

function inferRouteFromFilename(filePath) {
  const rel = path.relative(SRC, filePath).replace(/\\/g, '/');
  // pages/... -> /... path
  if (rel.startsWith('pages/')) {
    const p = rel
      .replace(/^pages\//, '')
      .replace(/\/index\.(jsx?|tsx?)$/, '')
      .replace(/\.(jsx?|tsx?)$/, '');
    return '/' + p.replace(/\\/g, '/');
  }
  return null;
}

function findRoutes() {
  const candidates = [
    'src/config/routes.ts',
    'src/router/AppRouter.tsx',
    'src/routes.ts',
    'src/config/routes.js',
  ];
  for (const c of candidates) {
    const fp = path.join(ROOT, '..', path.basename(ROOT) === 'FE_WEB_CUSTOMER' ? '..' : '..', c);
  }
  const results = [];
  // also try common path inside project
  const possible = [
    path.join(SRC, 'config', 'routes.ts'),
    path.join(SRC, 'router', 'AppRouter.tsx'),
    path.join(SRC, 'routes.ts'),
  ];
  for (const p of possible) {
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, 'utf8');
    const re = /path\s*[:=]\s*["'`]([^"'`]+)["'`]/g;
    let m;
    while ((m = re.exec(content))) {
      results.push(m[1]);
    }
    // also match <Route path="..."
    const re2 = /<Route[^>]*path=["'`]([^"'`]+)["'`]/g;
    while ((m = re2.exec(content))) results.push(m[1]);
  }
  return Array.from(new Set(results));
}

function main() {
  const files = walk(SRC).filter(
    f =>
      f.endsWith('.tsx') ||
      f.endsWith('.jsx') ||
      f.endsWith('.ts') ||
      f.endsWith('.js') ||
      f.endsWith('.md')
  );
  const dataset = [];

  // collect pages
  const pages = files.filter(
    f =>
      f.includes(path.join('src', 'pages')) ||
      f.includes(path.join('src', 'pages').replace('/', path.sep))
  );
  for (const p of pages) {
    const rel = path.relative(ROOT, p).replace(/\\/g, '/');
    const name = path.basename(p).replace(/\.(tsx|jsx|ts|js|md)$/, '');
    const inferred = inferRouteFromFilename(p) || '/' + name.toLowerCase();
    dataset.push({
      instruction: `How do I open the ${name} page?`,
      input: `Source file: ${rel}`,
      output: `Navigate to ${inferred} in the web app. (Page implemented in ${rel})`,
    });
  }

  // collect route definitions
  const routes = findRoutes();
  for (const r of routes) {
    dataset.push({
      instruction: `Where can I find the page for ${r}?`,
      input: `Look for route: ${r}`,
      output: `Open ${r} in the browser or check route definition in source.`,
    });
  }

  // extract UI strings and create Q/A pairs
  for (const f of files) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const strings = extractTextFromJSX(content).slice(0, 12);
      const rel = path.relative(ROOT, f).replace(/\\/g, '/');
      for (const s of strings) {
        dataset.push({
          instruction: `What does the UI show for ${path.basename(f)}?`,
          input: `Source file: ${rel}`,
          output: s,
        });
      }
    } catch (e) {}
  }

  // small dedupe
  const unique = [];
  const seen = new Set();
  for (const d of dataset) {
    const key = d.instruction + '||' + d.output;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(d);
  }

  // write jsonl
  const stream = fs.createWriteStream(OUT_FILE, { flags: 'w' });
  for (const item of unique) {
    stream.write(JSON.stringify(item, null, 0) + '\n');
  }
  stream.end();
  console.log(`Wrote ${unique.length} examples to ${OUT_FILE}`);
}

main();
