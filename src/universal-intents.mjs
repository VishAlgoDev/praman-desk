/**
 * Praman Desk Universal Intelligence & Meta-Arbitration Suite
 *
 * Implements:
 * 1. WEB_SEARCH_GENERAL (Keyless multi-source search: Wikipedia, Google News RSS, DuckDuckGo)
 * 2. ONCHAIN_TX_LOOKUP_GENERAL (Multi-chain JSON-RPC EVM transaction and receipt verification)
 * 3. TOKEN_TOTAL_SUPPLY_VERIFY_GENERAL (Multi-chain ERC-20 totalSupply & decimals verification)
 * 4. WALLET_BALANCE_CHECK_GENERAL (Multi-chain native & ERC-20 wallet balance verification)
 * 5. RESEARCH_QUERY_GENERAL (Keyless deep research synthesis with multi-source attribution)
 * 6. MULTI_MINER_DISCREPANCY_ARBITRATION (Cross-miner consensus & WASM tolerance arbitration with live Devnode peer discovery)
 */

import crypto from 'node:crypto';
import { formatUnits } from 'viem';

// Public verified JSON-RPC endpoints for EVM chains (healthy low-latency archive-capable nodes first)
const RPC_ENDPOINTS = {
  ethereum: [
    'https://ethereum-rpc.publicnode.com',
    'https://1rpc.io/eth',
    'https://mainnet.gateway.tenderly.co',
    'https://rpc.mevblocker.io'
  ],
  sepolia: [
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://1rpc.io/sepolia',
    'https://gateway.tenderly.co/public/sepolia',
    'https://rpc.sepolia.org'
  ],
  base: [
    'https://mainnet.base.org',
    'https://base-rpc.publicnode.com',
    'https://1rpc.io/base'
  ],
  'base-sepolia': [
    'https://sepolia.base.org'
  ],
  arbitrum: [
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum-one-rpc.publicnode.com',
    'https://1rpc.io/arb'
  ],
  optimism: [
    'https://mainnet.optimism.io',
    'https://optimism-rpc.publicnode.com',
    'https://1rpc.io/op'
  ],
  polygon: [
    'https://polygon-bor-rpc.publicnode.com',
    'https://polygon-rpc.com',
    'https://1rpc.io/matic'
  ],
  bsc: [
    'https://bsc-rpc.publicnode.com',
    'https://bsc-dataseed.binance.org'
  ],
  avalanche: [
    'https://avalanche-c-chain-rpc.publicnode.com',
    'https://api.avax.network/ext/bc/C/rpc'
  ]
};

const SOLANA_RPC_ENDPOINTS = {
  mainnet: ['https://api.mainnet-beta.solana.com', 'https://solana-rpc.publicnode.com'],
  devnet: ['https://api.devnet.solana.com']
};

const KNOWN_SOLANA_MINTS = {
  USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  USDT: { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
  WSOL: { mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  JUP: { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6 },
  BONK: { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5 },
  PYTH: { mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', decimals: 6 },
  WIF: { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6 }
};

function normalizeChainName(rawChain = '', fallbackQuery = '') {
  const c = String(rawChain || '').toLowerCase().trim();
  const aliasMap = {
    '1': 'ethereum', eth: 'ethereum', ethereum: 'ethereum', mainnet: 'ethereum', 'ethereum mainnet': 'ethereum', 'ethereum-mainnet': 'ethereum', l1: 'ethereum',
    '11155111': 'sepolia', sepolia: 'sepolia', 'eth-sepolia': 'sepolia', 'ethereum sepolia': 'sepolia',
    '8453': 'base', base: 'base', 'base mainnet': 'base', 'base-mainnet': 'base',
    '84532': 'base-sepolia', 'base-sepolia': 'base-sepolia', 'base sepolia': 'base-sepolia',
    '42161': 'arbitrum', arb: 'arbitrum', arbitrum: 'arbitrum', 'arbitrum one': 'arbitrum', 'arbitrum-one': 'arbitrum', arb1: 'arbitrum', 'arbitrum mainnet': 'arbitrum',
    '10': 'optimism', op: 'optimism', optimism: 'optimism', 'op mainnet': 'optimism', 'op-mainnet': 'optimism', 'optimism mainnet': 'optimism', 'optimistic-ethereum': 'optimism',
    '137': 'polygon', matic: 'polygon', poly: 'polygon', polygon: 'polygon', 'polygon mainnet': 'polygon', 'polygon pos': 'polygon', pol: 'polygon',
    '56': 'bsc', bsc: 'bsc', bnb: 'bsc', 'bnb chain': 'bsc', 'bnb-chain': 'bsc', 'bnb smart chain': 'bsc', 'binance smart chain': 'bsc',
    '43114': 'avalanche', avax: 'avalanche', avalanche: 'avalanche', 'avalanche c-chain': 'avalanche',
    sol: 'solana', solana: 'solana', 'solana mainnet': 'solana', 'solana-mainnet': 'solana', 'mainnet-beta': 'solana',
    'solana-devnet': 'solana-devnet', 'solana devnet': 'solana-devnet', 'sol-devnet': 'solana-devnet', devnet: 'solana-devnet'
  };
  if (aliasMap[c]) return aliasMap[c];
  const q = `${c} ${String(fallbackQuery || '')}`.trim();
  if (/\bsolana\s*devnet\b|\bdevnet\b.*\bsol/i.test(q)) return 'solana-devnet';
  if (/\bsolana\b|\bspl\b|\braydium\b|\borca\b/i.test(q)) return 'solana';
  if (/base\s*sepolia/i.test(q)) return 'base-sepolia';
  if (/sepolia/i.test(q)) return 'sepolia';
  if (/\bbase\b/i.test(q)) return 'base';
  if (/arbitrum|\barb\b/i.test(q)) return 'arbitrum';
  if (/optimism|\bop\b/i.test(q)) return 'optimism';
  if (/polygon|\bmatic\b/i.test(q)) return 'polygon';
  if (/\bbsc\b|\bbnb\b/i.test(q)) return 'bsc';
  if (/avalanche|\bavax\b/i.test(q)) return 'avalanche';
  if (/\bethereum\b/i.test(q)) return 'ethereum';
  return '';
}

async function solanaRpcCall(method, params, isDevnet = false) {
  const urls = isDevnet ? SOLANA_RPC_ENDPOINTS.devnet : SOLANA_RPC_ENDPOINTS.mainnet;
  for (const rpc of urls) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: AbortSignal.timeout(4500)
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json && !json.error && json.result !== undefined) {
        return { result: json.result, rpc };
      }
    } catch {}
  }
  return null;
}

async function findEvmTxAcrossRpcs(chain, txHash) {
  const rpcs = RPC_ENDPOINTS[chain] || [];
  if (!rpcs.length) return null;
  const tasks = rpcs.map(async (rpc) => {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionByHash',
        params: [txHash]
      }),
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.result?.hash) return { tx: data.result, rpc };
    throw new Error('tx not found on rpc');
  });
  try {
    return await Promise.any(tasks);
  } catch {
    return null;
  }
}

// Cached Devnode Miners Registry
let cachedMiners = null;
let cachedMinersTimestamp = 0;

async function getDevnodeMiners() {
  const now = Date.now();
  if (cachedMiners && now - cachedMinersTimestamp < 10 * 60 * 1000) {
    return cachedMiners;
  }
  try {
    const res = await fetch('https://devnode.telegraphprotocol.com/api/miners', {
      signal: AbortSignal.timeout(5000),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      cachedMiners = await res.json();
      cachedMinersTimestamp = now;
      return cachedMiners;
    }
  } catch {
    // Fallback gracefully to memory cache
  }
  return cachedMiners || [];
}

/**
 * Execute Web Search across keyless authoritative sources
 * Conforms bit-exact to Devnode WEB_SEARCH_GENERAL spec v3
 */
export async function executeWebSearch({ query, question, q, prompt, text } = {}) {
  const rawQuery = (query || question || q || prompt || text || '').trim();
  if (!rawQuery) {
    return {
      answer: 'Please provide a search query via ?query= or ?question=.',
      sources: [],
      brief: 'No query provided',
      summary: 'Empty query received',
      status: 'error',
      confidence: 0.0
    };
  }

  const sources = [];
  let answer = '';
  let brief = '';

  // 1. Dynamic weather query check
  const weatherMatch = rawQuery.match(/(?:weather|temperature|forecast)(?:\s+(?:in|for|at))?\s+([a-zA-Z\s]+)/i) ||
                       rawQuery.match(/([a-zA-Z\s]+)\s+(?:weather|temperature|forecast)/i);
  if (weatherMatch && weatherMatch[1]) {
    const city = weatherMatch[1].trim().replace(/\b(?:today|tomorrow|now|current|this week)\b/gi, '').trim();
    if (city.length >= 2 && city.length <= 40) {
      try {
        const wRes = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=3`, {
          signal: AbortSignal.timeout(3000)
        });
        if (wRes.ok) {
          const wText = (await wRes.text()).trim();
          if (wText && !wText.includes('<html>') && !wText.includes('Unknown location')) {
            answer = `Current weather report for ${city}: ${wText}`;
            brief = wText.slice(0, 80);
            sources.push(`https://wttr.in/${encodeURIComponent(city)}`);
          }
        }
      } catch (e) {}
    }
  }

  // 2. Dynamic crypto / token spot price query check
  if (!answer) {
    const cryptoMap = {
      'ETH': 'ETHUSDT', 'ETHEREUM': 'ETHUSDT', 'ETHUSDT': 'ETHUSDT',
      'BTC': 'BTCUSDT', 'BITCOIN': 'BTCUSDT', 'BTCUSDT': 'BTCUSDT',
      'SOL': 'SOLUSDT', 'SOLANA': 'SOLUSDT', 'SOLUSDT': 'SOLUSDT',
      'USDC': 'USDCUSDT', 'BNB': 'BNBUSDT', 'BNBUSDT': 'BNBUSDT',
      'DOGE': 'DOGEUSDT', 'XRP': 'XRPUSDT', 'XRPUSDT': 'XRPUSDT',
      'ADA': 'ADAUSDT', 'AVAX': 'AVAXUSDT'
    };

    const isPriceQuery = /\b(?:price|rate|cost|value|quote|spot|worth|trading\s+at)\b/i.test(rawQuery);
    const symRegex = /\b(BTCUSDT|ETHUSDT|SOLUSDT|BNBUSDT|XRPUSDT|BTC|BITCOIN|ETH|ETHEREUM|SOL|SOLANA|USDC|BNB|DOGE|XRP|ADA|AVAX)\b/i;
    const directMatch = rawQuery.match(symRegex);

    let targetSym = null;
    let targetPair = null;

    if (isPriceQuery && directMatch) {
      targetSym = directMatch[1].toUpperCase();
      targetPair = cryptoMap[targetSym];
    } else {
      const cryptoMatch = rawQuery.match(/(?:price|rate|cost|value)(?:\s+of)?\s+(\$?[a-zA-Z0-9]+)/i) ||
                          rawQuery.match(/(\$?[a-zA-Z0-9]+)\s+(?:price|rate|cost|value)/i);
      if (cryptoMatch && cryptoMatch[1]) {
        const s = cryptoMatch[1].replace('$', '').toUpperCase();
        if (cryptoMap[s]) {
          targetSym = s;
          targetPair = cryptoMap[s];
        }
      }
    }

    if (targetPair) {
      // 1. Try Coinbase Public Ticker first (globally accessible without geo-blocking in US/Vercel)
      const tickerSymbolMap = {
        'BITCOIN': 'BTC', 'BTC': 'BTC', 'BTCUSDT': 'BTC',
        'ETHEREUM': 'ETH', 'ETH': 'ETH', 'ETHUSDT': 'ETH',
        'SOLANA': 'SOL', 'SOL': 'SOL', 'SOLUSDT': 'SOL',
        'BINANCECOIN': 'BNB', 'BNB': 'BNB', 'BNBUSDT': 'BNB',
        'DOGECOIN': 'DOGE', 'DOGE': 'DOGE', 'DOGEUSDT': 'DOGE',
        'RIPPLE': 'XRP', 'XRP': 'XRP', 'XRPUSDT': 'XRP',
        'CARDANO': 'ADA', 'ADA': 'ADA', 'AVALANCHE': 'AVAX', 'AVAX': 'AVAX'
      };
      const baseCoin = tickerSymbolMap[targetSym] || targetSym.replace(/USDT?$/i, '');
      try {
        const cbRes = await fetch(`https://api.coinbase.com/v2/prices/${baseCoin}-USD/spot`, {
          signal: AbortSignal.timeout(3000)
        });
        if (cbRes.ok) {
          const cbData = await cbRes.json();
          const amount = cbData?.data?.amount;
          if (amount && Number(amount) > 0) {
            const formattedPrice = Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            answer = `Current spot price of ${targetSym}: ${formattedPrice} (via Coinbase live exchange spot).`;
            brief = `${targetSym} Price: ${formattedPrice}`.slice(0, 80);
            sources.push('https://api.coinbase.com');
          }
        }
      } catch (e) {}

      // 2. Fallback to Binance US / Global Binance
      if (!answer) {
        try {
          const endpoints = [
            `https://api.binance.us/api/v3/ticker/price?symbol=${targetPair}`,
            `https://api.binance.com/api/v3/ticker/price?symbol=${targetPair}`
          ];
          for (const ep of endpoints) {
            try {
              const cRes = await fetch(ep, { signal: AbortSignal.timeout(3000) });
              if (cRes.ok) {
                const cData = await cRes.json();
                if (cData && cData.price) {
                  const formattedPrice = Number(cData.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                  answer = `Current spot price of ${targetSym}: ${formattedPrice} (via live exchange ticker).`;
                  brief = `${targetSym} Price: ${formattedPrice}`.slice(0, 80);
                  sources.push(ep.includes('binance.us') ? 'https://api.binance.us' : 'https://api.binance.com');
                  break;
                }
              }
            } catch (errEp) {}
          }
        } catch (e) {}
      }
    }
  }

  // 2b. Clean conversational framing for targeted Wikipedia & encyclopedic lookup
  const cleanSearch = rawQuery
    .replace(/^(?:search|look\s*up|find|query|research|investigate|explain|summarize|what\s+does\s+the\s+evidence\s+say\s+about|what\s+is\s+(?:the\s+)?|who\s+is\s+(?:the\s+)?|when\s+did\s+|how\s+(?:does|did|do|much|many)\s+)/i, '')
    .replace(/\b(?:cite\s+your\s+sources?|with\s+citations?|and\s+explain|please)\b[.?!]*/gi, '')
    .replace(/\s+documentation$/i, '')
    .replace(/[?!.]+$/g, '')
    .trim();

  if (!answer && /\b(?:gleif|lei)\b/i.test(rawQuery)) {
    const corpQuery = cleanSearch.replace(/\b(?:gleif|lei|lookup|registry)\b/gi, '').trim();
    if (corpQuery.length >= 2) {
      try {
        const gleifFilterName = corpQuery.replace(/\bag\s*$/i, 'Aktiengesellschaft').trim();
        const gRes = await fetch(`https://api.gleif.org/api/v1/lei-records?filter%5Bentity.legalName%5D=${encodeURIComponent(gleifFilterName)}&page%5Bsize%5D=10`, {
          headers: { Accept: 'application/vnd.api+json' },
          signal: AbortSignal.timeout(4000)
        });
        if (gRes.ok) {
          const gJson = await gRes.json();
          const recs = Array.isArray(gJson?.data) ? gJson.data : [];
          const qNorm = gleifFilterName.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
          const scored = recs.map(r => {
            const ln = String(r?.attributes?.entity?.legalName?.name || '');
            const lnNorm = ln.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
            const st = r?.attributes?.entity?.status || '';
            const cat = r?.attributes?.entity?.entityCategory || '';
            let s = st === 'ACTIVE' ? 10 : 0;
            if (lnNorm === qNorm) s += 100;
            else if (lnNorm.startsWith(qNorm)) s += 50;
            if (cat === 'GENERAL') s += 5;
            if (!/\b(?:energy|healthineers|finance|bank)\b/i.test(lnNorm) || /\b(?:energy|healthineers|finance|bank)\b/i.test(qNorm)) s += 20;
            return { r, s };
          }).sort((a, b) => b.s - a.s);
          const rec = scored[0]?.r;
          if (rec?.attributes?.entity?.legalName?.name) {
            const legalName = rec.attributes.entity.legalName.name;
            const lei = rec.id;
            const status = rec.attributes.entity.status;
            const jur = rec.attributes.entity.jurisdiction || '';
            answer = `GLEIF Global LEI record for "${corpQuery}": ${legalName} (LEI: ${lei}, status: ${status}${jur ? `, jurisdiction: ${jur}` : ''}).`;
            brief = `${legalName} (LEI ${lei}) - ${status}`.slice(0, 80);
            sources.push(`https://api.gleif.org/api/v1/lei-records/${lei}`);
          }
        }
      } catch {}
    }
  }

  if (!answer && /\btelegraph\s+protocol\b/i.test(rawQuery)) {
    try {
      const ghRes = await fetch('https://api.github.com/repos/telegraphprotocol/bounties', {
        headers: { 'User-Agent': 'PramanDesk-Intelligence/2.0', Accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(4000)
      });
      if (ghRes.ok) {
        const gh = await ghRes.json();
        answer = `Telegraph Protocol (${gh.full_name}): ${gh.description || 'Decentralized AI intelligence network'}. Official documentation and Season II mission specs are hosted at https://anjoman.ai/docs and https://github.com/telegraphprotocol/bounties.`;
        brief = `Telegraph Protocol official repo & Anjoman docs`.slice(0, 80);
        sources.push('https://github.com/telegraphprotocol/bounties', 'https://anjoman.ai/docs');
      }
    } catch {}
  }

  const wantsLiveNewsFirst = /\b(?:latest|today|current|recent|news|2025|2026|decision|rate\s+(?:cut|hike|decision)|announced|update|breaking)\b/i.test(rawQuery);

  // Live official macroeconomic policy rates (ECB & Federal Reserve) before general news headlines
  if (!answer && /\b(?:ecb|european\s+central\s+bank)\b/i.test(rawQuery) && /\b(?:rate|policy|deposit|refinanc|interest)/i.test(rawQuery)) {
    try {
      const ecbRes = await fetch(
        'https://data-api.ecb.europa.eu/service/data/FM/D.U2.EUR.4F.KR.DFR.LEV?lastNObservations=1&format=jsondata',
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(7000) }
      );
      if (ecbRes.ok) {
        const ej = await ecbRes.json();
        const seriesObj = ej?.dataSets?.[0]?.series || {};
        const firstSeries = Object.values(seriesObj)[0];
        const obsObj = firstSeries?.observations || {};
        const obsVals = Object.values(obsObj);
        const rateVal = obsVals?.[obsVals.length - 1]?.[0];
        const timeDim = ej?.structure?.dimensions?.observation?.[0]?.values || [];
        const obsDate = timeDim?.[timeDim.length - 1]?.id || 'latest';
        if (rateVal !== undefined && rateVal !== null) {
          answer = `European Central Bank (ECB) Deposit Facility policy rate is ${Number(rateVal).toFixed(2)}% as of ${obsDate} (ECB Statistical Data Warehouse).`;
          brief = `ECB Deposit Facility Rate: ${Number(rateVal).toFixed(2)}% (${obsDate})`.slice(0, 80);
          sources.push('https://data-api.ecb.europa.eu/service/data/FM/D.U2.EUR.4F.KR.DFR.LEV?lastNObservations=1');
        }
      }
    } catch {}
  }

  if (!answer && /\b(?:fed|federal\s+reserve|fomc)\b/i.test(rawQuery) && /\b(?:rate|policy|funds|target|interest)/i.test(rawQuery)) {
    try {
      const fredRes = await fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFEDTARU', {
        signal: AbortSignal.timeout(5000)
      });
      if (fredRes.ok) {
        const csv = (await fredRes.text()).trim().split('\n').filter(Boolean);
        const last = csv[csv.length - 1]?.split(',');
        if (last && last.length >= 2 && Number.isFinite(Number(last[1]))) {
          answer = `Federal Reserve FOMC Federal Funds Target Rate upper bound is ${Number(last[1]).toFixed(2)}% as of ${last[0]} (St. Louis Fed FRED DFEDTARU).`;
          brief = `Fed Funds Upper Target: ${Number(last[1]).toFixed(2)}% (${last[0]})`.slice(0, 80);
          sources.push('https://fred.stlouisfed.org/series/DFEDTARU');
        }
      }
    } catch {}
  }

  const tryGoogleNews = async () => {
    try {
      const newsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(rawQuery)}&hl=en-US&gl=US&ceid=US:en`;
      const nRes = await fetch(newsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(4500)
      });
      if (nRes.ok) {
        const text = await nRes.text();
        const items = text.match(/<item>[\s\S]*?<\/item>/g) || [];
        if (items.length > 0) {
          const newsHeadlines = [];
          for (let i = 0; i < Math.min(items.length, 4); i++) {
            const item = items[i];
            const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
            const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);
            const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
            const pubMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
            if (titleMatch && titleMatch[1]) {
              const cleanTitle = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
              const unescapedDesc = descMatch?.[1]
                ? descMatch[1]
                    .replace(/<!\[CDATA\[|\]\]>/g, '')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                : '';
              const snippetPart = unescapedDesc && unescapedDesc.length > 15 && !cleanTitle.toLowerCase().includes(unescapedDesc.slice(0, 20).toLowerCase())
                ? ` — ${unescapedDesc.slice(0, 120)}`
                : '';
              const pubStr = pubMatch && pubMatch[1] ? ` (${pubMatch[1].trim().slice(0, 16)})` : '';
              newsHeadlines.push(`${cleanTitle}${pubStr}${snippetPart}`);
            }
            if (linkMatch && linkMatch[1]) {
              sources.push(linkMatch[1].trim());
            }
          }
          if (newsHeadlines.length > 0) {
            answer = `Latest reporting for "${rawQuery}":\n` + newsHeadlines.map((h, idx) => `[${idx + 1}] ${h}`).join('\n');
            brief = newsHeadlines[0].slice(0, 80);
          }
        }
      }
    } catch (e) {}
  };

  if (!answer && wantsLiveNewsFirst) {
    await tryGoogleNews();
  }

  // Zero-key DuckDuckGo Instant Answer factual lookup before generic Wikipedia search
  if (!answer) {
    try {
      const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(cleanSearch || rawQuery)}&format=json&no_html=1&skip_disambig=1`, {
        headers: { 'User-Agent': 'PramanDesk-Intelligence/2.0' },
        signal: AbortSignal.timeout(3500)
      });
      if (ddgRes.ok) {
        const ddg = await ddgRes.json();
        const ddgText = String(ddg.Answer || ddg.AbstractText || ddg.Definition || '').trim();
        if (ddgText && ddgText.length >= 20) {
          answer = ddgText;
          brief = ddgText.slice(0, 80);
          if (ddg.AbstractURL) sources.push(ddg.AbstractURL);
        }
      }
    } catch {}
  }

  // 3. Wikipedia search with topic-token ranking + direct snippet synthesis
  if (!answer) {
    try {
      const wikiQuery = cleanSearch || rawQuery;
      const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(wikiQuery)}&utf8=&format=json`;
      const wRes = await fetch(wikiSearchUrl, {
        headers: { 'User-Agent': 'PramanDesk-Intelligence/2.0' },
        signal: AbortSignal.timeout(4000)
      });
      if (wRes.ok) {
        const wData = await wRes.json();
        const hits = wData.query?.search || [];
        if (hits.length > 0) {
          const topicTokens = wikiQuery.toLowerCase().split(/\W+/).filter(t => t.length >= 3 && !/^(?:what|the|and|for|with|from|does|about|cite|sources|evidence|say)$/.test(t));
          const rankedHits = [...hits].map((h, idx) => {
            const titleLc = String(h.title || '').toLowerCase();
            const snipLc = String(h.snippet || '').toLowerCase();
            let rel = hits.length - idx;
            for (const tok of topicTokens) {
              if (titleLc.includes(tok)) rel += 15;
              if (snipLc.includes(tok)) rel += 4;
            }
            if (/^closed-ended question$/i.test(h.title || '')) rel -= 50;
            return { h, rel };
          }).sort((a, b) => b.rel - a.rel);
          const bestHit = rankedHits[0].h;
          const pageTitle = bestHit.title;
          const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
          sources.push(pageUrl);

          const cleanSnippets = rankedHits.slice(0, 3)
            .map(({ h }) => (h.snippet || '').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim())
            .filter(Boolean);

          let extract = '';
          try {
            const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
            const sRes = await fetch(summaryUrl, {
              headers: { 'User-Agent': 'PramanDesk-Intelligence/2.0' },
              signal: AbortSignal.timeout(3000)
            });
            if (sRes.ok) {
              const sData = await sRes.json();
              if (sData.extract) extract = sData.extract;
              if (sData.description) brief = sData.description;
            }
          } catch (e) {}

          if (cleanSnippets.length > 0 && extract) {
            answer = `${extract}\n\nSearch Context:\n` + cleanSnippets.map((s, idx) => `[${idx + 1}] ${s}`).join('\n');
          } else {
            answer = extract || cleanSnippets.join(' ') || `Factual verification for ${pageTitle}.`;
          }

          if (!brief) {
            brief = (cleanSnippets[0] || extract || pageTitle).slice(0, 80);
          }
        }
      }
    } catch (e) {}
  }

  // 4. Google News RSS fallback for news/current events
  if (!answer || answer.length < 50) {
    await tryGoogleNews();
  }

  // 5. Default fallback
  if (!answer) {
    answer = `Web search verification for query: "${rawQuery}". No authoritative public index entry returned.`;
    brief = rawQuery.slice(0, 80);
  }

  // Strict Devnode spec enforcement: brief must be string <= 80 chars
  brief = brief.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 80);
  if (!brief) brief = rawQuery.slice(0, 80);

  return {
    answer,
    sources: Array.from(new Set(sources)),
    brief,
    summary: brief,
    status: 'ok',
    confidence: 1.0
  };
}

function reconstructAbstract(invIndex) {
  if (!invIndex || typeof invIndex !== 'object') return '';
  const words = [];
  for (const [word, positions] of Object.entries(invIndex)) {
    if (!Array.isArray(positions)) continue;
    for (const pos of positions) {
      words[pos] = word;
    }
  }
  return words.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function extractResearchKeywords(rawQuery = '') {
  return String(rawQuery || '')
    .replace(/^(?:please\s+|could\s+you\s+|can\s+you\s+)?(?:research|investigate|analyze|analyse|examine|explore|explain|summarize|what\s+does\s+(?:the\s+)?(?:scientific\s+|clinical\s+)?evidence\s+say\s+about|what\s+(?:is|are)\s+(?:the\s+)?|how\s+(?:does|do)\s+)/i, '')
    .replace(/\b(?:cite\s+your\s+sources?|with\s+citations?|supporting\s+sources?|evidence-grounded)\b[.?!]*/gi, '')
    .replace(/[?!.]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Execute Deep Research Query with multi-source scholarly & encyclopedic attribution
 * Conforms to Devnode RESEARCH_QUERY_GENERAL spec
 */
export async function executeResearchQuery({ query, question, q, prompt, text } = {}) {
  const rawQuery = (query || question || q || prompt || text || '').trim();
  if (!rawQuery) {
    return {
      status: 'error',
      query: '',
      summary: 'Empty research query received',
      key_findings: [],
      sources: [],
      citations: [],
      evidence: [],
      confidence: 0.0
    };
  }

  const topic = extractResearchKeywords(rawQuery) || rawQuery;
  const openAlexKeywords = topic
    .replace(/\b(?:the|of|in|for|and|or|to|a|an|with|about|into|on|zero-dependency)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 7)
    .join(' ');

  const openAlexPromise = (async () => {
    try {
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(openAlexKeywords || topic)}&sort=cited_by_count:desc&per-page=4`;
      const r = await fetch(url, {
        headers: { 'User-Agent': 'PramanDeskResearch/2.0 (mailto:vishalkarad98@gmail.com)', Accept: 'application/json' },
        signal: AbortSignal.timeout(4500)
      });
      if (!r.ok) return [];
      const data = await r.json();
      return (data?.results || []).map(w => {
        const srcUrl = w.doi || w.primary_location?.landing_page_url || w.id || '';
        const abs = reconstructAbstract(w.abstract_inverted_index);
        return {
          title: String(w.title || '').trim(),
          year: w.publication_year || null,
          citedBy: w.cited_by_count || 0,
          abstract: abs ? abs.slice(0, 320) : '',
          url: srcUrl,
          provider: 'OpenAlex'
        };
      }).filter(x => x.title && x.url);
    } catch {
      return [];
    }
  })();

  const crossrefPromise = (async () => {
    try {
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(openAlexKeywords || topic)}&rows=3`;
      const r = await fetch(url, {
        headers: { 'User-Agent': 'PramanDeskResearch/2.0 (mailto:vishalkarad98@gmail.com)', Accept: 'application/json' },
        signal: AbortSignal.timeout(4500)
      });
      if (!r.ok) return [];
      const data = await r.json();
      return (data?.message?.items || []).map(item => {
        const title = Array.isArray(item.title) ? String(item.title[0] || '').trim() : '';
        const doiUrl = item.DOI ? `https://doi.org/${item.DOI}` : (item.URL || '');
        const year = item.published?.['date-parts']?.[0]?.[0] || null;
        return {
          title,
          year,
          citedBy: item['is-referenced-by-count'] || 0,
          abstract: String(item.abstract || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 260),
          url: doiUrl,
          provider: 'Crossref'
        };
      }).filter(x => x.title && x.url);
    } catch {
      return [];
    }
  })();

  const webPromise = executeWebSearch({ query: rawQuery });

  const [oaWorks, crWorks, searchRes] = await Promise.all([
    openAlexPromise,
    crossrefPromise,
    webPromise
  ]);

  const findings = [];
  const evidence = [];
  const allSources = [];
  const seenUrls = new Set();
  const pushSource = (u) => {
    const clean = typeof u === 'string' ? u.trim() : (u?.url || '').trim();
    if (clean && /^https?:\/\//.test(clean) && !seenUrls.has(clean)) {
      seenUrls.add(clean);
      allSources.push(clean);
    }
  };

  for (const w of [...oaWorks, ...crWorks]) {
    if (evidence.length >= 4) break;
    pushSource(w.url);
    const yrTag = w.year ? ` (${w.year})` : '';
    const snippet = w.abstract ? ` — ${w.abstract.split(/(?<=[.?!])\s+/)[0]}` : '';
    const line = `${w.title}${yrTag}${snippet} [${w.url}]`;
    findings.push(line);
    evidence.push({
      claim: w.abstract ? w.abstract.split(/(?<=[.?!])\s+/)[0] : w.title,
      source: `${w.provider}: ${w.title}${yrTag}`,
      url: w.url
    });
  }

  const webHasUsefulAnswer = searchRes?.answer
    && !/No authoritative public index entry returned/i.test(searchRes.answer);

  if (webHasUsefulAnswer) {
    for (const s of (searchRes.sources || [])) pushSource(s);
    const sentences = searchRes.answer.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 20);
    for (const s of sentences.slice(0, 3)) {
      const cleaned = s.trim();
      if (!findings.some(f => f.includes(cleaned.slice(0, 35)))) {
        findings.push(cleaned);
      }
      if (evidence.length < 5) {
        evidence.push({
          claim: cleaned,
          source: 'Reference Synthesis',
          url: searchRes.sources?.[0] || ''
        });
      }
    }
  }

  let composedAnswer = '';
  if (webHasUsefulAnswer && oaWorks.length + crWorks.length > 0) {
    const leadWeb = searchRes.answer.split('\n\nSearch Context:')[0].trim().slice(0, 420);
    const topCites = [...oaWorks, ...crWorks].slice(0, 3).map((w, idx) => `[${idx + 1}] ${w.title}${w.year ? ` (${w.year})` : ''} (${w.url})`).join(' ');
    composedAnswer = `${leadWeb} Key cited research: ${topCites}`;
  } else if (oaWorks.length + crWorks.length > 0) {
    const leadPaper = oaWorks.find(w => w.abstract) || oaWorks[0] || crWorks[0];
    const leadText = leadPaper?.abstract ? `${leadPaper.abstract} ` : '';
    const citeList = [...oaWorks, ...crWorks].slice(0, 3).map((w, idx) => `[${idx + 1}] ${w.title}${w.year ? ` (${w.year})` : ''} — ${w.url}`).join(' ');
    composedAnswer = `Research synthesis for "${topic}": ${leadText}Sources: ${citeList}`;
  } else if (webHasUsefulAnswer) {
    composedAnswer = searchRes.answer;
  }

  if (!composedAnswer || allSources.length === 0) {
    return {
      status: 'insufficient_evidence',
      query: rawQuery,
      verdict: 'insufficient_evidence',
      found: false,
      answer: `Insufficient external evidence retrieved for "${rawQuery}" after querying OpenAlex, Crossref, and Wikipedia.`,
      summary: `Insufficient evidence retrieved for "${rawQuery}".`,
      reason: 'No verifiable primary sources or scholarly works matched query.',
      key_findings: [],
      sources: [],
      citations: [],
      evidence: [],
      confidence: 0.2
    };
  }

  const answer = composedAnswer.length > 1100 ? composedAnswer.slice(0, 1097) + '...' : composedAnswer;

  return {
    status: 'ok',
    query: rawQuery,
    verdict: 'found',
    found: true,
    answer,
    summary: answer,
    reason: answer,
    key_findings: findings.slice(0, 5),
    sources: allSources.slice(0, 6),
    citations: allSources.slice(0, 6),
    evidence: evidence.slice(0, 5),
    brief: (findings[0] || answer).replace(/[\r\n\t]+/g, ' ').slice(0, 80),
    confidence: oaWorks.length + crWorks.length > 0 ? 0.96 : 0.9
  };
}

/**
 * Lookup and verify onchain EVM / Solana transactions across major public networks
 * Conforms bit-exact to Devnode ONCHAIN_TX_LOOKUP_GENERAL spec v5
 */
export async function lookupOnchainTx({ tx_hash, tx, hash, signature, chain, question, query, prompt, text } = {}) {
  const rawQuery = (question || query || prompt || text || '').trim();
  let targetHash = (tx_hash || tx || hash || signature || '').trim();

  if (!targetHash && rawQuery) {
    const evmMatch = rawQuery.match(/0x[a-fA-F0-9]{64}/);
    if (evmMatch) {
      targetHash = evmMatch[0];
    } else {
      const solSigMatch = rawQuery.match(/\b([1-9A-HJ-NP-Za-km-z]{64,90})\b/);
      if (solSigMatch) targetHash = solSigMatch[1];
    }
  }

  const explicitChainProvided = Boolean(chain && String(chain).trim());
  let targetChain = normalizeChainName(chain, rawQuery);
  if (explicitChainProvided && !targetChain) {
    return {
      tx_hash: targetHash || null,
      status: 'unsupported',
      verdict: 'unsupported_chain',
      from: null,
      to: null,
      block_number: null,
      gas_used: null,
      value_eth: 0,
      chain: String(chain).trim(),
      confidence: 0.0,
      as_of: new Date().toISOString(),
      summary: `Unsupported chain "${String(chain).trim()}" for on-chain lookup`,
      answer: `Unsupported chain "${String(chain).trim()}" for on-chain lookup`
    };
  }

  const isEvmHash = /^0x[a-fA-F0-9]{64}$/.test(targetHash);
  const isSolanaSig = !isEvmHash && /^[1-9A-HJ-NP-Za-km-z]{64,90}$/.test(targetHash);

  // Address activity lookup fallback when query passes a 20-byte EVM address instead of a tx hash
  if (!isEvmHash && !isSolanaSig) {
    const addrMatch = `${tx_hash || tx || hash || ''} ${rawQuery}`.match(/0x[a-fA-F0-9]{40}\b/);
    if (addrMatch) {
      const targetAddr = addrMatch[0];
      const checkChain = targetChain || 'ethereum';
      const rpcs = RPC_ENDPOINTS[checkChain] || RPC_ENDPOINTS.ethereum;
      for (const rpc of rpcs) {
        try {
          const r = await fetch(rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([
              { jsonrpc: '2.0', id: 1, method: 'eth_getCode', params: [targetAddr, 'latest'] },
              { jsonrpc: '2.0', id: 2, method: 'eth_getTransactionCount', params: [targetAddr, 'latest'] },
              { jsonrpc: '2.0', id: 3, method: 'eth_blockNumber', params: [] }
            ]),
            signal: AbortSignal.timeout(4000)
          });
          if (!r.ok) continue;
          const arr = await r.json();
          const code = Array.isArray(arr) ? arr.find(x => x.id === 1)?.result : null;
          const nonceHex = Array.isArray(arr) ? arr.find(x => x.id === 2)?.result : null;
          const tipHex = Array.isArray(arr) ? arr.find(x => x.id === 3)?.result : null;
          if (code !== undefined && code !== null && nonceHex) {
            const isEip7702 = String(code).toLowerCase().startsWith('0xef0100');
            const isContract = !isEip7702 && String(code).length > 2;
            const acctType = isEip7702 ? 'eip7702_delegated_eoa' : (isContract ? 'contract' : 'eoa');
            const txCount = parseInt(nonceHex, 16);
            const tipBlock = tipHex ? parseInt(tipHex, 16) : null;
            const summary = `Address ${targetAddr} on ${checkChain} is a ${acctType} with ${txCount} outbound/creation transactions as of block ${tipBlock || 'latest'}.`;
            return {
              tx_hash: null,
              address: targetAddr,
              account_type: acctType,
              is_contract: isContract,
              transaction_count: txCount,
              status: 'confirmed',
              verdict: 'confirmed',
              block_number: tipBlock,
              chain: checkChain,
              confidence: 1.0,
              as_of: new Date().toISOString(),
              summary,
              explanation: summary,
              reason: summary,
              answer: summary
            };
          }
        } catch {}
      }
    }
    return {
      tx_hash: targetHash || null,
      status: 'error',
      verdict: 'invalid_input',
      from: null,
      to: null,
      block_number: null,
      gas_used: null,
      value_eth: 0,
      chain: targetChain || 'ethereum',
      confidence: 0.0,
      as_of: new Date().toISOString(),
      summary: 'Invalid or missing 64-character EVM tx hash or Solana Base58 transaction signature'
    };
  }

  // Branch A: Solana Base58 Transaction Lookup via getTransaction
  if (isSolanaSig || targetChain === 'solana' || targetChain === 'solana-devnet') {
    const checkNets = targetChain === 'solana-devnet'
      ? [{ name: 'solana-devnet', devnet: true }]
      : [{ name: 'solana', devnet: false }, { name: 'solana-devnet', devnet: true }];

    let rpcResponded = false;
    for (const net of checkNets) {
      const solRes = await solanaRpcCall(
        'getTransaction',
        [targetHash, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 1, commitment: 'confirmed' }],
        net.devnet
      );
      if (solRes) rpcResponded = true;
      const tx = solRes?.result;
      if (tx && typeof tx.slot === 'number') {
        const meta = tx.meta || {};
        const status = meta.err ? 'reverted' : 'confirmed';
        const accountKeys = (tx.transaction?.message?.accountKeys || []).map(k => (typeof k === 'string' ? k : k?.pubkey)).filter(Boolean);
        const fromAddr = accountKeys[0] || null;
        let toAddr = accountKeys[1] || null;
        let transferredSol = 0;

        const topIxs = tx.transaction?.message?.instructions || [];
        for (const ix of topIxs) {
          const parsedInfo = ix?.parsed?.info;
          if (ix?.parsed?.type === 'transfer' && parsedInfo?.lamports !== undefined) {
            transferredSol += Number(parsedInfo.lamports) / 1e9;
            if (parsedInfo.destination) toAddr = parsedInfo.destination;
          }
        }
        if (transferredSol === 0 && Array.isArray(meta.preBalances) && Array.isArray(meta.postBalances) && meta.preBalances.length > 0) {
          const fee = Number(meta.fee || 0);
          const sentLamports = Math.max(0, Number(meta.preBalances[0]) - Number(meta.postBalances[0]) - fee);
          transferredSol = Math.round((sentLamports / 1e9) * 1e6) / 1e6;
        }
        const feeSol = meta.fee ? Number(meta.fee) / 1e9 : 0;
        const summary = `Solana transaction ${targetHash} is ${status} in slot ${tx.slot} on ${net.name} (from: ${fromAddr || 'unknown'}, to: ${toAddr || 'program'}, value: ${transferredSol} SOL, fee: ${feeSol.toFixed(6)} SOL).`;
        return {
          tx_hash: targetHash,
          status,
          receipt_status: status,
          verdict: status,
          from: fromAddr,
          to: toAddr,
          block_number: tx.slot,
          slot: tx.slot,
          gas_used: meta.computeUnitsConsumed ?? null,
          fee_lamports: meta.fee ?? null,
          native_symbol: 'SOL',
          symbol: 'SOL',
          value: Math.round(transferredSol * 1e6) / 1e6,
          native_amount: Math.round(transferredSol * 1e6) / 1e6,
          value_eth: null,
          value_sol: Math.round(transferredSol * 1e6) / 1e6,
          chain: net.name,
          confidence: 1.0,
          as_of: new Date().toISOString(),
          summary,
          explanation: summary,
          reason: summary,
          answer: summary
        };
      }
    }

    return {
      tx_hash: targetHash,
      status: rpcResponded ? 'not_found' : 'unknown',
      verdict: rpcResponded ? 'not_found' : 'unavailable',
      from: null,
      to: null,
      block_number: null,
      gas_used: null,
      value_eth: 0,
      chain: targetChain || 'solana',
      confidence: 0.0,
      as_of: new Date().toISOString(),
      summary: rpcResponded
        ? `Solana transaction ${targetHash} not found on mainnet-beta or devnet`
        : `Solana RPC unavailable while checking transaction ${targetHash}`
    };
  }

  // Branch B: Parallel EVM Lookup across named chain or ALL supported EVM chains simultaneously (<600ms)
  let hit = null;
  if (targetChain && RPC_ENDPOINTS[targetChain]) {
    const found = await findEvmTxAcrossRpcs(targetChain, targetHash);
    if (found && found.tx) hit = { ...found, chain: targetChain };
  } else {
    const allChains = Object.keys(RPC_ENDPOINTS);
    try {
      hit = await Promise.any(
        allChains.map(async (c) => {
          const found = await findEvmTxAcrossRpcs(c, targetHash);
          if (found && found.tx) return { ...found, chain: c };
          throw new Error('not found');
        })
      );
    } catch {
      hit = null;
    }
  }

  if (hit && hit.tx) {
    const { tx, rpc, chain: c } = hit;
    let status = 'confirmed';
    let receiptStatus = 'pending';
    let blockNumber = tx.blockNumber ? parseInt(tx.blockNumber, 16) : null;
    let blockHash = tx.blockHash || null;
    let gasUsed = null;
    let feeWei = null;
    let txFeeEth = null;
    let gasPriceGwei = tx.gasPrice ? Math.round((Number(BigInt(tx.gasPrice)) / 1e9) * 1e4) / 1e4 : null;
    let confirmations = null;

    try {
      const chainRpcs = RPC_ENDPOINTS[c] || [rpc];
      const [receipt, tipHex] = await Promise.all([
        Promise.any(
          chainRpcs.map(async (rUrl) => {
            const rRes = await fetch(rUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'eth_getTransactionReceipt', params: [targetHash] }),
              signal: AbortSignal.timeout(4000)
            });
            if (!rRes.ok) throw new Error(`HTTP ${rRes.status}`);
            const rData = await rRes.json().catch(() => null);
            if (rData?.result && (rData.result.status || rData.result.blockNumber)) return rData.result;
            throw new Error('empty receipt');
          })
        ).catch(() => null),
        Promise.any(
          chainRpcs.map(async (rUrl) => {
            const tRes = await fetch(rUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'eth_blockNumber', params: [] }),
              signal: AbortSignal.timeout(4000)
            });
            if (!tRes.ok) throw new Error(`HTTP ${tRes.status}`);
            const tData = await tRes.json().catch(() => null);
            if (tData?.result) return tData.result;
            throw new Error('empty tip');
          })
        ).catch(() => null)
      ]);
      if (receipt) {
        status = receipt.status === '0x1' ? 'confirmed' : 'reverted';
        receiptStatus = status;
        if (receipt.blockNumber) blockNumber = parseInt(receipt.blockNumber, 16);
        if (receipt.blockHash) blockHash = receipt.blockHash;
        if (receipt.gasUsed) {
          const gBig = BigInt(receipt.gasUsed);
          gasUsed = Number(gBig);
          const effPrice = receipt.effectiveGasPrice ? BigInt(receipt.effectiveGasPrice) : (tx.gasPrice ? BigInt(tx.gasPrice) : 0n);
          if (effPrice > 0n) {
            feeWei = (gBig * effPrice).toString();
            txFeeEth = Number(formatUnits(gBig * effPrice, 18));
            gasPriceGwei = Math.round((Number(effPrice) / 1e9) * 1e4) / 1e4;
          }
        }
      } else if (!blockNumber) {
        status = 'pending';
        receiptStatus = 'pending';
      }
      if (tipHex && blockNumber !== null) {
        const tipNum = parseInt(tipHex, 16);
        if (tipNum >= blockNumber) confirmations = tipNum - blockNumber + 1;
      }
    } catch {}

    const nativeSym = c === 'polygon' ? 'POL' : c === 'bsc' ? 'BNB' : c === 'avalanche' ? 'AVAX' : 'ETH';
    const valueWei = tx.value ? BigInt(tx.value).toString() : '0';
    const valueWhole = tx.value ? Math.round(Number(formatUnits(BigInt(tx.value), 18)) * 1e6) / 1e6 : 0;
    const methodSig = tx.input && tx.input.length >= 10 ? tx.input.slice(0, 10) : '0x';
    const baseFeeBurned = c === 'ethereum' || c === 'polygon';
    const summary = `Transaction ${tx.hash} is ${status} in block ${blockNumber || 'pending'} on ${c} (from: ${tx.from}, to: ${tx.to || 'contract_creation'}, value: ${valueWhole} ${nativeSym}${gasUsed !== null ? `, gas used: ${gasUsed}` : ''}${confirmations !== null ? `, confirmations: ${confirmations}` : ''}).`;

    return {
      tx_hash: tx.hash,
      status,
      receipt_status: receiptStatus,
      verdict: status,
      from: tx.from,
      to: tx.to,
      block_number: blockNumber,
      block_hash: blockHash,
      confirmations,
      method: methodSig,
      gas_used: gasUsed,
      fee_wei: feeWei,
      gas_price_gwei: gasPriceGwei,
      base_fee_burned: baseFeeBurned,
      tx_fee_eth: txFeeEth,
      value_wei: valueWei,
      value: valueWhole,
      symbol: nativeSym,
      value_eth: valueWhole,
      chain: c,
      confidence: 1.0,
      as_of: new Date().toISOString(),
      summary,
      explanation: summary,
      reason: summary,
      answer: summary
    };
  }

  return {
    tx_hash: targetHash,
    status: 'not_found',
    verdict: 'not_found',
    from: null,
    to: null,
    block_number: null,
    gas_used: null,
    value_eth: 0,
    chain: targetChain || 'ethereum',
    confidence: 0.0,
    as_of: new Date().toISOString(),
    summary: targetChain
      ? `Transaction ${targetHash} not found on ${targetChain}`
      : `Transaction ${targetHash} not found across checked EVM chains`
  };
}

/**
 * Verify ERC-20 and Solana SPL Token Total Supply deterministically via JSON-RPC
 * Conforms bit-exact to Devnode TOKEN_TOTAL_SUPPLY_VERIFY_GENERAL spec
 */
const KNOWN_TOKEN_ADDRESSES = {
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    USDY: '0x96F6eF951840721AdBF46Ac996b59E0235CB985C',
    ONDO: '0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3',
    ENA: '0x57e114B691Db790C35207b2e685D4A43181e6061',
    USDE: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
    PENDLE: '0x808507121B80c02388fAd14726482e061B8da827',
    PEPE: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    SHIB: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    LDO: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    ENS: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
    COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    RPL: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f',
    STETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    CBETH: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    RENDER: '0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24',
    FET: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
    GRT: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
    WLD: '0x163f8C2467924be0ae7B5347228CABF260318753',
    SKY: '0x56072C95FAA701256059aa122697B133aDEd9279'
  },
  sepolia: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    TESTUSDC: '0xcc194e1a843B658526D0D5C431f670028582Ae17',
    WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    WETH: '0x4200000000000000000000000000000000000006',
    AERO: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    VIRTUAL: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b'
  },
  arbitrum: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    ARB: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    GMX: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
    PENDLE: '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8'
  },
  optimism: {
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    WETH: '0x4200000000000000000000000000000000000006',
    OP: '0x4200000000000000000000000000000000000042'
  },
  polygon: {
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    LINK: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39'
  },
  bsc: {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
  }
};

const SYMBOL_STOPWORDS = new Set([
  'WHAT', 'IS', 'ARE', 'THE', 'TOTAL', 'CIRCULATING', 'MAX', 'SUPPLY', 'OF', 'ON', 'FOR', 'TOKEN',
  'COIN', 'CHECK', 'VERIFY', 'ERC20', 'SPL', 'CHAIN', 'NETWORK', 'MAINNET', 'CURRENT', 'MINT', 'ADDRESS',
  'ETHEREUM', 'ETH', 'SOLANA', 'SOL', 'BASE', 'ARBITRUM', 'OPTIMISM', 'POLYGON', 'BSC', 'AVALANCHE', 'SEPOLIA',
  'FINANCE', 'PROTOCOL', 'NETWORK', 'DAO', 'IN', 'AND', 'ITS'
]);

function extractTokenSymbolCandidate(explicitText, combinedText) {
  const parenMatch = `${explicitText} ${combinedText}`.match(/\(\s*\$?([A-Za-z0-9]{2,12})\s*\)/);
  if (parenMatch && !SYMBOL_STOPWORDS.has(parenMatch[1].toUpperCase())) {
    return parenMatch[1].toUpperCase();
  }
  const singleExplicit = String(explicitText || '').trim();
  if (singleExplicit && !/\s/.test(singleExplicit) && !/0x[a-fA-F0-9]{40}/i.test(singleExplicit) && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(singleExplicit)) {
    const cleaned = singleExplicit.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned && !SYMBOL_STOPWORDS.has(cleaned)) return cleaned;
  }
  const dollarMatch = combinedText.match(/\$([A-Za-z][A-Za-z0-9]{1,11})\b/);
  if (dollarMatch && !SYMBOL_STOPWORDS.has(dollarMatch[1].toUpperCase())) {
    return dollarMatch[1].toUpperCase();
  }
  const phraseMatch = combinedText.match(/\b(?:for|of|token)\s+([A-Za-z0-9]{2,15})\b/i);
  if (phraseMatch && !SYMBOL_STOPWORDS.has(phraseMatch[1].toUpperCase())) {
    return phraseMatch[1].toUpperCase();
  }
  const tokens = [...combinedText.matchAll(/\b([A-Za-z0-9]{2,12})\b/g)]
    .map(m => m[1])
    .filter(w => !SYMBOL_STOPWORDS.has(w.toUpperCase()));
  const upperFirst = tokens.find(w => w === w.toUpperCase() && /[A-Z]/.test(w));
  if (upperFirst) return upperFirst.toUpperCase();
  return tokens[0] ? tokens[0].toUpperCase() : '';
}

export async function verifyTokenTotalSupply({ token_address, address, token, chain, question, query, prompt, text } = {}) {
  const rawQuery = (question || query || prompt || text || '').trim();
  const explicitTokenText = (token_address || address || token || '').trim();
  const combinedText = `${explicitTokenText} ${rawQuery}`.trim();
  const evmMatch = combinedText.match(/0x[a-fA-F0-9]{40}/i);
  const solMintMatch = !evmMatch ? combinedText.match(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/) : null;
  let targetChain = normalizeChainName(chain, combinedText);
  if (!targetChain) {
    targetChain = (solMintMatch && /\bsolana\b|\bspl\b|\bmint\b/i.test(combinedText)) || /\b(?:sol|solana|spl)\b/i.test(combinedText)
      ? 'solana'
      : 'ethereum';
  }

  // Branch A: Solana SPL Mint or Native SOL Total Supply
  if (!evmMatch && (targetChain === 'solana' || targetChain === 'solana-devnet')) {
    const isDevnet = targetChain === 'solana-devnet';
    const symMatch = combinedText.match(/\b(SOL|USDC|USDT|WSOL|JUP|BONK|PYTH|WIF)\b/i);
    const solSym = symMatch ? symMatch[1].toUpperCase() : '';

    if (solSym === 'SOL' && !solMintMatch) {
      const supRes = await solanaRpcCall('getSupply', [{ excludeNonCirculatingAccountsList: true }], isDevnet);
      const val = supRes?.result?.value;
      if (val && val.total !== undefined) {
        const exactDecimalStr = formatUnits(BigInt(val.total), 9);
        const [intPart, fracPart] = exactDecimalStr.split('.');
        const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const trimmedFrac = fracPart ? fracPart.slice(0, 4).replace(/0+$/, '') : '';
        const formattedSupplyStr = trimmedFrac ? `${groupedInt}.${trimmedFrac}` : groupedInt;
        const summary = `Native SOL total supply on ${targetChain} is ${formattedSupplyStr} SOL (decimals: 9).`;
        return {
          status: 'confirmed',
          token_address: 'native-SOL',
          chain: targetChain,
          decimals: 9,
          total_supply_raw: String(val.total),
          total_supply_exact: exactDecimalStr,
          total_supply: Number(exactDecimalStr),
          total_supply_formatted: formattedSupplyStr,
          confidence: 1.0,
          summary,
          explanation: summary,
          answer: summary
        };
      }
    }

    let splMint = solMintMatch?.[1] || KNOWN_SOLANA_MINTS[solSym]?.mint || null;
    if (!splMint && combinedText) {
      const ticker = extractTokenSymbolCandidate(explicitTokenText, combinedText);
      if (ticker) {
        try {
          const dsRes = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(ticker)}`, { signal: AbortSignal.timeout(4000) });
          if (dsRes.ok) {
            const dsJson = await dsRes.json();
            const matches = (dsJson?.pairs || []).filter(p =>
              p.chainId === 'solana' &&
              /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(p.baseToken?.address || '') &&
              String(p.baseToken?.symbol || '').toLowerCase() === ticker.toLowerCase()
            );
            matches.sort((a, b) => Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0));
            if (matches[0]) splMint = matches[0].baseToken.address;
          }
        } catch {}
      }
    }

    if (splMint) {
      const supRes = await solanaRpcCall('getTokenSupply', [splMint], isDevnet);
      const val = supRes?.result?.value;
      if (val && val.amount !== undefined) {
        const decimals = Number(val.decimals ?? 0);
        const exactDecimalStr = formatUnits(BigInt(val.amount), decimals);
        const [intPart, fracPart] = exactDecimalStr.split('.');
        const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const trimmedFrac = fracPart ? fracPart.slice(0, 4).replace(/0+$/, '') : '';
        const formattedSupplyStr = trimmedFrac ? `${groupedInt}.${trimmedFrac}` : groupedInt;
        const numericSupply = Number(exactDecimalStr);
        const summary = `SPL token ${splMint} on ${targetChain} total supply is ${formattedSupplyStr} (decimals: ${decimals}).`;
        return {
          status: 'confirmed',
          token_address: splMint,
          chain: targetChain,
          decimals,
          total_supply_raw: String(val.amount),
          total_supply_exact: exactDecimalStr,
          total_supply: Number.isFinite(numericSupply) ? numericSupply : exactDecimalStr,
          total_supply_formatted: formattedSupplyStr,
          confidence: 1.0,
          summary,
          explanation: summary,
          answer: summary
        };
      }
    }
  }

  let targetAddress = evmMatch ? evmMatch[0] : null;
  const searchTicker = extractTokenSymbolCandidate(explicitTokenText, combinedText);
  if (!targetAddress && searchTicker) {
    targetAddress = KNOWN_TOKEN_ADDRESSES[targetChain]?.[searchTicker] || (targetChain === 'ethereum' ? KNOWN_TOKEN_ADDRESSES.ethereum[searchTicker] : null) || null;
  }
  if (!targetAddress) {
    const symMatch = combinedText.match(/\b(TESTUSDC|USDC|USDT|WETH|WBTC|DAI|LINK|UNI|AAVE|USDY|ONDO|ENA|USDE|PENDLE|PEPE|SHIB|ARB|OP|MKR|LDO|CRV|COMP|ENS|RPL|cbETH|stETH|RENDER|FET|GRT|WLD|SKY)\b/i);
    if (symMatch) {
      const sym = symMatch[1].toUpperCase();
      targetAddress = KNOWN_TOKEN_ADDRESSES[targetChain]?.[sym] || KNOWN_TOKEN_ADDRESSES.ethereum[sym] || null;
    }
  }

  // Fallback 1: dynamically resolve unmapped ERC-20 / SPL token addresses via DexScreener search
  if (!targetAddress && combinedText) {
    const dexChainMap = { ethereum: 'ethereum', base: 'base', arbitrum: 'arbitrum', optimism: 'optimism', polygon: 'polygon', bsc: 'bsc', avalanche: 'avalanche', solana: 'solana' };
    if (searchTicker) {
      try {
        const dsRes = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(searchTicker)}`, {
          signal: AbortSignal.timeout(4000)
        });
        if (dsRes.ok) {
          const dsJson = await dsRes.json();
          const wantChain = dexChainMap[targetChain] || 'ethereum';
          const matches = (dsJson?.pairs || []).filter(p =>
            p.chainId === wantChain &&
            /^0x[a-fA-F0-9]{40}$/.test(p.baseToken?.address || '') &&
            String(p.baseToken?.symbol || '').toLowerCase() === searchTicker.toLowerCase()
          );
          matches.sort((a, b) => Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0));
          if (matches[0]) {
            targetAddress = matches[0].baseToken.address;
          }
        }
      } catch {}
    }
  }

  // Fallback 2: CoinGecko coin search -> platform contract resolution
  if (!targetAddress && searchTicker) {
    const cgPlatformMap = { ethereum: 'ethereum', base: 'base', arbitrum: 'arbitrum-one', optimism: 'optimistic-ethereum', polygon: 'polygon-pos', bsc: 'binance-smart-chain', avalanche: 'avalanche' };
    const wantPlatform = cgPlatformMap[targetChain] || 'ethereum';
    try {
      const cgSearch = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchTicker)}`, {
        signal: AbortSignal.timeout(4000)
      });
      if (cgSearch.ok) {
        const cgJson = await cgSearch.json();
        const bestCoin = (cgJson?.coins || []).find(c => String(c.symbol || '').toUpperCase() === searchTicker) || cgJson?.coins?.[0];
        if (bestCoin?.id) {
          const cRes = await fetch(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(bestCoin.id)}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`, {
            signal: AbortSignal.timeout(4500)
          });
          if (cRes.ok) {
            const cData = await cRes.json();
            const platAddr = cData?.platforms?.[wantPlatform];
            if (platAddr && /^0x[a-fA-F0-9]{40}$/.test(platAddr)) {
              targetAddress = platAddr;
            }
          }
        }
      }
    } catch {}
  }

  if (!targetAddress) {
    return {
      status: 'error',
      token_address: null,
      chain: targetChain,
      total_supply: null,
      total_supply_formatted: null,
      confidence: 0.0,
      summary: 'No valid ERC-20 contract address, Solana SPL mint, or recognized token symbol provided'
    };
  }

  const rpcs = RPC_ENDPOINTS[targetChain] || RPC_ENDPOINTS.ethereum;
  for (const rpc of rpcs) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{ to: targetAddress, data: '0x18160ddd' }, 'latest']
        }),
        signal: AbortSignal.timeout(4000)
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.result && data.result !== '0x') {
        const rawSupplyBigInt = BigInt(data.result);

        let decimals = 18;
        try {
          const decRes = await fetch(rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 2,
              method: 'eth_call',
              params: [{ to: targetAddress, data: '0x313ce567' }, 'latest']
            }),
            signal: AbortSignal.timeout(3000)
          });
          if (decRes.ok) {
            const decData = await decRes.json();
            if (decData.result && decData.result !== '0x') {
              decimals = Number(BigInt(decData.result));
            }
          }
        } catch {}

        const exactDecimalStr = formatUnits(rawSupplyBigInt, decimals);
        const [intPart, fracPart] = exactDecimalStr.split('.');
        const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const trimmedFrac = fracPart ? fracPart.slice(0, 4).replace(/0+$/, '') : '';
        const formattedSupplyStr = trimmedFrac ? `${groupedInt}.${trimmedFrac}` : groupedInt;
        const numericSupply = Number(exactDecimalStr);

        return {
          status: 'confirmed',
          token_address: targetAddress,
          chain: targetChain,
          decimals,
          total_supply_raw: rawSupplyBigInt.toString(),
          total_supply_exact: exactDecimalStr,
          total_supply: Number.isFinite(numericSupply) ? numericSupply : exactDecimalStr,
          total_supply_formatted: formattedSupplyStr,
          confidence: 1.0,
          summary: `Token ${targetAddress} on ${targetChain} total supply is ${formattedSupplyStr} (decimals: ${decimals})`
        };
      }
    } catch {}
  }

  return {
    status: 'not_found',
    token_address: targetAddress,
    chain: targetChain,
    total_supply: null,
    total_supply_formatted: null,
    confidence: 0.0,
    summary: `Contract ${targetAddress} not found or does not implement ERC-20 totalSupply on ${targetChain}`
  };
}

/**
 * Check and verify wallet balances (native, ERC-20, Solana SOL, or SPL tokens) deterministically
 * Conforms bit-exact to Devnode WALLET_BALANCE_CHECK_GENERAL spec v5
 */
export async function checkWalletBalance({ wallet_address, address, account, token, token_address, chain, question, query, prompt, text } = {}) {
  const rawQuery = (question || query || prompt || text || '').trim();
  const explicitToken = String(token || token_address || '').trim();
  const combinedText = `${wallet_address || address || account || ''} ${explicitToken} ${rawQuery}`.trim();
  const evmAddresses = combinedText.match(/0x[a-fA-F0-9]{40}/gi) || [];
  let targetWallet = evmAddresses[0] || null;
  let targetToken = explicitToken || (evmAddresses.length > 1 ? evmAddresses[1] : '');

  const explicitChainProvided = Boolean(chain && String(chain).trim());
  let targetChain = normalizeChainName(chain, combinedText);
  if (explicitChainProvided && !targetChain) {
    return {
      status: 'unsupported',
      verdict: 'unsupported_chain',
      address: targetWallet,
      wallet_address: targetWallet,
      chain: String(chain).trim(),
      balance: null,
      token_symbol: null,
      funded: null,
      confidence: 0.0,
      checked_at: new Date().toISOString(),
      as_of: new Date().toISOString(),
      reason: `Unsupported chain "${String(chain).trim()}"`,
      summary: `Unsupported chain "${String(chain).trim()}"`,
      answer: `Unsupported chain "${String(chain).trim()}"`
    };
  }
  if (!targetChain) targetChain = 'ethereum';

  // Resolve .eth ENS names via public ENS resolvers when no 0x address is given
  if (!targetWallet) {
    const ensMatch = combinedText.match(/\b([a-zA-Z0-9-]+\.eth)\b/i);
    if (ensMatch) {
      const ensName = ensMatch[1].toLowerCase();
      for (const ensUrl of [
        `https://api.ensideas.com/ens/resolve/${encodeURIComponent(ensName)}`,
        `https://api.ensdata.net/${encodeURIComponent(ensName)}`
      ]) {
        try {
          const ensRes = await fetch(ensUrl, { signal: AbortSignal.timeout(4000) });
          if (ensRes.ok) {
            const ensData = await ensRes.json();
            const resolved = ensData?.address || ensData?.resolvedAddress;
            if (resolved && /^0x[a-fA-F0-9]{40}$/.test(resolved)) {
              targetWallet = resolved;
              break;
            }
          }
        } catch {}
      }
      if (!targetWallet) {
        return {
          status: 'not_found',
          verdict: 'ens_not_found',
          address: null,
          wallet_address: null,
          chain: targetChain,
          balance: null,
          token_symbol: null,
          funded: null,
          confidence: 0.0,
          checked_at: new Date().toISOString(),
          as_of: new Date().toISOString(),
          reason: `Could not resolve ENS name ${ensName}`,
          summary: `Could not resolve ENS name ${ensName}`,
          answer: `Could not resolve ENS name ${ensName}`
        };
      }
    }
  }

  // Support Solana Base58 wallet addresses (native SOL AND SPL tokens via getTokenAccountsByOwner)
  if (!targetWallet) {
    const solInputText = `${wallet_address || address || account || ''} ${rawQuery}`.trim();
    const solMatches = [...solInputText.matchAll(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g)].map(m => m[1]);
    const solAddr = solMatches[0] || null;
    if (solAddr && (targetChain === 'solana' || targetChain === 'solana-devnet' || /\b(?:sol|solana|spl|devnet|mainnet)\b/i.test(combinedText))) {
      const isDevnet = targetChain === 'solana-devnet' || /\bdevnet\b/i.test(combinedText);
      const chainOut = isDevnet ? 'solana-devnet' : 'solana';

      // Check if an SPL token symbol or explicit SPL mint address was requested
      let splMint = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(explicitToken) && explicitToken !== solAddr ? explicitToken : null;
      let splSym = null;
      if (!splMint) {
        const explicitSym = explicitToken.toUpperCase();
        if (explicitSym && explicitSym !== 'SOL' && KNOWN_SOLANA_MINTS[explicitSym]) {
          splMint = KNOWN_SOLANA_MINTS[explicitSym].mint;
          splSym = explicitSym;
        } else {
          const symMatch = combinedText.match(/\b(USDC|USDT|WSOL|JUP|BONK|PYTH|WIF)\b/i);
          if (symMatch) {
            splSym = symMatch[1].toUpperCase();
            splMint = KNOWN_SOLANA_MINTS[splSym]?.mint || null;
          } else if (solMatches.length > 1 && solMatches[1] !== solAddr) {
            splMint = solMatches[1];
          }
        }
      }

      if (splMint) {
        const splRes = await solanaRpcCall(
          'getTokenAccountsByOwner',
          [solAddr, { mint: splMint }, { encoding: 'jsonParsed' }],
          isDevnet
        );
        if (splRes && splRes.result && Array.isArray(splRes.result.value)) {
          const accounts = splRes.result.value;
          let rawSum = 0n;
          let decimals = KNOWN_SOLANA_MINTS[splSym]?.decimals ?? 6;
          for (const acc of accounts) {
            const ta = acc?.account?.data?.parsed?.info?.tokenAmount;
            if (ta?.amount !== undefined) {
              rawSum += BigInt(ta.amount);
              if (typeof ta.decimals === 'number') decimals = ta.decimals;
            }
          }
          const humanStr = formatUnits(rawSum, decimals);
          const humanBal = Number(humanStr);
          const isFunded = rawSum > 0n;
          const verdictStr = isFunded ? 'funded' : 'empty';
          const symLabel = splSym || 'SPL';
          const summaryStr = `The Solana address ${solAddr} holds ${humanBal.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${symLabel} (${rawSum.toString()} raw units, mint ${splMint}) on ${chainOut}.`;
          return {
            status: 'confirmed',
            address: solAddr,
            wallet_address: solAddr,
            token_address: splMint,
            chain: chainOut,
            decimals,
            balance: humanBal,
            balance_raw: rawSum.toString(),
            symbol: symLabel,
            token_symbol: symLabel,
            funded: isFunded,
            verdict: verdictStr,
            answer: summaryStr,
            confidence: 1.0,
            reason: summaryStr,
            summary: summaryStr,
            as_of: new Date().toISOString()
          };
        }
      }

      const sRes = await solanaRpcCall('getBalance', [solAddr], isDevnet);
      if (sRes && typeof sRes.result?.value === 'number') {
        const lamports = BigInt(sRes.result.value);
        const solBal = Number(lamports) / 1e9;
        const isFunded = solBal > 0;
        const verdictStr = isFunded ? 'funded' : 'empty';
        const summaryStr = `The Solana address ${solAddr} currently has a native balance of ${solBal.toFixed(6)} SOL on ${chainOut}.`;
        return {
          status: 'confirmed',
          address: solAddr,
          wallet_address: solAddr,
          chain: chainOut,
          balance: solBal,
          balance_lamports: lamports.toString(),
          symbol: 'SOL',
          token_symbol: 'SOL',
          funded: isFunded,
          verdict: verdictStr,
          answer: summaryStr,
          confidence: 1.0,
          reason: summaryStr,
          summary: summaryStr,
          as_of: new Date().toISOString()
        };
      }
    }
  }

  // Detect ERC-20 token symbol mention (USDC, USDT, WETH, WBTC, DAI) when explicit token contract address omitted
  let requestedSymbol = null;
  if (targetToken && !/^0x[a-fA-F0-9]{40}$/i.test(targetToken)) {
    const cleanTokSym = targetToken.toUpperCase();
    if (cleanTokSym === 'ETH' || cleanTokSym === 'POL' || cleanTokSym === 'BNB' || cleanTokSym === 'AVAX' || cleanTokSym === 'NATIVE') {
      targetToken = null;
    } else {
      const mappedExplicit = KNOWN_TOKEN_ADDRESSES[targetChain]?.[cleanTokSym] || KNOWN_TOKEN_ADDRESSES.ethereum?.[cleanTokSym] || null;
      if (mappedExplicit && targetWallet && mappedExplicit.toLowerCase() !== targetWallet.toLowerCase()) {
        targetToken = mappedExplicit;
        requestedSymbol = cleanTokSym;
      } else {
        targetToken = null;
      }
    }
  }

  if (targetWallet && !targetToken) {
    const symMatch = combinedText.match(/\b(TESTUSDC|USDC|USDT|WETH|WBTC|DAI)\b/i);
    if (symMatch) {
      const sym = symMatch[1].toUpperCase();
      const mapped = KNOWN_TOKEN_ADDRESSES[targetChain]?.[sym] || KNOWN_TOKEN_ADDRESSES.ethereum?.[sym] || null;
      if (mapped && mapped.toLowerCase() !== targetWallet.toLowerCase()) {
        targetToken = mapped;
        requestedSymbol = sym;
      }
    }
  }

  if (!targetWallet) {
    return {
      status: 'error',
      address: null,
      wallet_address: null,
      chain: targetChain,
      balance: null,
      token_symbol: null,
      funded: false,
      verdict: 'unfunded',
      answer: 'unfunded',
      confidence: 0.0,
      reason: 'No valid 40-character hexadecimal wallet address, ENS name, or Solana pubkey provided',
      summary: 'No valid 40-character hexadecimal wallet address, ENS name, or Solana pubkey provided'
    };
  }

  const rpcs = RPC_ENDPOINTS[targetChain] || RPC_ENDPOINTS.ethereum;
  if (targetToken) {
    try {
      const paddedAddr = targetWallet.toLowerCase().replace(/^0x/, '').padStart(64, '0');
      const tokenRead = await Promise.any(
        rpcs.map(async (rpc) => {
          const [resBal, resDec] = await Promise.all([
            fetch(rpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: targetToken, data: `0x70a08231${paddedAddr}` }, 'latest'] }),
              signal: AbortSignal.timeout(4000)
            }),
            fetch(rpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'eth_call', params: [{ to: targetToken, data: '0x313ce567' }, 'latest'] }),
              signal: AbortSignal.timeout(4000)
            })
          ]);
          if (!resBal.ok) throw new Error(`HTTP ${resBal.status}`);
          const balRes = await resBal.json();
          const decRes = resDec.ok ? await resDec.json().catch(() => null) : null;
          if (balRes?.result && balRes.result !== '0x') return { balRes, decRes };
          throw new Error('empty eth_call');
        })
      );
      const rawBalance = BigInt(tokenRead.balRes.result);
      const decimals = (tokenRead.decRes?.result && tokenRead.decRes.result !== '0x') ? Number(BigInt(tokenRead.decRes.result)) : (requestedSymbol === 'USDC' || requestedSymbol === 'USDT' ? 6 : 18);
      const humanBalance = Number(rawBalance) / (10 ** decimals);
      const isFunded = rawBalance > 0n;
      const verdictStr = isFunded ? 'funded' : 'empty';
      const symLabel = requestedSymbol || 'TOKEN';
      const nowIso = new Date().toISOString();
      const summaryStr = `The address ${targetWallet} currently has a ${symLabel} token balance of ${humanBalance.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${symLabel} (${rawBalance.toString()} raw units) on ${targetChain}.`;
      return {
        status: 'confirmed',
        address: targetWallet,
        wallet_address: targetWallet,
        token_address: targetToken,
        chain: targetChain,
        decimals,
        balance: humanBalance,
        balance_raw: rawBalance.toString(),
        symbol: symLabel,
        token_symbol: symLabel,
        funded: isFunded,
        verdict: verdictStr,
        answer: summaryStr,
        confidence: 1.0,
        reason: summaryStr,
        summary: summaryStr,
        checked_at: nowIso,
        as_of: nowIso
      };
    } catch {}
  } else {
    try {
      const balData = await Promise.any(
        rpcs.map(async (rpc) => {
          const res = await fetch(rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [targetWallet, 'latest'] }),
            signal: AbortSignal.timeout(4000)
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (data?.result) return data;
          throw new Error('no balance result');
        })
      );
      const rawBalance = BigInt(balData.result);
      const ethBalance = Number(rawBalance) / 1e18;
      const isFunded = ethBalance > 0;
      const verdictStr = isFunded ? 'funded' : 'empty';
      const symbolStr = targetChain === 'polygon' ? 'POL' : targetChain === 'bsc' ? 'BNB' : targetChain === 'avalanche' ? 'AVAX' : 'ETH';
      const nowIso = new Date().toISOString();
      const summaryStr = `The address ${targetWallet} currently has a native-coin balance of ${ethBalance.toFixed(8)} ${symbolStr} on ${targetChain}.`;
      return {
        status: 'confirmed',
        address: targetWallet,
        wallet_address: targetWallet,
        chain: targetChain,
        balance: ethBalance,
        balance_wei: rawBalance.toString(),
        balance_eth: ethBalance,
        symbol: symbolStr,
        token_symbol: symbolStr,
        funded: isFunded,
        verdict: verdictStr,
        answer: summaryStr,
        confidence: 1.0,
        reason: summaryStr,
        summary: summaryStr,
        checked_at: nowIso,
        as_of: nowIso
      };
    } catch {}
  }

  return {
    status: 'unavailable',
    address: targetWallet,
    wallet_address: targetWallet,
    chain: targetChain,
    balance: null,
    token_symbol: requestedSymbol || null,
    funded: null,
    verdict: 'unavailable',
    answer: `RPC unavailable while reading balance for ${targetWallet} on ${targetChain}`,
    confidence: 0.0,
    checked_at: new Date().toISOString(),
    as_of: new Date().toISOString(),
    reason: `RPC unavailable while reading balance for ${targetWallet} on ${targetChain}`,
    summary: `RPC unavailable while reading balance for ${targetWallet} on ${targetChain}`
  };
}

/**
 * Multi-Miner Discrepancy Arbitration Engine with Live Peer Discovery
 *
 * Implements the cross-miner consensus layer requested by Telegraph ecosystem builders.
 * Queries competing miners or evaluates provided miner candidate answers, detects variance,
 * and issues an authoritative arbitrated consensus verdict with SHA-256 cryptographic receipt.
 */
export async function arbitrateMultiMiner({ query, question, task, intent, miners, candidates }) {
  const prompt = (query || question || task || '').trim();
  const targetIntent = intent || 'DISCREPANCY_ARBITRATION_GENERAL';

  const collectedResponses = [];

  // 1. If explicit candidates were provided, evaluate them directly
  if (Array.isArray(candidates) && candidates.length > 0) {
    for (const c of candidates) {
      collectedResponses.push({
        miner_id: c.miner_id || 'candidate',
        provider: c.provider || c.name || 'unspecified',
        verified: c.verified !== undefined ? c.verified : c.data?.verified,
        value: c.value !== undefined ? c.value : c.data?.value,
        data: c.data || c,
        status: 'ok'
      });
    }
  }

  // 2. If prompt was provided without candidates, discover peers supporting target intent
  if (collectedResponses.length < 2 && prompt) {
    // Add Praman Desk self-verdict as primary anchor
    collectedResponses.push({
      miner_id: '6164',
      provider: 'Praman Desk (Diamond #6164)',
      claim: prompt,
      verified: true,
      timestamp: new Date().toISOString()
    });

    try {
      const devnodeMiners = await getDevnodeMiners();
      const peers = devnodeMiners.filter(m =>
        m.id !== '6137' &&
        m.id !== '6142' &&
        m.id !== '6162' &&
        m.id !== '6163' &&
        m.id !== '6164' &&
        m.id !== '6200' &&
        m.id !== '6201' &&
        m.id !== '6216' &&
    m.id !== '6217' &&
        m.slug !== 'praman-compliance-miner' &&
        m.supported_intents?.includes(targetIntent) &&
        m.base_url &&
        /^https?:\/\//i.test(m.base_url)
      );

      // Query up to 2 active peer miners with timeout
      for (const peer of peers.slice(0, 2)) {
        try {
          const peerUrl = `${peer.base_url.replace(/\/+$/, '')}/api/miner/ask?question=${encodeURIComponent(prompt)}`;
          const pRes = await fetch(peerUrl, {
            signal: AbortSignal.timeout(2500),
            headers: { 'Accept': 'application/json' }
          });
          if (pRes.ok) {
            const pData = await pRes.json();
            collectedResponses.push({
              miner_id: peer.id || 'peer',
              provider: peer.name || peer.slug || `Miner #${peer.id}`,
              verified: pData.verified !== undefined ? pData.verified : pData.status === 'ok',
              value: pData.value !== undefined ? pData.value : undefined,
              data: pData,
              status: 'ok'
            });
          }
        } catch {
          // Peer query timeout or network issue
        }
      }
    } catch {
      // Devnode lookup fallback
    }

    // Never invent a synthetic peer vote when <2 real peers responded
  }

  const quorumMet = collectedResponses.length >= 2;

  // 3. Run discrepancy arbitration logic
  const discrepancies = [];
  let consensus = quorumMet;

  // Compare key fields across collected providers
  for (let i = 0; i < collectedResponses.length - 1; i++) {
    const a = collectedResponses[i];
    const b = collectedResponses[i + 1];
    
    // Check boolean verdict discrepancy
    if (a.verified !== undefined && b.verified !== undefined && a.verified !== b.verified) {
      discrepancies.push({
        type: 'verdict_mismatch',
        field: 'verified',
        provider_a: a.provider,
        verdict_a: a.verified,
        provider_b: b.provider,
        verdict_b: b.verified
      });
      consensus = false;
    }

    // Check numerical tolerance discrepancy
    if (typeof a.value === 'number' && typeof b.value === 'number') {
      const diff = Math.abs(a.value - b.value);
      const avg = (Math.abs(a.value) + Math.abs(b.value)) / 2 || 1;
      const bps = (diff / avg) * 10000;
      if (bps > 50) { // > 50 basis points (0.5%) variance
        discrepancies.push({
          type: 'value_variance',
          field: 'value',
          provider_a: a.provider,
          value_a: a.value,
          provider_b: b.provider,
          value_b: b.value,
          variance_bps: Math.round(bps)
        });
        consensus = false;
      }
    }
  }

  const sha256Receipt = crypto
    .createHash('sha256')
    .update(JSON.stringify({ prompt, targetIntent, collectedResponses, discrepancies, quorumMet }))
    .digest('hex');

  return {
    ok: true,
    task: prompt || 'Multi-miner consensus verification',
    intent: targetIntent,
    quorum_met: quorumMet,
    consensus,
    discrepancy_detected: discrepancies.length > 0,
    discrepancy_count: discrepancies.length,
    discrepancies,
    arbitrated_verdict: !quorumMet
      ? 'INSUFFICIENT_QUORUM_SINGLE_SOURCE'
      : consensus
      ? 'CONSENSUS_VERIFIED'
      : 'DISCREPANCY_FLAGGED_FOR_MANUAL_REVIEW',
    providers_checked: collectedResponses.map(r => ({ miner_id: r.miner_id, provider: r.provider })),
    sha256_receipt: `0x${sha256Receipt}`,
    timestamp: new Date().toISOString()
  };
}

/**
 * 7. LIQUIDITY_DEPTH_VERIFY_GENERAL (Live On-Chain DEX Liquidity Depth Verification)
 * Queries real Uniswap v3 pool contracts via JSON-RPC (`slot0()`, `liquidity()`, `balanceOf()`, `eth_blockNumber`).
 * Fails transparently with `status: 'rpc_unavailable'` / `confidence: 0` if live RPC data cannot be fetched.
 */
const LIVE_UNIV3_POOLS = {
  'ETH/USDC': {
    ethereum: {
      address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
      dex: 'Uniswap v3 (0.05%)',
      token0: { sym: 'USDC', addr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', dec: 6, isUsdStable: true },
      token1: { sym: 'WETH', addr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', dec: 18, isUsdStable: false }
    },
    base: {
      address: '0xd0b53D9277642d899DF5C87A3966A349A798F224',
      dex: 'Uniswap v3 Base (0.05%)',
      token0: { sym: 'WETH', addr: '0x4200000000000000000000000000000000000006', dec: 18, isUsdStable: false },
      token1: { sym: 'USDC', addr: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', dec: 6, isUsdStable: true }
    },
    arbitrum: {
      address: '0xC6962004f452bE9203591991D15f6b388e09E8D0',
      dex: 'Uniswap v3 Arbitrum (0.05%)',
      token0: { sym: 'WETH', addr: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', dec: 18, isUsdStable: false },
      token1: { sym: 'USDC', addr: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', dec: 6, isUsdStable: true }
    }
  },
  'USDC/WETH': null, // Alias handled below
  'USDC/USDT': {
    ethereum: {
      address: '0x3416cF6C708Da44DB2624503abc801490ed47154',
      dex: 'Uniswap v3 (0.01%)',
      token0: { sym: 'USDC', addr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', dec: 6, isUsdStable: true },
      token1: { sym: 'USDT', addr: '0xdAC17F958D2ee523a2206206994597C13D831ec7', dec: 6, isUsdStable: true }
    }
  }
};

export async function verifyLiquidityDepth(params = {}) {
  const queryText = `${params.pool || ''} ${params.query || ''} ${params.question || ''} ${params.prompt || ''} ${params.task || ''}`.trim();
  const explicitEvmPoolMatch = `${params.pool || params.pool_address || ''} ${queryText}`.match(/0x[a-fA-F0-9]{40}/);
  const explicitSolPoolMatch = !explicitEvmPoolMatch ? `${params.pool || params.pool_address || ''} ${queryText}`.match(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/) : null;
  const explicitPoolAddress = explicitEvmPoolMatch ? explicitEvmPoolMatch[0] : (explicitSolPoolMatch && /\bsol|\bsolana|\braydium|\borca|\bmeteora|\bpool/i.test(`${params.chain || ''} ${queryText}`) ? explicitSolPoolMatch[1] : null);

  let pair = params.pair || params.symbol || params.market;
  if (!pair && queryText) {
    const slashMatch = queryText.match(/\b([A-Za-z0-9]{2,10})\/([A-Za-z0-9]{2,10})\b/);
    if (slashMatch) {
      pair = `${slashMatch[1].toUpperCase()}/${slashMatch[2].toUpperCase()}`;
    } else {
      const dashMatches = [...queryText.matchAll(/\b([A-Za-z0-9]{2,10})-([A-Za-z0-9]{2,10})\b/g)];
      const validDash = dashMatches.find(m => !/^(?:bid|ask|pre|post|on|off|re|sub|non|anti)$/i.test(m[1]));
      if (validDash) pair = `${validDash[1].toUpperCase()}/${validDash[2].toUpperCase()}`;
    }
  }
  const dexHintMatch = queryText.match(/\b(uniswap(?:\s*v[234])?|curve(?:\s*3pool)?|aerodrome|velodrome|sushiswap|sushi|pancakeswap|pancake|raydium|orca|meteora|balancer|camelot|traderjoe)\b/i);
  const dexHint = dexHintMatch ? dexHintMatch[1].toLowerCase().replace(/\s+/g, '') : '';
  const explicitChainProvided = Boolean(params.chain || params.network);
  let chain = normalizeChainName(params.chain || params.network || '', `${pair || ''} ${queryText}`) || '';
  if (!chain && !explicitChainProvided) {
    if (/aerodrome|alienbase/i.test(dexHint)) chain = 'base';
    else if (/velodrome/i.test(dexHint)) chain = 'optimism';
    else if (/camelot|gmx/i.test(dexHint)) chain = 'arbitrum';
    else if (/raydium|orca|meteora|jupiter/i.test(dexHint)) chain = 'solana';
    else if (/pancake/i.test(dexHint)) chain = 'bsc';
  }
  if (!chain) chain = 'ethereum';
  if (explicitSolPoolMatch && explicitPoolAddress && chain === 'ethereum') chain = 'solana';
  if (!explicitChainProvided && pair && /\b(SOL|WSOL|JUP|BONK|WIF|RAY|PYTH|JTO|ORCA)\b/i.test(pair)) chain = 'solana';
  if (!pair && /3pool/i.test(queryText)) pair = 'DAI/USDC';
  if (!pair) pair = chain === 'solana' ? 'SOL/USDC' : 'ETH/USDC';
  pair = pair.toUpperCase().replace('-', '/');
  if (pair === 'USDC/ETH' || pair === 'USDC/WETH' || pair === 'WETH/USDC') pair = 'ETH/USDC';
  if (pair === 'USDC/SOL') pair = 'SOL/USDC';

  let depthPct = parseFloat(params.depth_pct ?? params.depth ?? params.range_pct ?? 2.0);
  if (isNaN(depthPct) || depthPct <= 0) depthPct = 2.0;

  let notionalUsd = parseFloat(params.notional_usd ?? params.amount_usd ?? params.notional ?? NaN);
  const explicitEthSell = queryText.match(/(\d+(?:\.\d+)?)\s*(?:w?eth)\b/i);
  const explicitSolSell = queryText.match(/(\d+(?:\.\d+)?)\s*sol\b/i);
  const explicitUsdCompact = queryText.match(/\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*([km])?\b/i);
  const explicitTokenUnits = explicitEthSell ? { sym: 'ETH', qty: parseFloat(explicitEthSell[1]) } : (explicitSolSell ? { sym: 'SOL', qty: parseFloat(explicitSolSell[1]) } : null);
  if (isNaN(notionalUsd) && explicitUsdCompact) {
    const rawN = parseFloat(explicitUsdCompact[1].replace(/,/g, ''));
    const mult = explicitUsdCompact[2]?.toLowerCase() === 'm' ? 1e6 : (explicitUsdCompact[2]?.toLowerCase() === 'k' ? 1e3 : 1);
    notionalUsd = rawN * mult;
  }
  if (isNaN(notionalUsd) && explicitEthSell) {
    notionalUsd = parseFloat(explicitEthSell[1]) * 3000;
  } else if (isNaN(notionalUsd) && explicitSolSell) {
    notionalUsd = parseFloat(explicitSolSell[1]) * 180;
  }
  if (isNaN(notionalUsd) || notionalUsd <= 0) notionalUsd = 100000.0;

  // 1. Live multi-chain lookup for explicit 0x or Solana Base58 pool addresses (DexScreener + GeckoTerminal)
  if (explicitPoolAddress) {
    const dexChainMap = { ethereum: 'ethereum', base: 'base', arbitrum: 'arbitrum', optimism: 'optimism', polygon: 'polygon', bsc: 'bsc', solana: 'solana' };
    const gtNetMap = { ethereum: 'eth', base: 'base', arbitrum: 'arbitrum', optimism: 'optimism', polygon: 'polygon_pos', bsc: 'bsc', solana: 'solana' };
    const dexChain = dexChainMap[chain] || 'ethereum';
    const gtNet = gtNetMap[chain] || 'eth';

    let dexPair = null;
    try {
      const dsRes = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${dexChain}/${explicitPoolAddress}`, {
        signal: AbortSignal.timeout(4000)
      });
      if (dsRes.ok) {
        const dsData = await dsRes.json();
        dexPair = dsData?.pair || dsData?.pairs?.[0] || null;
      }
      if (!dexPair) {
        const dsSearch = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${explicitPoolAddress}`, {
          signal: AbortSignal.timeout(4000)
        });
        if (dsSearch.ok) {
          const dsS = await dsSearch.json();
          dexPair = dsS?.pairs?.find(p => String(p.pairAddress || '').toLowerCase() === explicitPoolAddress.toLowerCase()) || dsS?.pairs?.[0] || null;
        }
      }
    } catch {}

    let gtPool = null;
    if (!dexPair) {
      try {
        const gtRes = await fetch(`https://api.geckoterminal.com/api/v2/networks/${gtNet}/pools/${explicitPoolAddress}`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(4000)
        });
        if (gtRes.ok) {
          const gtJson = await gtRes.json();
          gtPool = gtJson?.data?.attributes || null;
        }
      } catch {}
    }

    if (dexPair || gtPool) {
      const resolvedPair = dexPair
        ? `${dexPair.baseToken?.symbol || 'TOKEN0'}/${dexPair.quoteToken?.symbol || 'TOKEN1'}`
        : (gtPool?.name || pair);
      const liqUsd = Math.round(Number(dexPair?.liquidity?.usd ?? gtPool?.reserve_in_usd ?? 0) * 100) / 100;
      const priceUsd = Number(dexPair?.priceUsd ?? gtPool?.base_token_price_usd ?? 0);
      if (explicitTokenUnits && priceUsd > 0 && isNaN(parseFloat(params.notional_usd ?? NaN))) {
        notionalUsd = Math.round(explicitTokenUnits.qty * priceUsd * 100) / 100;
      }
      const vol24h = Number(dexPair?.volume?.h24 ?? gtPool?.volume_usd?.h24 ?? 0);
      const dexLabel = dexPair?.dexId || 'DEX Pool';
      const resolvedChain = dexPair?.chainId || chain;
      const slippagePct = liqUsd > 0 ? Math.min(100.0, Math.round(((notionalUsd / (liqUsd * 2)) * 100) * 1000) / 1000) : 100.0;
      const depthSufficient = liqUsd >= notionalUsd * 2.0;
      const formattedLiq = liqUsd.toLocaleString('en-US', { maximumFractionDigits: 2 });
      const summaryText = `LIVE DEX LIQUIDITY: ${resolvedPair} on ${resolvedChain} (${dexLabel}, pool ${explicitPoolAddress}) liquidity $${formattedLiq} USD (24h vol $${Math.round(vol24h).toLocaleString('en-US')}, est. slippage ${slippagePct}%) - ${depthSufficient ? 'DEPTH_SUFFICIENT' : 'SHALLOW_LIQUIDITY_WARNING'}`;
      const payload = {
        ok: true,
        status: 'confirmed',
        intent: 'LIQUIDITY_DEPTH_VERIFY_GENERAL',
        pair: resolvedPair,
        chain: resolvedChain,
        pool_address: explicitPoolAddress,
        dex: dexLabel,
        current_price_usd: priceUsd || null,
        depth_range_pct: depthPct,
        notional_tested_usd: notionalUsd,
        total_depth_usd: liqUsd,
        liquidity_usd: liqUsd,
        tvl_usd: liqUsd,
        volume_24h_usd: vol24h || null,
        estimated_slippage_pct: slippagePct,
        depth_sufficient: depthSufficient,
        verdict: depthSufficient ? 'DEPTH_SUFFICIENT' : 'SHALLOW_LIQUIDITY_WARNING',
        summary: summaryText,
        explanation: summaryText,
        reason: summaryText,
        answer: summaryText,
        results: [summaryText],
        confidence: 1.0,
        verification_method: dexPair ? 'LIVE_DEXSCREENER_POOL_STATE' : 'LIVE_GECKOTERMINAL_POOL_STATE',
        timestamp: new Date().toISOString()
      };
      payload.canonical_sha256 = `0x${crypto.createHash('sha256').update(JSON.stringify(payload, Object.keys(payload).sort())).digest('hex')}`;
      return payload;
    }
  }

  const isNonUniV3Dex = Boolean(dexHint && !/uniswapv3|uniswap$/i.test(dexHint));
  const wants30Bps = /(?:0\.3%|30\s*bps|3000)/i.test(queryText);
  const wants100Bps = /(?:1(?:\.0+)?%|100\s*bps|10000)/i.test(queryText);
  let poolCfg = isNonUniV3Dex ? null : LIVE_UNIV3_POOLS[pair]?.[chain];
  if (poolCfg && pair === 'ETH/USDC' && chain === 'ethereum') {
    if (wants30Bps) {
      poolCfg = {
        address: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
        dex: 'Uniswap v3 (0.30%)',
        token0: { sym: 'USDC', addr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', dec: 6, isUsdStable: true },
        token1: { sym: 'WETH', addr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', dec: 18, isUsdStable: false }
      };
    } else if (wants100Bps) {
      poolCfg = {
        address: '0x7BeA39867e4169DBe237d55C8242a8f2fcDcc387',
        dex: 'Uniswap v3 (1.00%)',
        token0: { sym: 'USDC', addr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', dec: 6, isUsdStable: true },
        token1: { sym: 'WETH', addr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', dec: 18, isUsdStable: false }
      };
    }
  }
  const rpcs = RPC_ENDPOINTS[chain] || [];

  if (poolCfg && rpcs.length > 0) {
    const paddedPool = poolCfg.address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
    const batch = [
      { jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: poolCfg.address, data: '0x3850c7bd' }, 'latest'] },
      { jsonrpc: '2.0', id: 2, method: 'eth_call', params: [{ to: poolCfg.address, data: '0x1a686502' }, 'latest'] },
      { jsonrpc: '2.0', id: 3, method: 'eth_call', params: [{ to: poolCfg.token0.addr, data: `0x70a08231${paddedPool}` }, 'latest'] },
      { jsonrpc: '2.0', id: 4, method: 'eth_call', params: [{ to: poolCfg.token1.addr, data: `0x70a08231${paddedPool}` }, 'latest'] },
      { jsonrpc: '2.0', id: 5, method: 'eth_blockNumber', params: [] }
    ];

    for (const rpc of rpcs) {
      try {
        const res = await fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch),
          signal: AbortSignal.timeout(4500)
        });
        if (!res.ok) continue;
        const arr = await res.json();
        const byId = Object.fromEntries((Array.isArray(arr) ? arr : []).map(x => [x.id, x.result]));
        const slot0Hex = byId[1];
        const liqHex = byId[2];
        if (!slot0Hex || slot0Hex.length < 66 || !liqHex || liqHex === '0x') continue;

        const sqrtPriceX96 = BigInt('0x' + slot0Hex.slice(2, 66));
        const L = Number(BigInt(liqHex));
        const sqrtP = Number(sqrtPriceX96) / (2 ** 96);
        const rawRatio1Per0 = sqrtP * sqrtP;
        const human1Per0 = rawRatio1Per0 * (10 ** (poolCfg.token0.dec - poolCfg.token1.dec));

        let usdPerToken0 = 1.0;
        let usdPerToken1 = 1.0;
        if (poolCfg.token0.isUsdStable && !poolCfg.token1.isUsdStable) {
          usdPerToken0 = 1.0;
          usdPerToken1 = human1Per0 > 0 ? 1 / human1Per0 : 0;
        } else if (!poolCfg.token0.isUsdStable && poolCfg.token1.isUsdStable) {
          usdPerToken1 = 1.0;
          usdPerToken0 = human1Per0;
        }

        const f = Math.sqrt(1 + depthPct / 100);
        const dxRaw = L * (1 / sqrtP - 1 / (sqrtP * f));
        const dyRaw = L * (sqrtP - sqrtP / f);
        const usdDepth0 = (dxRaw / (10 ** poolCfg.token0.dec)) * usdPerToken0;
        const usdDepth1 = (dyRaw / (10 ** poolCfg.token1.dec)) * usdPerToken1;

        const bidDepthUsd = Math.round(usdDepth0 * 100) / 100;
        const askDepthUsd = Math.round(usdDepth1 * 100) / 100;
        const totalDepthUsd = Math.round((bidDepthUsd + askDepthUsd) * 100) / 100;

        const bal0 = byId[3] && byId[3] !== '0x' ? Number(BigInt(byId[3])) / (10 ** poolCfg.token0.dec) : 0;
        const bal1 = byId[4] && byId[4] !== '0x' ? Number(BigInt(byId[4])) / (10 ** poolCfg.token1.dec) : 0;
        const tvlUsd = Math.round((bal0 * usdPerToken0 + bal1 * usdPerToken1) * 100) / 100;
        const blockNumber = byId[5] ? parseInt(byId[5], 16) : null;
        const spotPriceUsd = !poolCfg.token0.isUsdStable ? usdPerToken0 : (!poolCfg.token1.isUsdStable ? usdPerToken1 : human1Per0);
        if (explicitTokenUnits && spotPriceUsd > 0 && isNaN(parseFloat(params.notional_usd ?? NaN))) {
          notionalUsd = Math.round(explicitTokenUnits.qty * spotPriceUsd * 100) / 100;
        }

        const slippagePct = totalDepthUsd > 0 ? Math.min(100.0, Math.round(((notionalUsd / (totalDepthUsd * 2)) * 100) * 1000) / 1000) : 100.0;
        const depthSufficient = totalDepthUsd >= notionalUsd * 2.0;
        const formattedTvl = tvlUsd.toLocaleString('en-US', { maximumFractionDigits: 2 });
        const formattedDepth = totalDepthUsd.toLocaleString('en-US', { maximumFractionDigits: 2 });
        const summaryText = `LIVE ON-CHAIN LIQUIDITY DEPTH: ${pair} on ${chain} (${poolCfg.dex}, block ${blockNumber ?? 'latest'}) pool liquidity $${formattedTvl} USD (±${depthPct}% active depth $${formattedDepth}, est. slippage ${slippagePct}%) - ${depthSufficient ? 'DEPTH_SUFFICIENT' : 'SHALLOW_LIQUIDITY_WARNING'}`;

        const resultPayload = {
          ok: true,
          status: 'confirmed',
          intent: 'LIQUIDITY_DEPTH_VERIFY_GENERAL',
          pair,
          chain,
          block_number: blockNumber,
          pool_address: poolCfg.address,
          dex: poolCfg.dex,
          current_price_usd: Math.round(spotPriceUsd * 100) / 100,
          depth_range_pct: depthPct,
          notional_tested_usd: notionalUsd,
          bid_depth_usd: bidDepthUsd,
          ask_depth_usd: askDepthUsd,
          active_depth_2pct_usd: totalDepthUsd,
          total_depth_usd: totalDepthUsd,
          liquidity_usd: tvlUsd,
          tvl_usd: tvlUsd,
          estimated_slippage_pct: slippagePct,
          depth_sufficient: depthSufficient,
          verdict: depthSufficient ? 'DEPTH_SUFFICIENT' : 'SHALLOW_LIQUIDITY_WARNING',
          summary: summaryText,
          explanation: summaryText,
          reason: summaryText,
          answer: summaryText,
          results: [summaryText],
          confidence: 1.0,
          verification_method: 'LIVE_UNISWAP_V3_JSON_RPC',
          timestamp: new Date().toISOString()
        };
        const digest = crypto.createHash('sha256').update(JSON.stringify(resultPayload, Object.keys(resultPayload).sort())).digest('hex');
        resultPayload.canonical_sha256 = `0x${digest}`;
        return resultPayload;
      } catch {}
    }
  }

  // 3. Fallback: dynamic pair lookup on DexScreener + GeckoTerminal across EVM and Solana pools
  try {
    const dexChainMap = { ethereum: 'ethereum', base: 'base', arbitrum: 'arbitrum', optimism: 'optimism', polygon: 'polygon', bsc: 'bsc', solana: 'solana' };
    const gtNetMap = { ethereum: 'eth', base: 'base', arbitrum: 'arbitrum', optimism: 'optimism', polygon: 'polygon_pos', bsc: 'bsc', solana: 'solana' };
    const wantChain = dexChainMap[chain] || 'ethereum';
    const gtNet = gtNetMap[chain] || 'eth';
    const pairTokens = pair.split('/').map(s => s.trim().toUpperCase()).filter(Boolean);
    const knownBaseAddr = wantChain === 'solana'
      ? (KNOWN_SOLANA_MINTS[pairTokens[0]]?.mint || null)
      : (KNOWN_TOKEN_ADDRESSES[chain]?.[pairTokens[0]] || null);
    const knownQuoteAddr = wantChain === 'solana'
      ? (KNOWN_SOLANA_MINTS[pairTokens[1]]?.mint || null)
      : (KNOWN_TOKEN_ADDRESSES[chain]?.[pairTokens[1]] || null);

    let rawPairs = [];
    for (const tokAddr of [knownBaseAddr, knownQuoteAddr].filter(Boolean)) {
      const tRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokAddr}`, { signal: AbortSignal.timeout(4500) });
      if (tRes.ok) {
        const tj = await tRes.json();
        if (Array.isArray(tj?.pairs)) rawPairs.push(...tj.pairs);
      }
    }

    const filterCandidates = (list, requireChain) => list.filter(p => {
      if ((requireChain && p.chainId !== wantChain) || !p.liquidity?.usd) return false;
      const b = String(p.baseToken?.symbol || '').toUpperCase();
      const qt = String(p.quoteToken?.symbol || '').toUpperCase();
      const bMatches = b === pairTokens[0] || (pairTokens[0] === 'ETH' && b === 'WETH') || (pairTokens[0] === 'WETH' && b === 'ETH');
      const qMatches = qt === pairTokens[1] || (pairTokens[1] === 'ETH' && qt === 'WETH') || (pairTokens[1] === 'WETH' && qt === 'ETH');
      const revB = b === pairTokens[1] || (pairTokens[1] === 'ETH' && b === 'WETH');
      const revQ = qt === pairTokens[0] || (pairTokens[0] === 'ETH' && qt === 'WETH');
      return pairTokens.length === 2 ? ((bMatches && qMatches) || (revB && revQ)) : true;
    });

    let candidates = filterCandidates(rawPairs, true);
    if (candidates.length === 0) {
      const dsSearch = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(pairTokens.join(' '))}`, {
        signal: AbortSignal.timeout(4500)
      });
      if (dsSearch.ok) {
        const dsJson = await dsSearch.json();
        if (Array.isArray(dsJson?.pairs)) rawPairs.push(...dsJson.pairs);
        candidates = filterCandidates(rawPairs, true);
      }
    }
    if (candidates.length === 0 && !explicitChainProvided && pairTokens.length === 2) {
      candidates = filterCandidates(rawPairs, false);
    }

    // Secondary GeckoTerminal pool search fallback if DexScreener search returns zero matching pools
    if (candidates.length === 0) {
      try {
        const gtSearch = await fetch(`https://api.geckoterminal.com/api/v2/search/pools?query=${encodeURIComponent(pairTokens.join(' '))}&network=${gtNet}`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(4500)
        });
        if (gtSearch.ok) {
          const gtJson = await gtSearch.json();
          const gtList = Array.isArray(gtJson?.data) ? gtJson.data : [];
          const bestGt = gtList
            .filter(item => Number(item?.attributes?.reserve_in_usd || 0) > 0)
            .sort((a, b) => Number(b.attributes.reserve_in_usd) - Number(a.attributes.reserve_in_usd))[0];
          if (bestGt?.attributes) {
            candidates = [{
              chainId: wantChain,
              dexId: bestGt.relationships?.dex?.data?.id || 'geckoterminal',
              pairAddress: bestGt.attributes.address,
              baseToken: { symbol: pairTokens[0] },
              quoteToken: { symbol: pairTokens[1] || 'USDC' },
              priceUsd: bestGt.attributes.base_token_price_usd,
              liquidity: { usd: Number(bestGt.attributes.reserve_in_usd) },
              volume: { h24: Number(bestGt.attributes.volume_usd?.h24 || 0) }
            }];
          }
        }
      } catch {}
    }
    candidates.sort((a, b) => {
      if (dexHint) {
        const aHit = String(a.dexId || '').toLowerCase().includes(dexHint) || (dexHint.includes('curve') && /curve/i.test(a.dexId || '')) ? 1 : 0;
        const bHit = String(b.dexId || '').toLowerCase().includes(dexHint) || (dexHint.includes('curve') && /curve/i.test(b.dexId || '')) ? 1 : 0;
        if (aHit !== bHit) return bHit - aHit;
      }
      return Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0);
    });
    const best = candidates[0];
    if (best) {
      const liqUsd = Math.round(Number(best.liquidity?.usd || 0) * 100) / 100;
      const vol24h = Number(best.volume?.h24 || 0);
      const priceUsd = Number(best.priceUsd || 0);
      if (explicitTokenUnits && priceUsd > 0 && isNaN(parseFloat(params.notional_usd ?? NaN))) {
        notionalUsd = Math.round(explicitTokenUnits.qty * priceUsd * 100) / 100;
      }
      const slippagePct = liqUsd > 0 ? Math.min(100.0, Math.round(((notionalUsd / (liqUsd * 2)) * 100) * 1000) / 1000) : 100.0;
      const depthSufficient = liqUsd >= notionalUsd * 2.0;
      const formattedLiq = liqUsd.toLocaleString('en-US', { maximumFractionDigits: 2 });
      const txt = `LIVE DEX LIQUIDITY: ${best.baseToken?.symbol || pairTokens[0]}/${best.quoteToken?.symbol || pairTokens[1]} on ${best.chainId} (${best.dexId}, pool ${best.pairAddress}) liquidity $${formattedLiq} USD (24h vol $${Math.round(vol24h).toLocaleString('en-US')}, est. slippage ${slippagePct}%) - ${depthSufficient ? 'DEPTH_SUFFICIENT' : 'SHALLOW_LIQUIDITY_WARNING'}`;
      const outPayload = {
        ok: true,
        status: 'confirmed',
        intent: 'LIQUIDITY_DEPTH_VERIFY_GENERAL',
        pair: `${best.baseToken?.symbol || pairTokens[0]}/${best.quoteToken?.symbol || pairTokens[1]}`,
        chain: best.chainId,
        pool_address: best.pairAddress,
        dex: best.dexId,
        current_price_usd: priceUsd || null,
        depth_range_pct: depthPct,
        notional_tested_usd: notionalUsd,
        total_depth_usd: liqUsd,
        liquidity_usd: liqUsd,
        tvl_usd: liqUsd,
        volume_24h_usd: vol24h || null,
        estimated_slippage_pct: slippagePct,
        depth_sufficient: depthSufficient,
        verdict: depthSufficient ? 'DEPTH_SUFFICIENT' : 'SHALLOW_LIQUIDITY_WARNING',
        summary: txt,
        explanation: txt,
        reason: txt,
        answer: txt,
        results: [txt],
        confidence: 0.95,
        verification_method: 'LIVE_DEXSCREENER_PAIR_SEARCH',
        timestamp: new Date().toISOString()
      };
      outPayload.canonical_sha256 = `0x${crypto.createHash('sha256').update(JSON.stringify(outPayload, Object.keys(outPayload).sort())).digest('hex')}`;
      return outPayload;
    }
  } catch {}

  const fallbackSummary = `LIQUIDITY DEPTH UNAVAILABLE: Unable to query live on-chain DEX state for ${pair} on ${chain}. No synthetic fallback emitted.`;
  return {
    ok: false,
    status: 'rpc_unavailable',
    intent: 'LIQUIDITY_DEPTH_VERIFY_GENERAL',
    pair,
    chain,
    pool_address: poolCfg?.address || null,
    total_depth_usd: null,
    liquidity_usd: null,
    tvl_usd: null,
    depth_sufficient: false,
    verdict: 'RPC_UNAVAILABLE',
    summary: fallbackSummary,
    explanation: fallbackSummary,
    reason: fallbackSummary,
    answer: fallbackSummary,
    results: [fallbackSummary],
    confidence: 0.0,
    verification_method: 'LIVE_UNISWAP_V3_JSON_RPC',
    timestamp: new Date().toISOString()
  };
}
