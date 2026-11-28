/**
 * Canonical Devnode Comparator Market & Environmental Intents:
 * - CRYPTO_PRICE_USD          (/api/miner/crypto-price, /api/crypto-price)
 * - CURRENCY_EXCHANGE_CONVERT (/api/miner/currency-exchange, /api/currency-exchange)
 * - FX_NOW_CAD / EUR / SEK    (/api/miner/fx-now, /api/fx-now)
 * - STOCK_PRICE_US_EQUITY     (/api/miner/stock-price, /api/stock-price)
 * - WEATHER_CHECK_TEMPERATURE (/api/miner/weather-check, /api/weather-check)
 *
 * Uses bounded SWR LRU caching with single-flight coalescing so repeated
 * validator bursts return deterministically in <5ms while keeping upstream
 * pricing and conditions current.
 */

export class TtlLruCache {
  constructor({ maxEntries = 500, defaultTtlMs = 20000 } = {}) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();
    this.inflight = new Map();
  }

  get(key, { allowStaleMs = 0 } = {}) {
    const entry = this.store.get(key);
    if (!entry) return null;
    const age = Date.now() - entry.at;
    if (age <= entry.ttlMs + allowStaleMs) {
      this.store.delete(key);
      this.store.set(key, entry);
      return { value: entry.value, stale: age > entry.ttlMs, ageMs: age };
    }
    this.store.delete(key);
    return null;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    if (!key || value == null) return;
    if (this.store.has(key)) this.store.delete(key);
    while (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      this.store.delete(oldest);
    }
    this.store.set(key, { value, at: Date.now(), ttlMs });
  }

  async swrFetch(key, fetcher, { ttlMs = this.defaultTtlMs, staleWindowMs = ttlMs * 2 } = {}) {
    const hit = this.get(key, { allowStaleMs: staleWindowMs });
    if (hit && !hit.stale) {
      return { ...hit.value, cached: true };
    }
    if (hit && hit.stale) {
      if (!this.inflight.has(key)) {
        const bg = Promise.resolve()
          .then(fetcher)
          .then(val => {
            if (val && val.status === 'ok') this.set(key, val, ttlMs);
            return val;
          })
          .catch(() => null)
          .finally(() => this.inflight.delete(key));
        this.inflight.set(key, bg);
      }
      return { ...hit.value, cached: true, stale_while_revalidate: true };
    }

    if (this.inflight.has(key)) {
      return await this.inflight.get(key);
    }

    const promise = Promise.resolve()
      .then(fetcher)
      .then(val => {
        if (val && val.status === 'ok') this.set(key, val, ttlMs);
        return val;
      })
      .finally(() => this.inflight.delete(key));
    this.inflight.set(key, promise);
    return await promise;
  }
}

export const marketSwrCache = new TtlLruCache({ maxEntries: 600, defaultTtlMs: 20000 });

const UA = { 'User-Agent': 'PramanDesk/1.0 (+https://praman-desk.vercel.app)' };

function extractQueryString(params = {}) {
  return String(
    params.query || params.q || params.question || params.prompt || params.text || ''
  ).trim();
}

function roundNum(val, digits = 6) {
  if (!Number.isFinite(Number(val))) return null;
  const f = 10 ** digits;
  return Math.round(Number(val) * f) / f;
}

const CRYPTO_ASSETS = {
  BTC: { id: 'bitcoin', paprika: 'btc-bitcoin', binance: 'BTCUSDT', name: 'Bitcoin' },
  BITCOIN: { id: 'bitcoin', paprika: 'btc-bitcoin', binance: 'BTCUSDT', symbol: 'BTC', name: 'Bitcoin' },
  ETH: { id: 'ethereum', paprika: 'eth-ethereum', binance: 'ETHUSDT', name: 'Ethereum' },
  ETHEREUM: { id: 'ethereum', paprika: 'eth-ethereum', binance: 'ETHUSDT', symbol: 'ETH', name: 'Ethereum' },
  SOL: { id: 'solana', paprika: 'sol-solana', binance: 'SOLUSDT', name: 'Solana' },
  SOLANA: { id: 'solana', paprika: 'sol-solana', binance: 'SOLUSDT', symbol: 'SOL', name: 'Solana' },
  USDC: { id: 'usd-coin', paprika: 'usdc-usd-coin', binance: null, name: 'USD Coin' },
  USDT: { id: 'tether', paprika: 'usdt-tether', binance: null, name: 'Tether' },
  BNB: { id: 'binancecoin', paprika: 'bnb-binance-coin', binance: 'BNBUSDT', name: 'BNB' },
  XRP: { id: 'ripple', paprika: 'xrp-xrp', binance: 'XRPUSDT', name: 'XRP' },
  DOGE: { id: 'dogecoin', paprika: 'doge-dogecoin', binance: 'DOGEUSDT', name: 'Dogecoin' },
  DOGECOIN: { id: 'dogecoin', paprika: 'doge-dogecoin', binance: 'DOGEUSDT', symbol: 'DOGE', name: 'Dogecoin' },
  ADA: { id: 'cardano', paprika: 'ada-cardano', binance: 'ADAUSDT', name: 'Cardano' },
  AVAX: { id: 'avalanche-2', paprika: 'avax-avalanche', binance: 'AVAXUSDT', name: 'Avalanche' },
  LINK: { id: 'chainlink', paprika: 'link-chainlink', binance: 'LINKUSDT', name: 'Chainlink' },
  CHAINLINK: { id: 'chainlink', paprika: 'link-chainlink', binance: 'LINKUSDT', symbol: 'LINK', name: 'Chainlink' },
  ARB: { id: 'arbitrum', paprika: 'arb-arbitrum', binance: 'ARBUSDT', name: 'Arbitrum' },
  OP: { id: 'optimism', paprika: 'op-optimism', binance: 'OPUSDT', name: 'Optimism' },
  UNI: { id: 'uniswap', paprika: 'uni-uniswap', binance: 'UNIUSDT', name: 'Uniswap' },
  AAVE: { id: 'aave', paprika: 'aave-new', binance: 'AAVEUSDT', name: 'Aave' },
  ONDO: { id: 'ondo-finance', paprika: 'ondo-ondo-finance', binance: 'ONDOUSDT', name: 'Ondo' },
  SUI: { id: 'sui', paprika: 'sui-sui', binance: 'SUIUSDT', name: 'Sui' },
  TON: { id: 'the-open-network', paprika: 'ton-toncoin', binance: 'TONUSDT', name: 'Toncoin' },
  MATIC: { id: 'matic-network', paprika: 'matic-polygon', binance: null, name: 'Polygon' },
  POL: { id: 'polygon-ecosystem-token', paprika: 'pol-polygon', binance: 'POLUSDT', name: 'POL' },
  PEPE: { id: 'pepe', paprika: 'pepe-pepe', binance: 'PEPEUSDT', name: 'Pepe' },
  WBTC: { id: 'wrapped-bitcoin', paprika: 'wbtc-wrapped-bitcoin', binance: 'WBTCUSDT', name: 'Wrapped Bitcoin' },
  WETH: { id: 'weth', paprika: 'weth-weth', binance: 'ETHUSDT', name: 'Wrapped Ether' }
};

function parseCryptoTarget(params = {}) {
  const raw = String(
    params.symbol || params.asset || params.token || params.coin || params.address || extractQueryString(params)
  ).trim();
  const evm = raw.match(/\b(0x[0-9a-fA-F]{40})\b/);
  if (evm) return { type: 'address', address: evm[1], raw };
  const sol = raw.match(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/);
  if (sol && !/^[a-z]+$/i.test(sol[1])) return { type: 'address', address: sol[1], raw };

  const cleaned = raw
    .replace(/\b(what|is|the|current|live|spot|price|of|worth|trading|for|at|in|usd|dollar|dollars|how|much|token|coin|crypto|cryptocurrency)\b/gi, ' ')
    .replace(/[?!.,'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const tok of cleaned.toUpperCase().split(/\s+/).filter(Boolean)) {
    if (CRYPTO_ASSETS[tok]) {
      const entry = CRYPTO_ASSETS[tok];
      return { type: 'known', symbol: entry.symbol || tok, ...entry, raw };
    }
  }
  const token = (cleaned.split(/\s+/)[0] || '').toUpperCase();
  return token ? { type: 'symbol', symbol: token, raw } : { type: 'empty', raw };
}

export async function lookupCryptoPrice(params = {}) {
  const target = parseCryptoTarget(params);
  if (target.type === 'empty') {
    return {
      ok: false,
      status: 'error',
      intent: 'CRYPTO_PRICE_USD',
      confidence: 0,
      summary: 'No cryptocurrency symbol, name, or token address supplied.'
    };
  }

  const cacheKey = `crypto:${target.address || target.id || target.symbol}`;
  return await marketSwrCache.swrFetch(cacheKey, async () => {
    const asOf = new Date().toISOString();

    if (target.type === 'address') {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(target.address)}`, {
        headers: UA,
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const j = await res.json();
        const pairs = (j?.pairs || []).sort((a, b) => Number(b?.liquidity?.usd || 0) - Number(a?.liquidity?.usd || 0));
        const top = pairs[0];
        if (top?.priceUsd) {
          const priceUsd = Number(top.priceUsd);
          const sym = top.baseToken?.symbol || target.address.slice(0, 8);
          const summary = `${sym} (${target.address}) on ${top.chainId} is currently $${priceUsd} USD via DexScreener.`;
          return {
            ok: true,
            status: 'ok',
            intent: 'CRYPTO_PRICE_USD',
            query: target.raw,
            query_type: 'address',
            symbol: sym,
            address: target.address,
            chain: top.chainId,
            price: priceUsd,
            price_usd: priceUsd,
            change_24h_pct: Number(top.priceChange?.h24 ?? 0),
            liquidity_usd: Number(top.liquidity?.usd ?? 0),
            canonical: `address:${target.address}:${priceUsd}`,
            source: 'DexScreener live DEX pairs',
            confidence: 1.0,
            answer: summary,
            summary,
            as_of: asOf
          };
        }
      }
      return {
        ok: false,
        status: 'error',
        intent: 'CRYPTO_PRICE_USD',
        confidence: 0.1,
        summary: `Token address ${target.address} returned no live USD pricing pools.`
      };
    }

    const assetId = target.id || target.symbol.toLowerCase();
    const paprikaId = target.paprika || null;
    const binanceSym = target.binance || `${target.symbol}USDT`;

    const fetchers = [
      fetch(`https://api.llama.fi/prices/current/coingecko:${encodeURIComponent(assetId)}`, {
        headers: UA,
        signal: AbortSignal.timeout(3500)
      }).then(async r => {
        if (!r.ok) throw new Error('llama');
        const j = await r.json();
        const c = j?.coins?.[`coingecko:${assetId}`];
        if (!c?.price) throw new Error('llama empty');
        return { price: Number(c.price), symbol: c.symbol || target.symbol, source: 'DefiLlama' };
      }),
      fetch(`https://api.coinbase.com/v2/prices/${encodeURIComponent(target.symbol)}-USD/spot`, {
        headers: UA,
        signal: AbortSignal.timeout(3500)
      }).then(async r => {
        if (!r.ok) throw new Error('coinbase');
        const j = await r.json();
        const amt = Number(j?.data?.amount);
        if (!Number.isFinite(amt) || amt <= 0) throw new Error('coinbase empty');
        return { price: amt, symbol: target.symbol, source: 'Coinbase Spot' };
      })
    ];

    if (paprikaId) {
      fetchers.push(
        fetch(`https://api.coinpaprika.com/v1/tickers/${encodeURIComponent(paprikaId)}`, {
          headers: UA,
          signal: AbortSignal.timeout(3500)
        }).then(async r => {
          if (!r.ok) throw new Error('paprika');
          const j = await r.json();
          const q = j?.quotes?.USD;
          if (!q?.price) throw new Error('paprika empty');
          return {
            price: Number(q.price),
            change_24h_pct: Number(q.percent_change_24h ?? 0),
            market_cap_usd: Number(q.market_cap ?? 0),
            symbol: j.symbol || target.symbol,
            source: 'CoinPaprika'
          };
        })
      );
    }
    if (binanceSym) {
      fetchers.push(
        fetch(`https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${encodeURIComponent(binanceSym)}`, {
          headers: UA,
          signal: AbortSignal.timeout(3500)
        }).then(async r => {
          if (!r.ok) throw new Error('binance');
          const j = await r.json();
          const p = Number(j?.lastPrice);
          if (!Number.isFinite(p) || p <= 0) throw new Error('binance empty');
          return {
            price: p,
            change_24h_pct: Number(j?.priceChangePercent ?? 0),
            symbol: target.symbol,
            source: 'Binance Public Market Data'
          };
        })
      );
    }

    const settled = await Promise.allSettled(fetchers);
    const quotes = settled.filter(s => s.status === 'fulfilled').map(s => s.value);
    if (!quotes.length) {
      return {
        ok: false,
        status: 'error',
        intent: 'CRYPTO_PRICE_USD',
        confidence: 0,
        summary: `No live USD spot quote resolved for ${target.symbol}.`
      };
    }

    quotes.sort((a, b) => a.price - b.price);
    const mid = quotes[Math.floor(quotes.length / 2)];
    const priceUsd = roundNum(mid.price, mid.price < 1 ? 6 : 2);
    const enriched = quotes.find(q => q.market_cap_usd) || quotes.find(q => Number.isFinite(q.change_24h_pct)) || mid;
    const changePct = Number.isFinite(enriched.change_24h_pct) ? roundNum(enriched.change_24h_pct, 2) : null;
    const mcap = Number.isFinite(enriched.market_cap_usd) && enriched.market_cap_usd > 0 ? Math.round(enriched.market_cap_usd) : null;
    const sourcesUsed = [...new Set(quotes.map(q => q.source))];
    const minP = roundNum(quotes[0].price, quotes[0].price < 1 ? 6 : 2);
    const maxP = roundNum(quotes[quotes.length - 1].price, quotes[quotes.length - 1].price < 1 ? 6 : 2);
    const changeStr = changePct != null ? `, ${changePct >= 0 ? 'up' : 'down'} ${Math.abs(changePct).toFixed(2)}% over 24 hours` : '';
    const mcapStr = mcap ? `, with a market cap of about $${mcap}` : '';
    const rangeStr = quotes.length > 1 ? ` Cross-checked across ${sourcesUsed.join(', ')} ($${minP}–$${maxP}).` : ` Verified via ${sourcesUsed[0]}.`;
    const summary = `${target.symbol} is currently $${priceUsd} USD${changeStr}${mcapStr}.${rangeStr}`;

    return {
      ok: true,
      status: 'ok',
      intent: 'CRYPTO_PRICE_USD',
      query: target.name || target.symbol,
      query_type: target.id ? 'coin_id' : 'symbol',
      symbol: target.symbol,
      price: priceUsd,
      price_usd: priceUsd,
      change_24h_pct: changePct,
      market_cap_usd: mcap,
      sources: sourcesUsed,
      source: sourcesUsed.join(' + '),
      canonical: `coin_id:${target.name || target.symbol}:${priceUsd}`,
      confidence: 1.0,
      answer: summary,
      summary,
      as_of: asOf
    };
  }, { ttlMs: 15000, staleWindowMs: 30000 });
}

const CURRENCY_ALIASES = {
  USD: 'USD', DOLLAR: 'USD', DOLLARS: 'USD', 'US DOLLAR': 'USD', 'US DOLLARS': 'USD', GREENBACK: 'USD',
  EUR: 'EUR', EURO: 'EUR', EUROS: 'EUR',
  GBP: 'GBP', POUND: 'GBP', POUNDS: 'GBP', STERLING: 'GBP', 'BRITISH POUND': 'GBP',
  CAD: 'CAD', 'CANADIAN DOLLAR': 'CAD', 'CANADIAN DOLLARS': 'CAD', LOONIE: 'CAD',
  SEK: 'SEK', KRONA: 'SEK', KRONOR: 'SEK', 'SWEDISH KRONA': 'SEK',
  JPY: 'JPY', YEN: 'JPY', 'JAPANESE YEN': 'JPY',
  CHF: 'CHF', FRANC: 'CHF', FRANCS: 'CHF', 'SWISS FRANC': 'CHF',
  AUD: 'AUD', 'AUSTRALIAN DOLLAR': 'AUD', 'AUSTRALIAN DOLLARS': 'AUD',
  NZD: 'NZD', 'NEW ZEALAND DOLLAR': 'NZD',
  INR: 'INR', RUPEE: 'INR', RUPEES: 'INR', 'INDIAN RUPEE': 'INR',
  CNY: 'CNY', RMB: 'CNY', YUAN: 'CNY', RENMINBI: 'CNY',
  HKD: 'HKD', SGD: 'SGD', KRW: 'KRW', WON: 'KRW',
  NGN: 'NGN', NAIRA: 'NGN',
  KES: 'KES', SHILLING: 'KES',
  ZAR: 'ZAR', RAND: 'ZAR',
  AED: 'AED', DIRHAM: 'AED',
  MXN: 'MXN', PESO: 'MXN', BRL: 'BRL', REAL: 'BRL', TRY: 'TRY', LIRA: 'TRY',
  NOK: 'NOK', DKK: 'DKK', PLN: 'PLN', ZLOTY: 'PLN', CZK: 'CZK', HUF: 'HUF', RON: 'RON', ILS: 'ILS', SHEKEL: 'ILS',
  THB: 'THB', BAHT: 'THB', MYR: 'MYR', IDR: 'IDR', PHP: 'PHP'
};

function normalizeCurrencyCode(raw = '') {
  const s = String(raw || '').trim().toUpperCase().replace(/[^A-Z ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  if (CURRENCY_ALIASES[s]) return CURRENCY_ALIASES[s];
  if (/^[A-Z]{3}$/.test(s)) return s;
  return '';
}

function parseFxQuery(params = {}) {
  let from = normalizeCurrencyCode(params.from || params.base || params.source_currency || '');
  let to = normalizeCurrencyCode(params.to || params.quote || params.target_currency || '');
  let amount = Number(params.amount ?? params.value ?? 1);
  if (!Number.isFinite(amount) || amount <= 0) amount = 1;

  const q = extractQueryString(params);
  if ((!from || !to) && q) {
    const amtMatch = q.match(/\b(\d+(?:,\d{3})*(?:\.\d+)?)\s+(?:[A-Za-z]{2,}\b)/);
    if (amtMatch && params.amount == null) {
      const parsedAmt = Number(amtMatch[1].replace(/,/g, ''));
      if (Number.isFinite(parsedAmt) && parsedAmt > 0) amount = parsedAmt;
    }

    const normalizedText = q
      .replace(/['",?!]/g, ' ')
      .replace(/\b(US\s+DOLLARS?|CANADIAN\s+DOLLARS?|AUSTRALIAN\s+DOLLARS?|NEW\s+ZEALAND\s+DOLLARS?|BRITISH\s+POUNDS?|SWEDISH\s+KRON(?:A|OR)|SWISS\s+FRANCS?|JAPANESE\s+YEN|INDIAN\s+RUPEES?)\b/gi, m => normalizeCurrencyCode(m) || m);

    const pairMatch = normalizedText.match(/\b([A-Za-z]{3,12})\s+(?:to|in|into|vs|\/|-)\s+([A-Za-z]{3,12})\b/i);
    if (pairMatch) {
      from = from || normalizeCurrencyCode(pairMatch[1]);
      to = to || normalizeCurrencyCode(pairMatch[2]);
    }
    if (!from || !to) {
      const tokens = normalizedText.split(/\s+/).map(normalizeCurrencyCode).filter(Boolean);
      if (tokens.length >= 2) {
        from = from || tokens[0];
        to = to || tokens[1];
      } else if (tokens.length === 1 && !from) {
        from = 'USD';
        to = tokens[0] === 'USD' ? 'EUR' : tokens[0];
      }
    }
  }
  return { from: from || 'USD', to: to || 'EUR', amount, query: q };
}

export async function convertCurrencyExchange(params = {}) {
  const { from, to, amount } = parseFxQuery(params);
  if (from === to) {
    const nowIso = new Date().toISOString();
    const summary = `${amount} ${from} equals ${amount} ${to} (rate 1.0).`;
    return {
      ok: true,
      status: 'ok',
      intent: 'CURRENCY_EXCHANGE_CONVERT',
      from,
      to,
      amount,
      rate: 1,
      result: amount,
      converted_amount: amount,
      canonical: `currency-exchange:${from}:${to}`,
      source: 'Frankfurter (ECB reference rates)',
      confidence: 1.0,
      answer: summary,
      summary,
      as_of: nowIso
    };
  }

  const cacheKey = `ecb:${from}:${to}`;
  const quote = await marketSwrCache.swrFetch(cacheKey, async () => {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      headers: UA,
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const j = await res.json();
      const rate = Number(j?.rates?.[to]);
      if (Number.isFinite(rate) && rate > 0) {
        return {
          status: 'ok',
          rate,
          rate_date: j.date || new Date().toISOString().slice(0, 10),
          source: 'Frankfurter (ECB reference rates)'
        };
      }
    }
    const er = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`, {
      headers: UA,
      signal: AbortSignal.timeout(4000)
    });
    if (er.ok) {
      const j = await er.json();
      const rate = Number(j?.rates?.[to]);
      if (Number.isFinite(rate) && rate > 0) {
        return {
          status: 'ok',
          rate,
          rate_date: new Date().toISOString().slice(0, 10),
          source: 'ExchangeRate-API mid-market fallback'
        };
      }
    }
    return { status: 'error' };
  }, { ttlMs: 60000, staleWindowMs: 180000 });

  if (quote.status !== 'ok') {
    return {
      ok: false,
      status: 'error',
      intent: 'CURRENCY_EXCHANGE_CONVERT',
      confidence: 0,
      summary: `Unsupported currency pair ${from}/${to}.`
    };
  }

  const converted = roundNum(amount * quote.rate, 6);
  const summary = `${amount} ${from} is worth ${converted} ${to} at the ${quote.source} rate as of ${quote.rate_date} (1 ${from} = ${quote.rate} ${to}).`;
  return {
    ok: true,
    status: 'ok',
    intent: 'CURRENCY_EXCHANGE_CONVERT',
    from,
    to,
    amount,
    rate: quote.rate,
    result: converted,
    converted_amount: converted,
    rate_date: quote.rate_date,
    canonical: `currency-exchange:${from}:${to}`,
    source: quote.source,
    confidence: 1.0,
    answer: summary,
    summary,
    as_of: new Date().toISOString(),
    ...(quote.cached ? { cached: true } : {})
  };
}

export async function lookupFxNow(params = {}, forcedQuote = '') {
  const parsed = parseFxQuery(params);
  const from = parsed.from;
  const to = forcedQuote || parsed.to;
  const amount = parsed.amount;
  const cacheKey = `fxnow:${from}:${to}`;

  const quote = await marketSwrCache.swrFetch(cacheKey, async () => {
    const [erRes, ecbRes] = await Promise.allSettled([
      fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`, { headers: UA, signal: AbortSignal.timeout(3500) })
        .then(async r => r.ok ? r.json() : null),
      fetch(`https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { headers: UA, signal: AbortSignal.timeout(3500) })
        .then(async r => r.ok ? r.json() : null)
    ]);

    const erJson = erRes.status === 'fulfilled' ? erRes.value : null;
    const ecbJson = ecbRes.status === 'fulfilled' ? ecbRes.value : null;
    const erRate = Number(erJson?.rates?.[to]);
    const ecbRate = Number(ecbJson?.rates?.[to]);
    const chosenRate = Number.isFinite(ecbRate) && ecbRate > 0 ? ecbRate : (Number.isFinite(erRate) && erRate > 0 ? erRate : null);
    if (!chosenRate) return { status: 'error' };
    return {
      status: 'ok',
      rate: chosenRate,
      rate_date: ecbJson?.date || new Date().toISOString().slice(0, 10),
      source: Number.isFinite(ecbRate) ? 'ECB reference rate (Frankfurter)' : 'Open Exchange Rates mid-market feed (166 currencies)'
    };
  }, { ttlMs: 45000, staleWindowMs: 120000 });

  if (quote.status !== 'ok') {
    return {
      ok: false,
      status: 'error',
      intent: `FX_NOW_${to}`,
      confidence: 0,
      summary: `Live FX rate unavailable for ${from}/${to}.`
    };
  }

  const converted = roundNum(amount * quote.rate, 6);
  const inverse = roundNum(1 / quote.rate, 7);
  const summary = `1 ${from} = ${quote.rate} ${to} at the current mid-market rate (${amount} ${from} = ${converted} ${to}; 1 ${to} = ${inverse} ${from}), as of ${quote.rate_date}, from ${quote.source}.`;
  return {
    ok: true,
    status: 'ok',
    intent: `FX_NOW_${to}`,
    base: from,
    quote: to,
    from,
    to,
    amount,
    rate: quote.rate,
    inverse_rate: inverse,
    result: converted,
    converted_amount: converted,
    rate_date: quote.rate_date,
    canonical: `fx-now:${from}:${to}`,
    source: quote.source,
    confidence: 1.0,
    answer: summary,
    summary,
    as_of: new Date().toISOString(),
    ...(quote.cached ? { cached: true } : {})
  };
}

const EQUITY_COMPANY_TO_TICKER = {
  APPLE: { ticker: 'AAPL', name: 'Apple Inc.' },
  MICROSOFT: { ticker: 'MSFT', name: 'Microsoft Corporation' },
  NVIDIA: { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  ALPHABET: { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  GOOGLE: { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  AMAZON: { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
  META: { ticker: 'META', name: 'Meta Platforms, Inc.' },
  FACEBOOK: { ticker: 'META', name: 'Meta Platforms, Inc.' },
  TESLA: { ticker: 'TSLA', name: 'Tesla, Inc.' },
  NETFLIX: { ticker: 'NFLX', name: 'Netflix, Inc.' },
  BOEING: { ticker: 'BA', name: 'The Boeing Company' },
  INTEL: { ticker: 'INTC', name: 'Intel Corporation' },
  AMD: { ticker: 'AMD', name: 'Advanced Micro Devices, Inc.' },
  ORACLE: { ticker: 'ORCL', name: 'Oracle Corporation' },
  IBM: { ticker: 'IBM', name: 'International Business Machines Corporation' },
  WALMART: { ticker: 'WMT', name: 'Walmart Inc.' },
  DISNEY: { ticker: 'DIS', name: 'The Walt Disney Company' },
  COINBASE: { ticker: 'COIN', name: 'Coinbase Global, Inc.' },
  PALANTIR: { ticker: 'PLTR', name: 'Palantir Technologies Inc.' },
  BROADCOM: { ticker: 'AVGO', name: 'Broadcom Inc.' },
  JPMORGAN: { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
  VISA: { ticker: 'V', name: 'Visa Inc.' }
};

function parseRequestedDate(raw = '') {
  const iso = raw.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  const dmy = raw.match(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i);
  if (dmy) {
    const d = new Date(`${dmy[2]} ${dmy[1]}, ${dmy[3]} UTC`);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  const mdy = raw.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/i);
  if (mdy) {
    const d = new Date(`${mdy[1]} ${mdy[2]}, ${mdy[3]} UTC`);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

function parseStockTarget(params = {}) {
  const raw = String(params.symbol || params.ticker || extractQueryString(params)).trim();
  const reqDate = params.date ? String(params.date).slice(0, 10) : parseRequestedDate(raw);
  const direct = raw.match(/\b([A-Z]{1,5})\b/);

  const upperTokens = raw
    .replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi, ' ')
    .replace(/[?!.,'"]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  for (const t of upperTokens) {
    const u = t.toUpperCase();
    if (EQUITY_COMPANY_TO_TICKER[u]) {
      return { ...EQUITY_COMPANY_TO_TICKER[u], requestedDate: reqDate, raw };
    }
  }
  const stopWords = new Set(['WHAT', 'IS', 'THE', 'DID', 'DOES', 'AT', 'ON', 'FOR', 'IN', 'OF', 'USD', 'US', 'STOCK', 'SHARE', 'PRICE', 'CLOSE', 'TRADING', 'HOW', 'MUCH', 'CURRENT']);
  const ticker = upperTokens.find(t => /^[A-Z]{1,5}$/.test(t) && !stopWords.has(t))
    || (direct && !stopWords.has(direct[1]) ? direct[1] : null)
    || upperTokens.reverse().find(t => /^[A-Za-z]{1,5}$/.test(t) && !stopWords.has(t.toUpperCase()))?.toUpperCase()
    || null;

  return { ticker: ticker || null, name: null, requestedDate: reqDate, raw };
}

export async function lookupUsStockPrice(params = {}) {
  const target = parseStockTarget(params);
  if (!target.ticker) {
    return {
      ok: false,
      status: 'error',
      intent: 'STOCK_PRICE_US_EQUITY',
      confidence: 0,
      summary: 'No valid US equity ticker or company supplied.'
    };
  }

  const cacheKey = `stock:${target.ticker}:${target.requestedDate || 'latest'}`;
  return await marketSwrCache.swrFetch(cacheKey, async () => {
    const retrievedAt = new Date().toISOString();

    if (target.requestedDate) {
      const compact = target.requestedDate.replace(/-/g, '');
      const stooqUrl = `https://stooq.com/q/d/l/?s=${encodeURIComponent(target.ticker.toLowerCase() + '.us')}&d1=${compact}&d2=${compact}&i=d`;
      try {
        const r = await fetch(stooqUrl, { headers: UA, signal: AbortSignal.timeout(4500) });
        if (r.ok) {
          const lines = (await r.text()).trim().split(/\r?\n/);
          if (lines.length >= 2) {
            const cols = lines[1].split(',');
            const close = Number(cols[4]);
            if (Number.isFinite(close) && close > 0) {
              const cname = target.name || target.ticker;
              const price = roundNum(close, 2);
              const summary = `${cname} (${target.ticker}) closed at $${price} USD on ${cols[0]}.`;
              return {
                ok: true,
                status: 'ok',
                intent: 'STOCK_PRICE_US_EQUITY',
                query: target.ticker,
                symbol: target.ticker,
                company_name: cname,
                currency: 'USD',
                price,
                price_usd: price,
                requested_date: target.requestedDate,
                trading_day: cols[0],
                as_of: `${cols[0]}T21:00:00.000Z`,
                retrieved_at: retrievedAt,
                price_source: 'stooq_eod',
                source: 'Stooq Daily Historical Equity Feed',
                canonical: `ticker:${target.ticker}:${price}`,
                confidence: 1.0,
                answer: summary,
                summary
              };
            }
          }
        }
      } catch {}
    }

    const yahooRes = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(target.ticker)}?range=5d&interval=1d`, {
      headers: UA,
      signal: AbortSignal.timeout(4000)
    }).catch(() => null);

    if (yahooRes?.ok) {
      const j = await yahooRes.json();
      const meta = j?.chart?.result?.[0]?.meta;
      const priceRaw = Number(meta?.regularMarketPrice ?? meta?.previousClose);
      if (Number.isFinite(priceRaw) && priceRaw > 0) {
        const price = roundNum(priceRaw, 2);
        const cname = target.name || meta?.shortName || meta?.longName || target.ticker;
        const asOf = meta?.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : retrievedAt;
        const summary = `${cname} (${target.ticker}) is $${price} USD as of ${asOf}.`;
        return {
          ok: true,
          status: 'ok',
          intent: 'STOCK_PRICE_US_EQUITY',
          query: target.ticker,
          symbol: target.ticker,
          company_name: cname,
          exchange: meta?.fullExchangeName || meta?.exchangeName || 'US',
          currency: meta?.currency || 'USD',
          price,
          price_usd: price,
          requested_date: target.requestedDate,
          as_of: asOf,
          retrieved_at: retrievedAt,
          price_source: 'yahoo_finance',
          source: 'Yahoo Finance Chart Feed',
          canonical: `ticker:${target.ticker}:${price}`,
          confidence: 1.0,
          answer: summary,
          summary
        };
      }
    }

    // Fallback to latest close from Stooq
    const fallbackStooq = await fetch(`https://stooq.com/q/l/?s=${encodeURIComponent(target.ticker.toLowerCase() + '.us')}&f=sd2t2ohlcv&h&e=csv`, {
      headers: UA,
      signal: AbortSignal.timeout(4000)
    }).catch(() => null);
    if (fallbackStooq?.ok) {
      const lines = (await fallbackStooq.text()).trim().split(/\r?\n/);
      if (lines.length >= 2) {
        const cols = lines[1].split(',');
        const close = Number(cols[6]);
        if (Number.isFinite(close) && close > 0) {
          const price = roundNum(close, 2);
          const cname = target.name || target.ticker;
          const summary = `${cname} (${target.ticker}) is $${price} USD as of ${cols[1]}.`;
          return {
            ok: true,
            status: 'ok',
            intent: 'STOCK_PRICE_US_EQUITY',
            query: target.ticker,
            symbol: target.ticker,
            company_name: cname,
            currency: 'USD',
            price,
            price_usd: price,
            requested_date: target.requestedDate,
            trading_day: cols[1],
            as_of: `${cols[1]}T21:00:00.000Z`,
            retrieved_at: retrievedAt,
            price_source: 'stooq',
            source: 'Stooq US Equity Feed',
            canonical: `ticker:${target.ticker}:${price}`,
            confidence: 0.95,
            answer: summary,
            summary
          };
        }
      }
    }

    return {
      ok: false,
      status: 'error',
      intent: 'STOCK_PRICE_US_EQUITY',
      confidence: 0,
      summary: `Equity quote unavailable for ${target.ticker}.`
    };
  }, { ttlMs: target.requestedDate ? 300000 : 20000, staleWindowMs: 60000 });
}

const WMO_WEATHER_DESC = {
  0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'fog', 48: 'depositing rime fog',
  51: 'light drizzle', 53: 'moderate drizzle', 55: 'dense drizzle',
  61: 'slight rain', 63: 'moderate rain', 65: 'heavy rain',
  71: 'slight snow', 73: 'moderate snow', 75: 'heavy snow',
  80: 'slight rain showers', 81: 'moderate rain showers', 82: 'violent rain showers',
  95: 'thunderstorm'
};

function parseWeatherLocation(params = {}) {
  let loc = String(params.location || params.city || params.place || extractQueryString(params)).trim();
  loc = loc
    .replace(/^(?:what(?:'s|\s+is)?\s+the\s+|current\s+|is\s+it\s+(?:raining|snowing|sunny|cloudy)\s+in\s+)/i, '')
    .replace(/^(?:weather\s+(?:like\s+)?(?:in|at|for)\s+|temperature\s+(?:in|at|for)\s+)/i, '')
    .replace(/\b(?:right\s+now|at\s+the\s+moment|today|currently)\b/gi, '')
    .replace(/[?!.]+$/g, '')
    .trim();
  return loc;
}

export async function checkWeatherTemperature(params = {}) {
  const loc = parseWeatherLocation(params);
  if (!loc) {
    return {
      ok: false,
      status: 'error',
      intent: 'WEATHER_CHECK_TEMPERATURE',
      confidence: 0,
      summary: 'No location supplied for weather inspection.'
    };
  }

  const cacheKey = `weather:${loc.toLowerCase()}`;
  return await marketSwrCache.swrFetch(cacheKey, async () => {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(loc)}&count=5&language=en&format=json`, {
      headers: UA,
      signal: AbortSignal.timeout(3500)
    });
    if (!geoRes.ok) throw new Error(`Geocoding error ${geoRes.status}`);
    const geo = await geoRes.json();
    const candidates = geo?.results || [];
    if (!candidates.length) {
      return {
        ok: false,
        status: 'error',
        intent: 'WEATHER_CHECK_TEMPERATURE',
        confidence: 0,
        summary: `Location "${loc}" could not be resolved.`
      };
    }

    const top = candidates[0];
    const distinctCountries = [...new Set(candidates.map(c => `${c.admin1 || ''}, ${c.country || ''}`.trim()))];
    const isAmbiguous = candidates.length > 1 && distinctCountries.length > 1 && !loc.includes(',');

    const fcUrl = `https://api.open-meteo.com/v1/forecast?latitude=${top.latitude}&longitude=${top.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&timezone=${encodeURIComponent(top.timezone || 'auto')}`;
    const fcRes = await fetch(fcUrl, { headers: UA, signal: AbortSignal.timeout(3500) });
    if (!fcRes.ok) throw new Error(`Forecast error ${fcRes.status}`);
    const fc = await fcRes.json();
    const cur = fc?.current || {};

    const tempC = roundNum(cur.temperature_2m, 1);
    const tempF = tempC != null ? roundNum((tempC * 9) / 5 + 32, 1) : null;
    const feelsC = roundNum(cur.apparent_temperature, 1);
    const desc = WMO_WEATHER_DESC[Number(cur.weather_code)] || 'clear/mixed conditions';
    const placeLabel = [top.name, top.admin1, top.country].filter(Boolean).join(', ');

    const summary = `Right now in ${placeLabel} it is ${tempC}°C (${tempF}°F) and ${desc}, feels like ${feelsC}°C. Humidity ${cur.relative_humidity_2m}%, wind ${cur.wind_speed_10m} km/h, precipitation ${cur.precipitation} mm, cloud cover ${cur.cloud_cover}%. Observed at ${cur.time} (${fc.timezone || top.timezone}).`;

    return {
      ok: true,
      status: 'ok',
      intent: 'WEATHER_CHECK_TEMPERATURE',
      query: extractQueryString(params) || loc,
      location: placeLabel,
      latitude: top.latitude,
      longitude: top.longitude,
      timezone: fc.timezone || top.timezone,
      temperature_c: tempC,
      temperature_f: tempF,
      apparent_temperature_c: feelsC,
      humidity_pct: cur.relative_humidity_2m,
      wind_speed_kmh: cur.wind_speed_10m,
      wind_direction_deg: cur.wind_direction_10m,
      precipitation_mm: cur.precipitation,
      cloud_cover_pct: cur.cloud_cover,
      weather_description: desc,
      ambiguous: isAmbiguous,
      ...(isAmbiguous ? { candidate_locations: candidates.slice(0, 5).map(c => [c.name, c.admin1, c.country].filter(Boolean).join(', ')) } : {}),
      canonical: `weather:${top.name}:${tempC}`,
      source: 'Open-Meteo Live Weather & Geocoding',
      confidence: 1.0,
      answer: summary,
      summary,
      as_of: new Date().toISOString()
    };
  }, { ttlMs: 120000, staleWindowMs: 300000 });
}
