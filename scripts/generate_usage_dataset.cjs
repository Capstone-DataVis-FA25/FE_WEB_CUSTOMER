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
  const re = />\s*([^<>\n]+?)\s*</g;
  let m;
  while ((m = re.exec(content))) {
    const t = m[1].trim();
    if (t && t.length > 2 && t.length < 200) results.add(t);
  }
  const quoteRe = /['"`]([A-Za-z0-9 \-:,.()\/&]+?)['"`]/g;
  while ((m = quoteRe.exec(content))) {
    const t = m[1].trim();
    if (t && t.length > 2 && t.length < 120 && /[a-zA-Z]/.test(t)) results.add(t);
  }
  return Array.from(results);
}

function inferRouteFromFilename(filePath) {
  const rel = path.relative(SRC, filePath).replace(/\\/g, '/');
  if (rel.startsWith('pages/')) {
    const p = rel.replace(/^pages\//, '').replace(/\/index\.(jsx?|tsx?)$/, '').replace(/\.(jsx?|tsx?)$/, '');
    return '/' + p.replace(/\\/g, '/');
  }
  return null;
}

function findRoutes() {
  const results = [];
  const possible = [path.join(SRC, 'config', 'routes.ts'), path.join(SRC, 'router', 'AppRouter.tsx'), path.join(SRC, 'routes.ts')];
  for (const p of possible) {
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, 'utf8');
    const re = /path\s*[:=]\s*["'`]([^"'`]+)["'`]/g;
    let m;
    while ((m = re.exec(content))) {
      results.push(m[1]);
    }
    const re2 = /<Route[^>]*path=["'`]([^"'`]+)["'`]/g;
    while ((m = re2.exec(content))) results.push(m[1]);
  }
  return Array.from(new Set(results));
}

function main() {
  const files = walk(SRC).filter(f => f.endsWith('.tsx') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.md'));
  const dataset = [];
  const pagesOut = [];
  const routesOut = [];
  const uiStringsOut = [];
  const howtoOut = [];

  const pages = files.filter(f => f.includes(path.join('src', 'pages')) );
  for (const p of pages) {
    const rel = path.relative(ROOT, p).replace(/\\/g, '/');
    const name = path.basename(p).replace(/\.(tsx|jsx|ts|js|md)$/, '');
    const inferred = inferRouteFromFilename(p) || '/' + name.toLowerCase();
    const item = {
      instruction: `How do I open the ${name} page?`,
      input: `Source file: ${rel}`,
      output: `Navigate to ${inferred} in the web app. (Page implemented in ${rel})`,
      filePath: rel,
      type: 'page',
      confidence: 0.95,
    };
    dataset.push(item);
    pagesOut.push(item);
  }

  const routes = findRoutes();
  for (const r of routes) {
    const item = { instruction: `Where can I find the page for ${r}?`, input: `Look for route: ${r}`, output: `Open ${r} in the browser or check route definition in source.`, filePath: null, type: 'route', confidence: 0.9 };
    dataset.push(item);
    routesOut.push(item);
  }

  for (const f of files) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const strings = extractTextFromJSX(content).slice(0, 12);
      const rel = path.relative(ROOT, f).replace(/\\/g, '/');
      for (const s of strings) {
        const item = { instruction: `What does the UI show for ${path.basename(f)}?`, input: `Source file: ${rel}`, output: s, filePath: rel, type: 'ui_string', confidence: 0.6 };
        dataset.push(item);
        uiStringsOut.push(item);
      }
    } catch (e) {}
  }

  const unique = [];
  const seen = new Set();
  for (const d of dataset) {
    const key = d.instruction + '||' + d.output;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(d);
  }

  // Heuristic: generate simple how-to steps for actionable pages
  const actionVerbs = ['create', 'upload', 'edit', 'add', 'new', 'import', 'export', 'login', 'register', 'delete', 'chart', 'dataset'];
  function looksActionable(rel, strings) {
    const name = String(rel).toLowerCase();
    for (const v of actionVerbs) if (name.includes(v)) return true;
    for (const s of strings) {
      const low = s.toLowerCase();
      for (const v of actionVerbs) if (low.includes(v)) return true;
    }
    return false;
  }

  // build a map of file -> extracted strings for reuse
  const fileStringsMap = new Map();
  for (const it of uiStringsOut) {
    const arr = fileStringsMap.get(it.filePath) || [];
    arr.push(it.output);
    fileStringsMap.set(it.filePath, arr);
  }

  for (const p of pagesOut) {
    const rel = p.filePath;
    const strings = fileStringsMap.get(rel) || [];
    if (looksActionable(rel, strings)) {
      // create a conservative how-to with generic steps
      const stepText = [];
      stepText.push(`1) Open the app and navigate to ${p.output.match(/Navigate to ([^ ]+)/)?.[1] ?? 'the page'}.`);
      if (strings.length) {
        const btn = strings.find(s => /create|new|upload|add|import|submit|save/i.test(s));
        if (btn) stepText.push(`2) Click the button or link labeled "${btn}".`);
      }
      stepText.push('3) Fill required fields on the form and submit.');
      const how = { instruction: `How to ${rel.includes('create') ? 'create' : rel.includes('upload') ? 'upload' : 'use'} on ${rel}`, input: `Source file: ${rel}`, output: stepText.join(' '), filePath: rel, type: 'howto', confidence: 0.8 };
      howtoOut.push(how);
      dataset.push(how);
    }
  }

  const stream = fs.createWriteStream(OUT_FILE, { flags: 'w' });
  for (const item of unique) {
    stream.write(JSON.stringify(item, null, 0) + '\n');
  }
  stream.end();
  console.log(`Wrote ${unique.length} examples to ${OUT_FILE}`);

  // write categorized files
  const writeJsonl = (arr, outPath) => {
    const s = fs.createWriteStream(outPath, { flags: 'w' });
    for (const it of arr) s.write(JSON.stringify(it) + '\n');
    s.end();
  };
  writeJsonl(pagesOut, path.join(OUT_DIR, 'pages.jsonl'));
  writeJsonl(routesOut, path.join(OUT_DIR, 'routes.jsonl'));
  writeJsonl(uiStringsOut, path.join(OUT_DIR, 'ui_strings.jsonl'));
  writeJsonl(howtoOut, path.join(OUT_DIR, 'howto.jsonl'));
  console.log(`Wrote categorized files to ${OUT_DIR}`);
}

main();
