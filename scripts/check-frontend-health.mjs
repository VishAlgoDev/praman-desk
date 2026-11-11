import { performance } from 'node:perf_hooks';

async function checkFrontend() {
  const url = 'https://praman-desk.vercel.app';
  console.log(`Checking frontend at: ${url}...`);

  const start = performance.now();
  const res = await fetch(url);
  const dur = performance.now() - start;

  console.log(`HTTP Status: ${res.status} ${res.statusText}`);
  console.log(`Latency:     ${dur.toFixed(1)} ms`);
  console.log('Headers:');
  console.log('  content-type:', res.headers.get('content-type'));
  console.log('  cache-control:', res.headers.get('cache-control'));
  console.log('  server:', res.headers.get('server'));
  console.log('  x-vercel-id:', res.headers.get('x-vercel-id'));

  const html = await res.text();
  console.log(`HTML Length: ${html.length} bytes`);

  // Basic HTML validation checks
  const checks = {
    doctype: /<!doctype\s+html>/i.test(html),
    head: /<head>[\s\S]*<\/head>/i.test(html),
    body: /<body>[\s\S]*<\/body>/i.test(html),
    title: /<title>(.*?)<\/title>/i.exec(html)?.[1],
    hasH1: /<h1>(.*?)<\/h1>/i.exec(html)?.[1],
    hasScript: /<script[\s\S]*?<\/script>/i.test(html),
    hasStyle: /<style[\s\S]*?<\/style>/i.test(html),
    openTagsCount: (html.match(/<div/g) || []).length,
    closeTagsCount: (html.match(/<\/div>/g) || []).length,
    unclosedBrackets: html.split('<').length === html.split('>').length
  };

  console.log('HTML Structure Verification:', checks);

  // Check all referenced assets (links, src, etc.)
  const srcMatches = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m => m[1]);
  console.log('Referenced URLs in HTML:', srcMatches.length);
  const internalAssets = srcMatches.filter(u => u.startsWith('/') && !u.startsWith('//'));
  console.log('Internal asset links:', internalAssets);

  for (const asset of internalAssets) {
    const assetUrl = `${url}${asset}`;
    const aRes = await fetch(assetUrl);
    console.log(`  Asset ${asset} -> HTTP ${aRes.status}`);
  }
}

checkFrontend().catch(console.error);
