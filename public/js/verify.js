/* Praman Receipt Verifier Controller: Client WebCrypto SHA-256 + EIP-191 Signer Recovery */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  function esc(v) {
    return window.PramanShell ? window.PramanShell.escapeHtml(v) : String(v ?? "");
  }

  function resolveInitialCaseId() {
    const params = new URLSearchParams(location.search);
    const qCase = params.get("case") || params.get("id");
    if (qCase) return qCase.trim().toLowerCase();
    const m = location.pathname.match(/^\/case\/([^/]+)/i);
    if (m && m[1]) return decodeURIComponent(m[1]).trim().toLowerCase();
    return "po-ali-9021";
  }

  async function browserSha256Hex(text) {
    const buf = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    const bytes = new Uint8Array(digest);
    return "0x" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  let currentExpectedSha256 = "";
  let currentExpectedSigner = "";
  let currentCaseId = resolveInitialCaseId();

  async function verifyMemo(message, signature) {
    const out = $("#vr-verify-out");
    const badge = $("#vr-check-badge");
    const ckv = $("#vr-crypto-kv");

    if (!message) {
      if (badge) {
        badge.textContent = "MISSING MEMO";
        badge.className = "badge badge-warn";
      }
      return;
    }

    const localSha = await browserSha256Hex(message);
    const shaMatchesOriginal = currentExpectedSha256 ? localSha.toLowerCase() === currentExpectedSha256.toLowerCase() : null;

    if (out) {
      out.hidden = false;
      out.textContent = "Verifying EIP-191 signature via POST /api/memo/verify...";
    }

    try {
      const res = await fetch("/api/memo/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          signature,
          expectedSha256: currentExpectedSha256 || undefined,
          expectedSigner: currentExpectedSigner || undefined
        })
      });
      const v = await res.json();

      const passed = Boolean(
        v.verified ??
          (v.validSignature &&
            v.signerMatches !== false &&
            (v.expectedSigner ? true : v.matchesOfficialPramanSigner) &&
            shaMatchesOriginal !== false)
      );
      if (badge) {
        badge.textContent = !signature
          ? "UNSIGNED RECORD"
          : passed
            ? "VERIFIED MATCH"
            : "MISMATCH / TAMPERED";
        badge.className = "badge " + (!signature ? "badge-warn" : passed ? "badge-ok" : "badge-halt");
      }

      if (ckv) {
        ckv.innerHTML = [
          ["Browser SHA-256", `<span class="mono">${esc(localSha)}</span>`],
          ["Expected SHA-256", `<span class="mono">${esc(currentExpectedSha256 || "None (Custom input)")}</span>`],
          ["Digest Match", shaMatchesOriginal === null ? "Custom input" : shaMatchesOriginal ? "EXACT MATCH" : "MODIFIED"],
          ["Recovered Signer", `<span class="mono">${esc(v.recoveredSigner || "-")}</span>`],
          ["Signer Matches Case", v.signerMatches === null ? "-" : v.signerMatches ? "YES" : "NO"]
        ]
          .map(([k, val]) => `<dt>${k}</dt><dd>${val}</dd>`)
          .join("");
      }

      if (out) {
        out.textContent = JSON.stringify({ browserSha256: localSha, serverVerification: v }, null, 2);
      }
    } catch (err) {
      if (out) out.textContent = `Verification request failed: ${err.message}`;
    }
  }

  async function loadCase(caseId) {
    currentCaseId = caseId;
    $$("[data-case-id]").forEach((p) => {
      p.setAttribute("aria-pressed", String(p.dataset.caseId === caseId));
    });
    history.replaceState(null, "", `/verify?case=${encodeURIComponent(caseId)}`);

    $("#vr-summary").textContent = `Loading case ${caseId}...`;
    try {
      const res = await fetch(`/api/audit/case?case=${encodeURIComponent(caseId)}&format=json`);
      const d = await res.json();
      const memo = d.memoVerification || {};

      const verdict = String(d.clearanceVerdict || d.verdict || "CLEARED").toUpperCase();
      const isHalt = verdict.includes("HALT") || verdict.includes("BLOCK") || verdict.includes("REJECT");
      const isReview = verdict.includes("HOLD") || verdict.includes("DIVERGENCE") || verdict.includes("REVIEW");
      const stamp = $("#vr-stamp");
      if (stamp) {
        stamp.textContent = isHalt ? "HALTED" : isReview ? "REVIEW" : "CLEARED";
        stamp.className = "rubber-stamp " + (isHalt ? "is-halted" : isReview ? "is-review" : "is-cleared");
      }

      $("#vr-summary").textContent = d.clearanceSummary || d.title || verdict;

      const rows = [
        ["Case ID", `<span class="mono">${esc(d.caseId || caseId)}</span>`],
        ["Title", esc(d.title || "-")],
        ["Entity", esc(d.entity || "-")],
        ["PO / Invoice", `<span class="mono">${esc(d.poNumber || "-")} / ${esc(d.invoiceNumber || "-")}</span>`],
        ["Verdict", `<span class="mono">${esc(verdict)}</span>`],
        ["Contract / Chain", `<span class="mono">${esc(d.contract || d.chain || "Ethereum Sepolia")}</span>`],
        ["Tx Hash", `<span class="mono">${esc(d.txHash || "-")}</span>`],
        ["Seal Digest", `<span class="mono">${esc(d.caseSeal || d.cryptographicSeal?.sealDigest || "-")}</span>`]
      ];
      $("#vr-kv").innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");

      const links = [
        `<a class="btn btn-primary" href="/api/audit/case?case=${encodeURIComponent(caseId)}&format=html" target="_blank" rel="noopener">Printable Certificate</a>`,
        `<a class="btn" href="/api/audit/case?case=${encodeURIComponent(caseId)}&format=json" target="_blank" rel="noopener">Raw JSON</a>`
      ];
      if (d.etherscanUrl) links.push(`<a class="btn" href="${esc(d.etherscanUrl)}" target="_blank" rel="noopener">Sepolia Etherscan</a>`);
      if (d.easUrl) links.push(`<a class="btn" href="${esc(d.easUrl)}" target="_blank" rel="noopener">EAS Attestation</a>`);
      if (d.solscanUrl) links.push(`<a class="btn" href="${esc(d.solscanUrl)}" target="_blank" rel="noopener">Solscan Devnet</a>`);
      $("#vr-links").innerHTML = links.join("");

      currentExpectedSha256 = memo.sha256 || "";
      currentExpectedSigner = memo.signerAddress || "";
      $("#vr-memo-input").value = memo.canonicalMessage || "";
      $("#vr-sig-input").value = memo.signature || "";

      await verifyMemo(memo.canonicalMessage || "", memo.signature || "");
    } catch (err) {
      $("#vr-summary").textContent = `Could not load case ${caseId}: ${err.message}`;
    }
  }

  $$("[data-case-id]").forEach((btn) => {
    btn.addEventListener("click", () => loadCase(btn.dataset.caseId));
  });

  $("#vr-reverify-btn")?.addEventListener("click", () => {
    verifyMemo($("#vr-memo-input").value, $("#vr-sig-input").value.trim());
  });

  $("#vr-copy-link-btn")?.addEventListener("click", (e) => {
    const url = `${location.origin}/verify?case=${encodeURIComponent(currentCaseId)}`;
    if (window.PramanShell) window.PramanShell.copyText(url, e.currentTarget);
  });

  loadCase(currentCaseId);
})();
