import { performance } from 'node:perf_hooks';

const ROUTES = ['/', '/desks', '/verify', '/docs', '/roadmap'];

async function checkFrontend() {
  const baseUrl = process.env.PRAMAN_BASE_URL || 'https://praman-desk.vercel.app';
  console.log(`Checking multi-page frontend at: ${baseUrl}...`);
  const seenAssets = new Set();

  for (const route of ROUTES) {
    const url = `${baseUrl}${route}`;
    const start = performance.now();
    const res = await fetch(url);
    const dur = performance.now() - start;
    console.log(`\nRoute ${route} -> HTTP ${res.status} (${dur.toFixed(1)} ms)`);
    if (res.status !== 200) {
      throw new Error(`Route ${route} returned HTTP ${res.status}`);
    }

    const html = await res.text();
    const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
    const checks = {
      doctype: /<!doctype\s+html>/i.test(html),
      hasTitle: /<title>.*<\/title>/i.test(html),
      h1Count,
      hasMain: /<main[\s>]/i.test(html),
      openDivs: (html.match(/<div[\s>]/g) || []).length,
      closeDivs: (html.match(/<\/div>/g) || []).length,
      bytes: html.length
    };
    console.log('  Structure:', checks);
    if (!checks.doctype || !checks.hasTitle || h1Count !== 1 || !checks.hasMain) {
      throw new Error(`Structure check failed on ${route}: ${JSON.stringify(checks)}`);
    }

    const srcMatches = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map((m) => m[1]);
    for (const asset of srcMatches) {
      if (!asset.startsWith('/') || asset.startsWith('//')) continue;
      if (seenAssets.has(asset)) continue;
      seenAssets.add(asset);
      const aRes = await fetch(`${baseUrl}${asset}`);
      console.log(`  Asset ${asset} -> HTTP ${aRes.status}`);
      if (aRes.status !== 200) {
        throw new Error(`Asset ${asset} returned HTTP ${aRes.status}`);
      }
    }
  }
}

checkFrontend().catch((err) => {
  console.error(err);
  process.exit(1);
});
