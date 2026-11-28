/**
 * Praman Desk Expansion Intents (10 Weak-Competition Anjoman Intents)
 * Zero-placeholder, deterministic & live-grounded handlers for:
 *  1. URL_SCAN_VERDICT
 *  2. THREAT_INTELLIGENCE_INDICATOR
 *  3. TRANSACTION_RISK_GENERAL
 *  4. SSL_VERIFICATION_CERT
 *  5. CVE_LOOKUP_CVSS
 *  6. SHIPMENT_DELAY_RISK_GENERAL
 *  7. IP_GEOLOCATION_GENERAL
 *  8. TOKEN_HOLDER_COUNT_GENERAL
 *  9. WASH_TRADING_DETECTION_GENERAL
 * 10. TELEGRAPH_KNOWLEDGE_GENERAL
 */

import tls from 'node:tls';
import crypto from 'node:crypto';

let kevCache = null;
let kevLoadedAt = 0;

function cleanStr(v) {
  return String(v || '').trim();
}

function sha256Seal(obj) {
  const keys = Object.keys(obj).sort();
  return `0x${crypto.createHash('sha256').update(JSON.stringify(obj, keys)).digest('hex')}`;
}

function extractHostname(raw) {
  const s = cleanStr(raw);
  if (!s) return '';
  try {
    const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    const u = new URL(withProto);
    return u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  } catch {
    return s.split('/')[0].split(':')[0].toLowerCase();
  }
}

async function getCisaKevSet() {
  if (kevCache && Date.now() - kevLoadedAt < 6 * 3600 * 1000) return kevCache;
  try {
    const res = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', {
      signal: AbortSignal.timeout(4500)
    });
    if (res.ok) {
      const json = await res.json();
      const set = new Set((json?.vulnerabilities || []).map(v => String(v.cveID || '').toUpperCase()));
      kevCache = set;
      kevLoadedAt = Date.now();
      return set;
    }
  } catch {}
  return kevCache || new Set();
}

async function checkUrlHaus(indicatorType, value) {
  try {
    const endpoint = indicatorType === 'url'
      ? 'https://urlhaus-api.abuse.ch/v1/url/'
      : indicatorType === 'host'
      ? 'https://urlhaus-api.abuse.ch/v1/host/'
      : 'https://urlhaus-api.abuse.ch/v1/payload/';
    const paramName = indicatorType === 'url'
      ? 'url'
      : indicatorType === 'host'
      ? 'host'
      : (value.length === 32 ? 'md5_hash' : 'sha256_hash');
    const body = new URLSearchParams({ [paramName]: value }).toString();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// 1. URL_SCAN_VERDICT
// ----------------------------------------------------------------------------
export async function scanUrlVerdict(params = {}, { checkFakeWatchDomain } = {}) {
  const rawUrl = cleanStr(params.url || params.domain || params.query || params.question || params.prompt || params.subject);
  if (!rawUrl) {
    return {
      ok: false,
      intent: 'URL_SCAN_VERDICT',
      safe: false,
      verdict: 'INSUFFICIENT_CONTEXT',
      summary: 'No URL provided to scan.',
      confidence: 0.0,
      as_of: new Date().toISOString()
    };
  }

  const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const host = extractHostname(normalizedUrl);
  const signals = [];
  let malicious = false;
  let suspicious = false;

  if (/^(javascript|data|vbscript):/i.test(rawUrl)) {
    malicious = true;
    signals.push('DANGEROUS_URI_SCHEME');
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    suspicious = true;
    signals.push('RAW_IP_HOST');
  }
  if (/^xn--/i.test(host) || host.includes('.xn--')) {
    suspicious = true;
    signals.push('IDN_PUNYCODE_HOMOGRAPH');
  }
  if (/(?:wallet-?connect|claim-?airdrop|metamask-?restore|seed-?phrase|drainer|unisvvap|secure-?verify)/i.test(normalizedUrl)) {
    malicious = true;
    signals.push('PHISHING_LURE_PATTERN');
  }

  let fw = null;
  const [fwSettled, uhUrlSettled, uhHostSettled] = await Promise.allSettled([
    typeof checkFakeWatchDomain === 'function' ? checkFakeWatchDomain(normalizedUrl) : Promise.resolve(null),
    checkUrlHaus('url', normalizedUrl),
    host ? checkUrlHaus('host', host) : Promise.resolve(null)
  ]);

  if (fwSettled.status === 'fulfilled' && fwSettled.value) {
    fw = fwSettled.value;
    if (fw.verdict === 'PHISHING' || fw.verdict === 'MALICIOUS') {
      malicious = true;
      signals.push(`FAKEWATCH_${fw.verdict}`);
    } else if (fw.verdict === 'SUSPICIOUS') {
      suspicious = true;
      signals.push('FAKEWATCH_SUSPICIOUS');
    } else if (fw.verdict === 'SAFE') {
      signals.push('FAKEWATCH_SAFE');
    }
  }

  const uhUrl = uhUrlSettled.status === 'fulfilled' ? uhUrlSettled.value : null;
  const uhHost = uhHostSettled.status === 'fulfilled' ? uhHostSettled.value : null;

  if (uhUrl?.query_status === 'ok' && uhUrl?.url_status === 'online') {
    malicious = true;
    signals.push(`URLHAUS_MALWARE_URL:${uhUrl.threat || 'malware_download'}`);
  } else if (uhHost?.query_status === 'ok' && Number(uhHost?.url_count || 0) > 0) {
    const activeCount = (uhHost.urls || []).filter(u => u.url_status === 'online').length;
    if (activeCount > 0 || Number(uhHost.url_count) >= 3) {
      malicious = true;
      signals.push(`URLHAUS_HOST_LISTED:${uhHost.url_count}_urls`);
    } else {
      suspicious = true;
      signals.push(`URLHAUS_HISTORICAL_HOST:${uhHost.url_count}_urls`);
    }
  }

  const isSafe = !malicious && !suspicious;
  const verdictLabel = malicious ? 'MALICIOUS' : suspicious ? 'SUSPICIOUS' : 'SAFE';
  const summary = `URL SCAN (${verdictLabel}): ${normalizedUrl} evaluated across FakeWatch/ScamSniffer typosquatting heuristics and Abuse.ch URLhaus threat feeds. Signals: ${signals.length ? signals.join(', ') : 'NONE'}.`;

  const payload = {
    ok: true,
    intent: 'URL_SCAN_VERDICT',
    url: normalizedUrl,
    domain: host,
    safe: isSafe,
    verdict: verdictLabel,
    signals,
    fakewatch: fw ? { verdict: fw.verdict, source: fw.source } : null,
    urlhaus_status: uhUrl?.query_status || uhHost?.query_status || 'no_results',
    confidence: malicious ? 0.96 : (fw?.verdict === 'SAFE' ? 0.94 : 0.85),
    summary,
    explanation: summary,
    answer: summary,
    as_of: new Date().toISOString()
  };
  payload.canonical_sha256 = sha256Seal(payload);
  return payload;
}

// ----------------------------------------------------------------------------
// 2. THREAT_INTELLIGENCE_INDICATOR
// ----------------------------------------------------------------------------
export async function checkThreatIndicator(params = {}, { screenSanctions, checkFakeWatchDomain, maliciousDrainers } = {}) {
  const raw = cleanStr(params.indicator || params.target || params.query || params.prompt || params.subject);
  if (!raw) {
    return {
      ok: false,
      intent: 'THREAT_INTELLIGENCE_INDICATOR',
      malicious: false,
      indicator: '',
      summary: 'No threat indicator provided.',
      confidence: 0.0,
      as_of: new Date().toISOString()
    };
  }

  let indicatorType = 'actor_or_entity';
  if (/^CVE-\d{4}-\d{4,}$/i.test(raw)) indicatorType = 'cve';
  else if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(raw)) indicatorType = 'ipv4';
  else if (/^(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$/i.test(raw)) indicatorType = 'file_hash';
  else if (/^0x[a-fA-F0-9]{40}$/.test(raw) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(raw)) indicatorType = 'wallet_address';
  else if (/^https?:\/\//i.test(raw) || /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(raw)) indicatorType = 'domain_or_url';

  let malicious = false;
  const signals = [];
  const sources = ['Praman Threat Correlator'];

  if (indicatorType === 'cve') {
    const kev = await getCisaKevSet();
    sources.push('CISA KEV Catalog');
    if (kev.has(raw.toUpperCase())) {
      malicious = true;
      signals.push('CISA_KEV_ACTIVELY_EXPLOITED');
    }
  } else if (indicatorType === 'file_hash') {
    const uh = await checkUrlHaus('hash', raw.toLowerCase());
    sources.push('Abuse.ch URLhaus Payload DB');
    if (uh?.query_status === 'ok') {
      malicious = true;
      signals.push(`URLHAUS_MALWARE_HASH:${uh.signature || uh.file_type || 'payload'}`);
    }
  } else if (indicatorType === 'ipv4') {
    const [uh, ipRes] = await Promise.all([
      checkUrlHaus('host', raw),
      fetch(`https://ipwho.is/${encodeURIComponent(raw)}`, { signal: AbortSignal.timeout(3500) }).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);
    sources.push('Abuse.ch URLhaus Host DB', 'IPWHO.IS ASN Telemetry');
    if (uh?.query_status === 'ok' && Number(uh?.url_count || 0) > 0) {
      malicious = true;
      signals.push(`URLHAUS_HOST_LISTED:${uh.url_count}_urls`);
    }
    if (ipRes?.security?.is_tor || ipRes?.security?.is_bot) {
      malicious = true;
      signals.push('TOR_OR_BOTNET_NODE');
    }
  } else if (indicatorType === 'domain_or_url') {
    const host = extractHostname(raw);
    const [fw, uh] = await Promise.all([
      typeof checkFakeWatchDomain === 'function' ? checkFakeWatchDomain(raw).catch(() => null) : Promise.resolve(null),
      host ? checkUrlHaus('host', host) : Promise.resolve(null)
    ]);
    sources.push('FakeWatch/ScamSniffer', 'Abuse.ch URLhaus');
    if (fw?.verdict === 'PHISHING' || fw?.verdict === 'MALICIOUS') {
      malicious = true;
      signals.push(`PHISHING_OR_TYPOSQUAT:${fw.domain}`);
    }
    if (uh?.query_status === 'ok' && Number(uh?.url_count || 0) > 0) {
      malicious = true;
      signals.push(`URLHAUS_HOST_LISTED:${uh.url_count}_urls`);
    }
  }

  if (maliciousDrainers && typeof maliciousDrainers.has === 'function' && maliciousDrainers.has(raw)) {
    malicious = true;
    signals.push('KNOWN_SOLANA_DRAINER_EXFILTRATION');
    sources.push('Praman Solana Drainer Registry');
  }

  if (typeof screenSanctions === 'function') {
    try {
      const sdn = await screenSanctions({ name: raw });
      sources.push('US Treasury OFAC SDN (19,629 entries)');
      if (sdn?.matched) {
        malicious = true;
        signals.push(`OFAC_SDN_SANCTIONED:${sdn.matches?.[0]?.matched_name || raw}`);
      }
    } catch {}
  }

  const summary = `THREAT INTEL (${malicious ? 'MALICIOUS' : 'NOT_FLAGGED'}): ${raw} (${indicatorType}). Feeds checked: ${sources.join(', ')}. Signals: ${signals.length ? signals.join(', ') : 'NONE'}.`;
  const payload = {
    ok: true,
    intent: 'THREAT_INTELLIGENCE_INDICATOR',
    indicator: raw,
    indicator_type: indicatorType,
    malicious,
    verdict: malicious ? 'MALICIOUS' : 'CLEAN_OR_UNLISTED',
    signals,
    sources,
    confidence: malicious ? 0.96 : 0.88,
    summary,
    explanation: summary,
    answer: summary,
    as_of: new Date().toISOString()
  };
  payload.canonical_sha256 = sha256Seal(payload);
  return payload;
}

// ----------------------------------------------------------------------------
// 3. TRANSACTION_RISK_GENERAL
// ----------------------------------------------------------------------------
export async function assessTransactionRisk(params = {}, { lookupOnchainTx, screenSanctions, scoreFraudRisk, checkFakeWatchDomain } = {}) {
  const rawTx = cleanStr(params.transaction || params.tx || params.tx_hash || params.query || params.prompt || params.subject);
  if (!rawTx) {
    return {
      ok: false,
      intent: 'TRANSACTION_RISK_GENERAL',
      risk_level: 'LOW',
      risk_score: 0.0,
      signals: [],
      summary: 'No transaction hash or details provided.',
      confidence: 0.0,
      as_of: new Date().toISOString()
    };
  }

  const hashMatch = rawTx.match(/0x[a-fA-F0-9]{64}/);
  let score = 0.06;
  const signals = [];
  let txDetails = null;

  if (hashMatch && typeof lookupOnchainTx === 'function') {
    try {
      txDetails = await lookupOnchainTx({ tx_hash: hashMatch[0], chain: params.chain });
      if (txDetails?.status === 'confirmed' || txDetails?.tx_hash) {
        if (txDetails.tx_status === 'reverted' || txDetails.status === 'reverted') {
          score += 0.25;
          signals.push('ONCHAIN_TX_REVERTED');
        }
        const calldata = String(txDetails.input || '').toLowerCase();
        if (calldata.startsWith('0x095ea7b3') && calldata.endsWith('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')) {
          score += 0.45;
          signals.push('UNLIMITED_ERC20_APPROVAL_MAX_UINT256');
        } else if (calldata.startsWith('0xa22cb465')) {
          score += 0.35;
          signals.push('SET_APPROVAL_FOR_ALL_NFT_PERMISSION');
        } else if (calldata.startsWith('0xd505accf')) {
          score += 0.20;
          signals.push('EIP2612_OFFCHAIN_PERMIT_SIGNATURE');
        }
        if (typeof screenSanctions === 'function') {
          for (const addr of [txDetails.from, txDetails.to].filter(Boolean)) {
            const sdn = await screenSanctions({ name: addr }).catch(() => null);
            if (sdn?.matched) {
              score += 0.55;
              signals.push(`OFAC_SDN_COUNTERPARTY:${addr}`);
            }
          }
        }
      }
    } catch {}
  }

  if (typeof scoreFraudRisk === 'function') {
    const fraudRes = await scoreFraudRisk({ subject: rawTx, transaction: rawTx }, { screenSanctions, checkFakeWatchDomain }).catch(() => null);
    if (fraudRes && Array.isArray(fraudRes.signals)) {
      for (const s of fraudRes.signals) {
        const label = typeof s === 'string' ? s : s.signal;
        if (label && !signals.includes(label)) {
          signals.push(label);
          score += Number(s.weight || 0.25);
        }
      }
    }
  }

  if (/\b(?:tornado|mixer|sanctioned|lazarus|drainer|unlimited\s+approval|setapprovalforall|phishing|blind\s+sign|unknown\s+delegatecall)\b/i.test(rawTx) && signals.length === 0) {
    score += 0.50;
    signals.push('HIGH_RISK_TX_CALLDATA_OR_COUNTERPARTY');
  }

  const riskScore = Math.min(0.99, Math.max(0.04, Number(score.toFixed(2))));
  const riskLevel = riskScore >= 0.80 ? 'CRITICAL' : riskScore >= 0.55 ? 'HIGH' : riskScore >= 0.25 ? 'MEDIUM' : 'LOW';
  const summary = `TRANSACTION RISK (${riskLevel}, score ${riskScore.toFixed(2)}): ${signals.length ? signals.join(', ') : 'No sanctioned counterparty or drainer approval signatures detected.'}`;

  const payload = {
    ok: true,
    intent: 'TRANSACTION_RISK_GENERAL',
    transaction: hashMatch?.[0] || rawTx,
    risk_level: riskLevel,
    risk_score: riskScore,
    signals,
    tx_lookup: txDetails ? { chain: txDetails.chain, from: txDetails.from, to: txDetails.to, status: txDetails.status } : null,
    summary,
    explanation: summary,
    answer: summary,
    confidence: 0.92,
    as_of: new Date().toISOString()
  };
  payload.canonical_sha256 = sha256Seal(payload);
  return payload;
}

// ----------------------------------------------------------------------------
// 4. SSL_VERIFICATION_CERT (Deterministic Node TLS handshake)
// ----------------------------------------------------------------------------
export async function verifySslCertificate(params = {}) {
  const host = extractHostname(params.host || params.domain || params.url || params.query || params.question || params.prompt);
  if (!host) {
    return {
      ok: false,
      intent: 'SSL_VERIFICATION_CERT',
      certificate_valid: false,
      host: '',
      summary: 'No hostname provided for TLS/SSL inspection.',
      confidence: 0.0,
      as_of: new Date().toISOString()
    };
  }

  return await new Promise((resolve) => {
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    try {
      const socket = tls.connect({
        host,
        port: 443,
        servername: host,
        rejectUnauthorized: false,
        timeout: 4500
      }, () => {
        try {
          const cert = socket.getPeerCertificate();
          const authorized = Boolean(socket.authorized);
          const authError = socket.authorizationError ? String(socket.authorizationError) : null;
          const validFrom = cert?.valid_from ? new Date(cert.valid_from) : null;
          const validTo = cert?.valid_to ? new Date(cert.valid_to) : null;
          const now = Date.now();
          const inWindow = Boolean(validFrom && validTo && now >= validFrom.getTime() && now <= validTo.getTime());
          const daysRemaining = validTo ? Math.floor((validTo.getTime() - now) / 86400000) : null;
          const certificateValid = Boolean(cert && cert.subject && authorized && inWindow);
          const issuerCn = cert?.issuer?.CN || cert?.issuer?.O || 'Unknown CA';
          const proto = socket.getProtocol() || 'TLS';
          const summary = certificateValid
            ? `SSL/TLS VALID: ${host} presents a trusted ${proto} certificate issued by ${issuerCn} (${daysRemaining} days remaining, expires ${validTo?.toISOString().slice(0, 10)}).`
            : `SSL/TLS INVALID: ${host} failed certificate trust verification (${authError || 'expired or missing peer cert'}).`;
          socket.end();
          done({
            ok: true,
            intent: 'SSL_VERIFICATION_CERT',
            host,
            certificate_valid: certificateValid,
            authorized,
            authorization_error: authError,
            protocol: proto,
            issuer: issuerCn,
            subject_cn: cert?.subject?.CN || host,
            valid_from: validFrom?.toISOString() || null,
            valid_to: validTo?.toISOString() || null,
            days_remaining: daysRemaining,
            confidence: 1.0,
            summary,
            explanation: summary,
            answer: summary,
            as_of: new Date().toISOString()
          });
        } catch (err) {
          socket.destroy();
          done({
            ok: false,
            intent: 'SSL_VERIFICATION_CERT',
            host,
            certificate_valid: false,
            error: err.message,
            confidence: 0.5,
            summary: `TLS inspection failed for ${host}: ${err.message}`,
            as_of: new Date().toISOString()
          });
        }
      });
      socket.on('timeout', () => {
        socket.destroy();
        done({
          ok: false,
          intent: 'SSL_VERIFICATION_CERT',
          host,
          certificate_valid: false,
          error: 'TLS handshake timeout',
          confidence: 0.4,
          summary: `TLS handshake timed out for ${host}:443`,
          as_of: new Date().toISOString()
        });
      });
      socket.on('error', (err) => {
        done({
          ok: false,
          intent: 'SSL_VERIFICATION_CERT',
          host,
          certificate_valid: false,
          error: err.message,
          confidence: 0.85,
          summary: `SSL/TLS connection failed for ${host}: ${err.message}`,
          as_of: new Date().toISOString()
        });
      });
    } catch (err) {
      done({
        ok: false,
        intent: 'SSL_VERIFICATION_CERT',
        host,
        certificate_valid: false,
        error: err.message,
        confidence: 0.5,
        summary: `SSL/TLS setup error for ${host}: ${err.message}`,
        as_of: new Date().toISOString()
      });
    }
  });
}

// ----------------------------------------------------------------------------
// 5. CVE_LOOKUP_CVSS (NIST NVD v2 + CIRCL CVE fallback)
// ----------------------------------------------------------------------------
export async function lookupCveCvss(params = {}) {
  const raw = cleanStr(params.cve_id || params.cve || params.id || params.query || params.question || params.prompt);
  const cveMatch = raw.match(/CVE-\d{4}-\d{4,}/i);
  const cveId = cveMatch ? cveMatch[0].toUpperCase() : raw.toUpperCase();
  if (!/^CVE-\d{4}-\d{4,}$/.test(cveId)) {
    return {
      ok: false,
      intent: 'CVE_LOOKUP_CVSS',
      cve_id: raw,
      cvss_score: null,
      severity: 'NONE',
      description: 'Invalid or missing CVE identifier (expected format CVE-YYYY-NNNN).',
      published: null,
      references: [],
      confidence: 0.0,
      summary: 'Invalid or missing CVE identifier.'
    };
  }

  // Primary: NIST NVD v2.0
  try {
    const res = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cveId)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'PramanDesk/2.0' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const data = await res.json();
      const cve = data?.vulnerabilities?.[0]?.cve;
      if (cve) {
        const m31 = cve.metrics?.cvssMetricV31?.[0]?.cvssData;
        const m30 = cve.metrics?.cvssMetricV30?.[0]?.cvssData;
        const m40 = cve.metrics?.cvssMetricV40?.[0]?.cvssData;
        const m2 = cve.metrics?.cvssMetricV2?.[0];
        const metric = m40 || m31 || m30;
        const cvssScore = Number(metric?.baseScore ?? m2?.cvssData?.baseScore ?? 0);
        const rawSev = String(metric?.baseSeverity || m2?.baseSeverity || 'NONE').toUpperCase();
        const severity = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(rawSev) ? rawSev : 'MEDIUM';
        const descObj = (cve.descriptions || []).find(d => d.lang === 'en') || cve.descriptions?.[0];
        const description = cleanStr(descObj?.value);
        const published = cleanStr(cve.published).slice(0, 10) || null;
        const references = (cve.references || []).slice(0, 8).map(r => r.url).filter(Boolean);
        const summary = `${cveId} — CVSS ${cvssScore.toFixed(1)} (${severity}), published ${published || 'N/A'}: ${description.slice(0, 180)}`;
        return {
          ok: true,
          intent: 'CVE_LOOKUP_CVSS',
          cve_id: cveId,
          cvss_score: cvssScore,
          severity,
          description,
          published,
          references,
          source: 'NIST NVD API v2.0',
          confidence: 1.0,
          summary,
          explanation: summary,
          answer: summary,
          as_of: new Date().toISOString()
        };
      }
    }
  } catch {}

  // Fallback: CIRCL CVE Search / CVE Services MITRE v5
  try {
    const mRes = await fetch(`https://cveawg.mitre.org/api/cve/${encodeURIComponent(cveId)}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (mRes.ok) {
      const mj = await mRes.json();
      const cna = mj?.containers?.cna || {};
      const metrics = cna.metrics || [];
      let cvssObj = null;
      for (const m of metrics) {
        cvssObj = m.cvssV4_0 || m.cvssV3_1 || m.cvssV3_0 || m.cvssV2_0 || null;
        if (cvssObj) break;
      }
      const cvssScore = Number(cvssObj?.baseScore ?? 0);
      const rawSev = String(cvssObj?.baseSeverity || (cvssScore >= 9 ? 'CRITICAL' : cvssScore >= 7 ? 'HIGH' : cvssScore >= 4 ? 'MEDIUM' : cvssScore > 0 ? 'LOW' : 'NONE')).toUpperCase();
      const description = cleanStr((cna.descriptions || []).find(d => d.lang?.startsWith('en'))?.value || cna.descriptions?.[0]?.value);
      const published = cleanStr(mj?.cveMetadata?.datePublished).slice(0, 10) || null;
      const references = (cna.references || []).slice(0, 8).map(r => r.url).filter(Boolean);
      const summary = `${cveId} — CVSS ${cvssScore.toFixed(1)} (${rawSev}), published ${published || 'N/A'}: ${description.slice(0, 180)}`;
      return {
        ok: true,
        intent: 'CVE_LOOKUP_CVSS',
        cve_id: cveId,
        cvss_score: cvssScore,
        severity: rawSev,
        description,
        published,
        references,
        source: 'MITRE CVE AWG API v5',
        confidence: 0.96,
        summary,
        explanation: summary,
        answer: summary,
        as_of: new Date().toISOString()
      };
    }
  } catch {}

  return {
    ok: false,
    intent: 'CVE_LOOKUP_CVSS',
    cve_id: cveId,
    cvss_score: null,
    severity: 'NONE',
    description: `${cveId} not found or upstream NVD/MITRE API unreachable.`,
    published: null,
    references: [],
    confidence: 0.0,
    summary: `Unable to resolve ${cveId} from NIST NVD / MITRE CVE AWG.`
  };
}

// ----------------------------------------------------------------------------
// 6. SHIPMENT_DELAY_RISK_GENERAL (Live Open-Meteo marine/port weather + corridor risk)
// ----------------------------------------------------------------------------
const MAJOR_PORTS = [
  { re: /los\s*angeles|long\s*beach|\blax\b|uslax/i, name: 'Port of Los Angeles / Long Beach', lat: 33.74, lon: -118.27, baseDelay: 0.14 },
  { re: /shanghai|cnsha|ningbo/i, name: 'Port of Shanghai / Ningbo', lat: 31.23, lon: 121.47, baseDelay: 0.12 },
  { re: /shenzhen|yantian|hong\s*kong|guangzhou|cnszx/i, name: 'Pearl River Delta / Yantian', lat: 22.54, lon: 114.06, baseDelay: 0.13 },
  { re: /rotterdam|nlrtm|antwerp|hamburg/i, name: 'North Sea Ports (Rotterdam/Hamburg)', lat: 51.92, lon: 4.48, baseDelay: 0.15 },
  { re: /singapore|sgsin|malacca/i, name: 'Port of Singapore', lat: 1.26, lon: 103.82, baseDelay: 0.10 },
  { re: /red\s*sea|suez|bab\s*el-?mandeb|cape\s+of\s+good\s+hope/i, name: 'Red Sea / Suez Maritime Corridor', lat: 13.0, lon: 43.3, baseDelay: 0.48 },
  { re: /panama/i, name: 'Panama Canal Locks', lat: 9.08, lon: -79.68, baseDelay: 0.24 },
  { re: /savannah|new\s*york|newark|charleston|houston/i, name: 'US East/Gulf Coast Gateway', lat: 32.08, lon: -81.09, baseDelay: 0.14 }
];

export async function assessShipmentDelayRisk(params = {}) {
  const raw = cleanStr(params.shipment || params.route || params.tracking || params.query || params.question || params.prompt);
  if (!raw) {
    return {
      ok: false,
      intent: 'SHIPMENT_DELAY_RISK_GENERAL',
      risk_level: 'low',
      delay_probability: 0.0,
      factors: [],
      summary: 'No shipment route or tracking reference provided.',
      confidence: 0.0
    };
  }

  let prob = 0.08;
  const factors = [];

  if (/\b(?:customs\s+hold|inspection\s+hold|damaged|wet\s+damage|missing\s+manifest|shortfall|strike|lockout|port\s+congestion)\b/i.test(raw)) {
    prob += 0.38;
    factors.push('Customs inspection hold, labor disruption, or cargo exception reported');
  }
  if (/\b(?:storm|typhoon|hurricane|cyclone|gale|fog|monsoon|delayed|late|diverted)\b/i.test(raw)) {
    prob += 0.30;
    factors.push('Severe weather or vessel diversion marker on route');
  }
  if (/\b(?:red\s*sea|suez|houthi|cape\s+of\s+good\s+hope)\b/i.test(raw)) {
    prob += 0.35;
    factors.push('Red Sea / Suez security diversion (+10-14 days Cape of Good Hope transit)');
  }

  const matchedPorts = MAJOR_PORTS.filter(p => p.re.test(raw)).slice(0, 2);
  for (const port of matchedPorts) {
    prob = Math.max(prob, port.baseDelay);
    try {
      const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${port.lat}&longitude=${port.lon}&current=wind_speed_10m,precipitation,weather_code`, {
        signal: AbortSignal.timeout(3000)
      });
      if (wRes.ok) {
        const w = await wRes.json();
        const wind = Number(w?.current?.wind_speed_10m ?? 0);
        const rain = Number(w?.current?.precipitation ?? 0);
        if (wind >= 45) {
          prob += 0.28;
          factors.push(`${port.name}: high terminal winds (${wind} km/h, crane suspension risk)`);
        } else if (wind >= 25 || rain >= 5) {
          prob += 0.12;
          factors.push(`${port.name}: moderate weather telemetry (${wind} km/h wind, ${rain} mm precip)`);
        } else {
          factors.push(`${port.name}: nominal live weather (${wind} km/h wind, ${rain} mm precip)`);
        }
      }
    } catch {
      factors.push(`${port.name}: corridor baseline delay risk ${(port.baseDelay * 100).toFixed(0)}%`);
    }
  }

  if (factors.length === 0) {
    factors.push('Standard intermodal schedule baseline with no active corridor alert matched');
  }

  const delayProbability = Math.min(0.97, Math.max(0.05, Number(prob.toFixed(2))));
  const riskLevel = delayProbability >= 0.75 ? 'severe' : delayProbability >= 0.50 ? 'high' : delayProbability >= 0.25 ? 'moderate' : 'low';
  const summary = `SHIPMENT DELAY RISK (${riskLevel.toUpperCase()}, prob ${(delayProbability * 100).toFixed(0)}%): ${factors.slice(0, 3).join('; ')}.`;

  return {
    ok: true,
    intent: 'SHIPMENT_DELAY_RISK_GENERAL',
    shipment: raw,
    risk_level: riskLevel,
    delay_probability: delayProbability,
    factors,
    confidence: matchedPorts.length > 0 ? 0.90 : 0.80,
    summary,
    explanation: summary,
    answer: summary,
    as_of: new Date().toISOString()
  };
}

// ----------------------------------------------------------------------------
// 7. IP_GEOLOCATION_GENERAL
// ----------------------------------------------------------------------------
export async function geolocateIpAddress(params = {}) {
  const raw = cleanStr(params.ip || params.address || params.query || params.question || params.prompt);
  const ipv4Match = raw.match(/\b((?:25[0-5]|2[0-4]\d|[01]?\d\d?)(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3})\b/);
  const ipv6Match = !ipv4Match ? raw.match(/\b([0-9a-fA-F:]{6,39})\b/) : null;
  const ip = ipv4Match?.[1] || (ipv6Match && ipv6Match[1].includes(':') ? ipv6Match[1] : '');
  if (!ip) {
    return {
      ok: false,
      intent: 'IP_GEOLOCATION_GENERAL',
      ip: raw,
      country: null,
      city: null,
      latitude: null,
      longitude: null,
      isp: null,
      confidence: 0.0,
      summary: 'No valid IPv4 or IPv6 address supplied.'
    };
  }

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const d = await res.json();
      if (d?.success !== false && (d?.country || d?.latitude !== undefined)) {
        const country = d.country || '';
        const city = d.city || d.region || '';
        const latitude = Number(d.latitude ?? 0);
        const longitude = Number(d.longitude ?? 0);
        const isp = d.connection?.isp || d.connection?.org || (d.connection?.asn ? `AS${d.connection.asn}` : 'Unknown ISP');
        const summary = `IP ${ip} geolocates to ${city ? `${city}, ` : ''}${country} (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), ISP: ${isp}.`;
        return {
          ok: true,
          intent: 'IP_GEOLOCATION_GENERAL',
          ip,
          country,
          country_code: d.country_code || null,
          city,
          latitude,
          longitude,
          isp,
          asn: d.connection?.asn ? `AS${d.connection.asn}` : null,
          source: 'ipwho.is',
          confidence: 0.98,
          summary,
          explanation: summary,
          answer: summary,
          as_of: new Date().toISOString()
        };
      }
    }
  } catch {}

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { 'User-Agent': 'PramanDesk/2.0' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const d = await res.json();
      if (!d.error && (d.country_name || d.latitude !== undefined)) {
        const country = d.country_name || d.country || '';
        const city = d.city || d.region || '';
        const latitude = Number(d.latitude ?? 0);
        const longitude = Number(d.longitude ?? 0);
        const isp = d.org || d.asn || 'Unknown ISP';
        const summary = `IP ${ip} geolocates to ${city ? `${city}, ` : ''}${country} (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), ISP: ${isp}.`;
        return {
          ok: true,
          intent: 'IP_GEOLOCATION_GENERAL',
          ip,
          country,
          city,
          latitude,
          longitude,
          isp,
          source: 'ipapi.co',
          confidence: 0.96,
          summary,
          explanation: summary,
          answer: summary,
          as_of: new Date().toISOString()
        };
      }
    }
  } catch {}

  return {
    ok: false,
    intent: 'IP_GEOLOCATION_GENERAL',
    ip,
    country: null,
    city: null,
    latitude: null,
    longitude: null,
    isp: null,
    confidence: 0.0,
    summary: `IP geolocation providers unavailable for ${ip}.`
  };
}

// ----------------------------------------------------------------------------
// 8. TOKEN_HOLDER_COUNT_GENERAL
// ----------------------------------------------------------------------------
const BLOCKSCOUT_BASES = {
  ethereum: 'https://eth.blockscout.com/api/v2/tokens/',
  base: 'https://base.blockscout.com/api/v2/tokens/',
  arbitrum: 'https://arbitrum.blockscout.com/api/v2/tokens/',
  optimism: 'https://optimism.blockscout.com/api/v2/tokens/',
  polygon: 'https://polygon.blockscout.com/api/v2/tokens/',
  sepolia: 'https://eth-sepolia.blockscout.com/api/v2/tokens/'
};

export async function getTokenHolderCount(params = {}, { verifyTokenTotalSupply } = {}) {
  const tokenInput = cleanStr(params.token || params.token_address || params.address || params.query || params.question || params.prompt);
  const chainInput = cleanStr(params.chain || params.network || 'ethereum').toLowerCase();
  if (!tokenInput) {
    return {
      ok: false,
      intent: 'TOKEN_HOLDER_COUNT_GENERAL',
      token: '',
      chain: chainInput,
      holders_count: null,
      token_symbol: '',
      confidence: 0.0,
      summary: 'No token contract address or symbol provided.'
    };
  }

  let resolvedAddress = tokenInput.match(/0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44}/)?.[0] || '';
  let resolvedChain = chainInput || 'ethereum';

  if ((!resolvedAddress || !resolvedAddress.startsWith('0x')) && typeof verifyTokenTotalSupply === 'function') {
    const sup = await verifyTokenTotalSupply({ token: tokenInput, chain: resolvedChain }).catch(() => null);
    if (sup?.token_address && sup.token_address !== 'native-SOL') {
      resolvedAddress = sup.token_address;
      resolvedChain = sup.chain || resolvedChain;
    }
  }

  const bsBase = BLOCKSCOUT_BASES[resolvedChain];
  if (bsBase && /^0x[a-fA-F0-9]{40}$/.test(resolvedAddress)) {
    try {
      const res = await fetch(`${bsBase}${resolvedAddress}`, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const d = await res.json();
        const holders = Number(d.holders_count ?? d.holders);
        if (Number.isFinite(holders) && holders >= 0) {
          const sym = d.symbol || tokenInput.toUpperCase();
          const summary = `${sym} (${resolvedAddress}) on ${resolvedChain} has ${Math.round(holders).toLocaleString('en-US')} distinct holder addresses (Blockscout v2).`;
          return {
            ok: true,
            intent: 'TOKEN_HOLDER_COUNT_GENERAL',
            token: resolvedAddress,
            chain: resolvedChain,
            holders_count: Math.round(holders),
            token_symbol: sym,
            source: 'Blockscout API v2',
            confidence: 0.98,
            summary,
            explanation: summary,
            answer: summary,
            as_of: new Date().toISOString()
          };
        }
      }
    } catch {}
  }

  if (resolvedChain === 'ethereum' && /^0x[a-fA-F0-9]{40}$/.test(resolvedAddress)) {
    try {
      const res = await fetch(`https://api.ethplorer.io/getTokenInfo/${resolvedAddress}?apiKey=freekey`, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const d = await res.json();
        const holders = Number(d.holdersCount);
        if (Number.isFinite(holders) && holders >= 0) {
          const sym = d.symbol || tokenInput.toUpperCase();
          const summary = `${sym} (${resolvedAddress}) on ethereum has ${Math.round(holders).toLocaleString('en-US')} distinct holders (Ethplorer).`;
          return {
            ok: true,
            intent: 'TOKEN_HOLDER_COUNT_GENERAL',
            token: resolvedAddress,
            chain: 'ethereum',
            holders_count: Math.round(holders),
            token_symbol: sym,
            source: 'Ethplorer API',
            confidence: 0.96,
            summary,
            explanation: summary,
            answer: summary,
            as_of: new Date().toISOString()
          };
        }
      }
    } catch {}
  }

  return {
    ok: false,
    intent: 'TOKEN_HOLDER_COUNT_GENERAL',
    token: resolvedAddress || tokenInput,
    chain: resolvedChain,
    holders_count: null,
    token_symbol: '',
    confidence: 0.0,
    summary: `Live holder indexer unavailable or token not resolved for ${tokenInput} on ${resolvedChain}.`
  };
}

// ----------------------------------------------------------------------------
// 9. WASH_TRADING_DETECTION_GENERAL
// ----------------------------------------------------------------------------
export async function detectWashTrading(params = {}) {
  const subject = cleanStr(params.subject || params.pool || params.token || params.query || params.question || params.prompt);
  if (!subject) {
    return {
      ok: false,
      intent: 'WASH_TRADING_DETECTION_GENERAL',
      subject: '',
      verdict: 'inconclusive',
      wash_volume_pct: 0,
      signals: [],
      summary: 'No token, pair, or pool provided for wash trading analysis.',
      confidence: 0.0
    };
  }

  let pairs = [];
  const addrMatch = subject.match(/0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44}/);
  try {
    if (addrMatch) {
      const tRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addrMatch[0]}`, { signal: AbortSignal.timeout(4000) });
      if (tRes.ok) {
        const tj = await tRes.json();
        if (Array.isArray(tj?.pairs)) pairs.push(...tj.pairs);
      }
    }
    if (!pairs.length) {
      const sRes = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(subject)}`, { signal: AbortSignal.timeout(4000) });
      if (sRes.ok) {
        const sj = await sRes.json();
        if (Array.isArray(sj?.pairs)) pairs.push(...sj.pairs);
      }
    }
  } catch {}

  if (!pairs.length) {
    return {
      ok: true,
      intent: 'WASH_TRADING_DETECTION_GENERAL',
      subject,
      verdict: 'inconclusive',
      wash_volume_pct: 0,
      signals: ['INSUFFICIENT_DEX_TELEMETRY'],
      summary: `Inconclusive: no active DEX pool telemetry returned for "${subject}".`,
      confidence: 0.35,
      as_of: new Date().toISOString()
    };
  }

  pairs.sort((a, b) => Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0));
  const top = pairs[0];
  const liq = Number(top.liquidity?.usd || 0);
  const vol24 = Number(top.volume?.h24 || 0);
  const buys24 = Number(top.txns?.h24?.buys || 0);
  const sells24 = Number(top.txns?.h24?.sells || 0);
  const turnover = liq > 0 ? vol24 / liq : 0;
  const totalTx = buys24 + sells24;
  const buyRatio = totalTx > 0 ? buys24 / totalTx : 0.5;
  const avgTradeSize = totalTx > 0 ? vol24 / totalTx : 0;

  let washPct = 4;
  const signals = [];
  if (turnover > 25) {
    washPct += Math.min(55, (turnover - 25) * 1.2);
    signals.push(`ABNORMAL_TURNOVER_RATIO:${turnover.toFixed(1)}x_24h_vol_to_tvl`);
  } else if (turnover > 10) {
    washPct += 18;
    signals.push(`ELEVATED_TURNOVER_RATIO:${turnover.toFixed(1)}x`);
  }
  if (totalTx >= 200 && Math.abs(buyRatio - 0.5) < 0.015) {
    washPct += 24;
    signals.push(`SYMMETRIC_BOT_ORDERFLOW:${buys24}_buys_vs_${sells24}_sells`);
  }
  if (liq > 0 && liq < 25000 && vol24 > 250000) {
    washPct += 30;
    signals.push(`SHALLOW_POOL_CHURNING:tvl_${Math.round(liq)}_vol_${Math.round(vol24)}`);
  }
  if (!signals.length) {
    signals.push(`ORGANIC_VOLUME_TO_LIQUIDITY:${turnover.toFixed(2)}x_with_${totalTx}_24h_txns`);
  }

  const washVolumePct = Math.min(98, Math.max(0, Number(washPct.toFixed(2))));
  const verdict = washVolumePct >= 60 ? 'wash_trading' : washVolumePct >= 35 ? 'likely_wash_trading' : 'organic';
  const summary = `WASH TRADING ANALYSIS (${verdict.toUpperCase()}): ${top.baseToken?.symbol}/${top.quoteToken?.symbol} on ${top.chainId} (${top.dexId}) shows ${washVolumePct}% estimated synthetic flow ($${Math.round(vol24).toLocaleString('en-US')} 24h vol / $${Math.round(liq).toLocaleString('en-US')} TVL, avg tx $${Math.round(avgTradeSize).toLocaleString('en-US')}).`;

  return {
    ok: true,
    intent: 'WASH_TRADING_DETECTION_GENERAL',
    subject,
    pair: `${top.baseToken?.symbol}/${top.quoteToken?.symbol}`,
    chain: top.chainId,
    dex: top.dexId,
    verdict,
    wash_volume_pct: washVolumePct,
    signals,
    metrics: { liquidity_usd: liq, volume_24h_usd: vol24, turnover_ratio: Number(turnover.toFixed(2)), buys_24h: buys24, sells_24h: sells24 },
    confidence: 0.90,
    summary,
    explanation: summary,
    answer: summary,
    as_of: new Date().toISOString()
  };
}

// ----------------------------------------------------------------------------
// 10. TELEGRAPH_KNOWLEDGE_GENERAL
// ----------------------------------------------------------------------------
const TELEGRAPH_KB = [
  {
    re: /\bdiamond|contract|address|usdc|sepolia|registry|evaluator\b/i,
    answer: 'Telegraph Protocol Season II runs on Ethereum Sepolia via EIP-2535 Diamond Port 0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b, test-USDC 0xcc194e1a843B658526D0D5C431f670028582Ae17, and EvaluatorRegistry 0x041d2e5642F861c3967cA063d9Cb1a050bB36B20.',
    brief: 'Sepolia Diamond 0x72a7...a08b, test-USDC 0xcc19...Ae17, Evaluator 0x041d...6B20.',
    sources: ['https://devnode.telegraphprotocol.com', 'https://anjoman.ai']
  },
  {
    re: /\bwasm|evaluator|comparator|minicheck|deberta|lora|adapter\b/i,
    answer: 'Telegraph Evaluators execute deterministic WebAssembly adapters (class deterministic/hybrid/judgment, including foundation release minicheck-deberta-v3-large-512-v1 with LoRA-v2 weights) pinned on-chain and run sandboxed on devnode.',
    brief: 'Evaluators run sandboxed WASM adapters & LoRA-v2 MiniCheck models pinned on-chain.',
    sources: ['https://github.com/telegraphprotocol/telegraph-foundation', 'https://anjoman.ai']
  },
  {
    re: /\bminer|bond|x402|usdc|register|yaml|endpoint\b/i,
    answer: 'Telegraph Miners publish signed HTTP endpoints with a miner.yaml descriptor, bond Sepolia test-USDC into the Diamond Port proportional to supported intents, and earn metered x402 USDC payouts per verified call.',
    brief: 'Miners declare miner.yaml, bond test-USDC on Diamond, and earn x402 per-call.',
    sources: ['https://anjoman.ai', 'https://devnode.telegraphprotocol.com']
  },
  {
    re: /\btelegraph|anjoman|protocol|season|hackathon|track\b/i,
    answer: 'Telegraph Protocol is an on-chain market for verifiable AI intelligence and deterministic data feeds across Miners, WASM Evaluators, and Agent/App gateways coordinated via Sepolia smart contracts and Anjoman (anjoman.ai).',
    brief: 'Telegraph is a verifiable AI clearing market across Miners, WASM Evaluators, and Apps.',
    sources: ['https://anjoman.ai', 'https://devnode.telegraphprotocol.com']
  }
];

function makeBrief(text) {
  const clean = cleanStr(text).replace(/\s+/g, ' ');
  if (clean.length <= 80) return clean;
  const cut = clean.slice(0, 77);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:!?]+$/, '')}...`;
}

export async function answerTelegraphKnowledge(params = {}, { executeWebSearch } = {}) {
  const question = cleanStr(params.question || params.query || params.prompt || params.text);
  if (!question) {
    return {
      ok: false,
      intent: 'TELEGRAPH_KNOWLEDGE_GENERAL',
      answer: 'No question provided.',
      knowledge_topic: 'telegraph',
      sources: [],
      brief: 'No question provided.',
      confidence: 0.0
    };
  }

  const isTelegraph = /\b(?:telegraph|anjoman|devnode|x402|bond|miner\.yaml|evaluator\s*registry|diamond\s*(?:port|contract|reg|miner)|sepolia\s+diamond|minicheck|wasm\s*adapter|season\s*ii|praman\s*desk)\b/i.test(question);
  if (isTelegraph) {
    const kb = TELEGRAPH_KB.find(item => item.re.test(question)) || TELEGRAPH_KB[TELEGRAPH_KB.length - 1];
    return {
      ok: true,
      intent: 'TELEGRAPH_KNOWLEDGE_GENERAL',
      question,
      answer: kb.answer,
      knowledge_topic: 'telegraph',
      sources: kb.sources,
      brief: makeBrief(kb.brief),
      confidence: 0.96,
      summary: kb.answer,
      as_of: new Date().toISOString()
    };
  }

  if (typeof executeWebSearch === 'function') {
    const ws = await executeWebSearch({ query: question }).catch(() => null);
    if (ws && (ws.answer || ws.summary)) {
      const ans = cleanStr(ws.answer || ws.summary);
      return {
        ok: true,
        intent: 'TELEGRAPH_KNOWLEDGE_GENERAL',
        question,
        answer: ans,
        knowledge_topic: 'general',
        sources: Array.isArray(ws.urls) ? ws.urls.slice(0, 5) : ['Wikipedia / DuckDuckGo Live Search'],
        brief: makeBrief(ans),
        confidence: Number(ws.confidence || 0.88),
        summary: ans,
        as_of: new Date().toISOString()
      };
    }
  }

  return {
    ok: true,
    intent: 'TELEGRAPH_KNOWLEDGE_GENERAL',
    question,
    answer: `Unable to retrieve live external sources for "${question}".`,
    knowledge_topic: 'general',
    sources: [],
    brief: makeBrief(`No live external source result for "${question}".`),
    confidence: 0.4,
    summary: `Unable to retrieve live external sources for "${question}".`,
    as_of: new Date().toISOString()
  };
}
