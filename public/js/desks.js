/* Praman Operator Desks Controller (6 Interactive Desks + Ledger + Track 3 + Client 651B WASM) */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ETHERSCAN = "https://sepolia.etherscan.io/tx/";
  const DESK_HASHES = [
    "disposition-board",
    "trade-assurance",
    "spend-guard",
    "settlement-ledger",
    "mining-registry",
    "verification-labs"
  ];
  const HASH_ALIASES = {
    "#disposition-board": 0,
    "#trade-assurance": 1,
    "#spend-guard": 2,
    "#ledger": 3,
    "#settlement-ledger": 3,
    "#mining": 4,
    "#mining-registry": 4,
    "#procurement-verify": 5,
    "#verification-labs": 5
  };

  function esc(v) {
    return window.PramanShell ? window.PramanShell.escapeHtml(v) : String(v ?? "");
  }

  function fmtUsd(n) {
    const val = Number(n);
    return Number.isFinite(val)
      ? "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "$0.00";
  }

  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._h);
    el._h = setTimeout(() => el.classList.remove("show"), 2400);
  }

  /* ---------------- Desk Tab Switching (with startViewTransition + keyboard) ---------------- */
  let currentTab = 0;

  function applyTabSwitch(idx, updateHash) {
    const clamped = Math.max(0, Math.min(DESK_HASHES.length - 1, idx));
    currentTab = clamped;
    $$(".desk-panel").forEach((panel, k) => {
      panel.hidden = k !== clamped;
    });
    $$(".desk-tab").forEach((btn, k) => {
      btn.setAttribute("aria-selected", String(k === clamped));
    });
    if (updateHash) {
      history.replaceState(null, "", "#" + DESK_HASHES[clamped]);
    }
  }

  function switchTab(idx, updateHash = true) {
    const reduced =
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
      document.documentElement.dataset.motion === "reduced";
    if (!reduced && typeof document.startViewTransition === "function") {
      const t = document.startViewTransition(() => applyTabSwitch(idx, updateHash));
      t.ready.catch(() => {});
      t.finished.catch(() => {});
    } else {
      applyTabSwitch(idx, updateHash);
    }
  }

  const tabs = $$(".desk-tab");
  tabs.forEach((btn, idx) => {
    btn.addEventListener("click", () => switchTab(idx));
    btn.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        tabs[next].focus();
        switchTab(next);
      }
    });
  });

  function syncFromHash() {
    const h = location.hash;
    if (h && Object.prototype.hasOwnProperty.call(HASH_ALIASES, h)) {
      applyTabSwitch(HASH_ALIASES[h], false);
    }
  }
  window.addEventListener("hashchange", syncFromHash);
  syncFromHash();

  /* ---------------- Modals & Drawers ---------------- */
  $$("dialog").forEach((d) => {
    d.addEventListener("click", (e) => {
      if (e.target === d && window.PramanShell) window.PramanShell.closeTopLayer(d);
    });
  });

  const devBtn = $("#dev-drawer-btn");
  if (devBtn) {
    devBtn.addEventListener("click", () => {
      const d = $("#dev-drawer");
      if (d && window.PramanShell) window.PramanShell.openDialog(d);
    });
  }

  const copyMcpBtn = $("#copy-mcp-json-btn");
  if (copyMcpBtn) {
    copyMcpBtn.addEventListener("click", () => {
      const cfg = JSON.stringify({ mcpServers: { "praman-desk": { url: "https://praman-desk.vercel.app/api/mcp" } } }, null, 2);
      if (window.PramanShell) window.PramanShell.copyText(cfg, copyMcpBtn);
    });
  }

  /* ---------------- Desk 0: Disposition Board ---------------- */
  const DB_LANES = [
    { id: "hold", label: "Hold", tone: "var(--halt)" },
    { id: "release", label: "Release", tone: "var(--ok)" },
    { id: "partial", label: "Partial", tone: "var(--warn)" },
    { id: "refund", label: "Refund", tone: "var(--brand)" }
  ];

  const DB_CASES = [
    {
      id: "PO-ALI-9021",
      verifyCase: "po-ali-9021-halt",
      lane: "hold",
      escrow: 100000,
      computed: 80000,
      rule: "WASM Circuit Breaker: $20,000 overbilling shortfall (80/100 units conforming)",
      flag: "ARBITRATION"
    },
    {
      id: "PO-7781",
      verifyCase: "praman-escrow-0",
      lane: "release",
      escrow: 12400,
      computed: 12400,
      rule: "Equation matcher: 1000 units x USD 12.40 reconciled cleanly with zero discrepancy",
      flag: null
    },
    {
      id: "CN-LAX-88201",
      verifyCase: "po-ali-9021",
      lane: "partial",
      escrow: 100000,
      computed: 80000,
      rule: "PierPass manifest audit: 80 conforming accepted ($80k), 20 damaged ($20k refund)",
      flag: null
    },
    {
      id: "PO-DEMO-REF",
      verifyCase: "po-ali-9021-halt",
      lane: "refund",
      escrow: 25000,
      computed: 0,
      rule: "Evidence completeness gate FAIL: 0 of 1 required delivery artifacts on file",
      flag: null
    }
  ];

  function dbRender() {
    const wrap = $("#db-lanes");
    if (!wrap) return;
    wrap.innerHTML = DB_LANES.map((l) => {
      const cards = DB_CASES.filter((c) => c.lane === l.id);
      return `<div class="lane-col">
        <div class="lane-head">
          <span style="color:${l.tone}">${esc(l.label)}</span>
          <span style="color:var(--ink-muted)">${cards.length}</span>
        </div>
        ${
          cards
            .map(
              (c) => `<button type="button" class="lane-card-btn" data-db-case="${esc(c.id)}">
                <strong style="font-size:0.9rem">${esc(c.id)}</strong>
                <div class="mono tabular" style="font-size:0.78rem;color:var(--ink-secondary);margin-top:0.2rem">${fmtUsd(c.escrow)} escrow</div>
                ${c.flag ? `<span class="badge badge-warn" style="margin-top:0.45rem">${esc(c.flag)}</span>` : ""}
              </button>`
            )
            .join("") || '<p style="font-size:0.8rem;color:var(--ink-muted);margin:0">No cases in lane.</p>'
        }
      </div>`;
    }).join("");

    $$("[data-db-case]", wrap).forEach((btn) => {
      btn.addEventListener("click", () => dbOpen(btn.dataset.dbCase));
    });
  }

  function dbOpen(id) {
    const c = DB_CASES.find((x) => x.id === id);
    const dlg = $("#db-case-drawer");
    if (!c || !dlg) return;
    $("#db-drawer-title").textContent = c.id;
    const delta = c.escrow - c.computed;
    $("#db-drawer-body").innerHTML = `
      <p style="margin-top:0">${esc(c.rule)}</p>
      <dl class="doc-kv">
        <dt>Escrow Held</dt><dd class="mono tabular">${fmtUsd(c.escrow)}</dd>
        <dt>Praman Computed</dt><dd class="mono tabular">${fmtUsd(c.computed)}</dd>
        <dt>Variance</dt><dd class="mono tabular">${delta === 0 ? "$0.00" : "-" + fmtUsd(delta)}</dd>
        <dt>Current Lane</dt><dd>${esc(c.lane.toUpperCase())}</dd>
      </dl>
      <div style="margin-top:1rem;display:flex;gap:0.6rem;flex-wrap:wrap">
        <a class="btn btn-brand" href="/verify?case=${encodeURIComponent(c.verifyCase)}">Verify Signed Receipt</a>
      </div>`;
    if (window.PramanShell) window.PramanShell.openDialog(dlg);
  }

  function animateDbMove(id, newLane) {
    const c = DB_CASES.find((x) => x.id === id);
    if (!c) return;
    const wrap = $("#db-lanes");
    const card = wrap && wrap.querySelector(`[data-db-case="${id}"]`);
    if (card && c.lane !== newLane) {
      const from = card.getBoundingClientRect();
      c.lane = newLane;
      dbRender();
      const moved = wrap.querySelector(`[data-db-case="${id}"]`);
      const reduced =
        (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
        document.documentElement.dataset.motion === "reduced";
      if (moved && !reduced) {
        const to = moved.getBoundingClientRect();
        const dx = from.left - to.left;
        const dy = from.top - to.top;
        if (dx || dy) {
          moved.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
            { duration: 480, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
          );
        }
      }
    } else {
      c.lane = newLane;
      dbRender();
    }
  }

  const DB_POLICY_PAYLOADS = {
    "PO-ALI-9021": { scenario: "alibaba_reconciled", poCommitment: 100000, spendAmountUsdc: 80000, statedTotal: 80000 },
    "PO-7781": {
      vendorName: "Siemens Aktiengesellschaft",
      vendorJurisdiction: "DE",
      spendAmountUsdc: 12400,
      singleAgentCap: 500,
      dualApprovalCap: 50000,
      supervisorSignature: "0x98021b20Efdb7ae2C57366010a6E0fDE207b4466d3a948192305bad61042781bcf8291048291823ba78192304891283ba192384fca81",
      lineItems: [{ desc: "PO-7781 Conforming Units (1000 x $12.40)", qty: 1000, unitPrice: 12.4, amount: 12400 }],
      statedSubtotal: 12400,
      statedTax: 0,
      statedTotal: 12400
    },
    "CN-LAX-88201": { scenario: "alibaba_trade", poCommitment: 100000, spendAmountUsdc: 100000, statedTotal: 100000 },
    "PO-DEMO-REF": {
      scenario: "alibaba_refund",
      poCommitment: 25000,
      conformingUnits: 0,
      unitPrice: 1000,
      statedTotal: 25000,
      lineItems: [{ desc: "Undelivered PO-DEMO-REF", qty: 25, unitPrice: 1000, amount: 25000 }]
    }
  };

  const dbEvalBtn = $("#db-eval-btn");
  if (dbEvalBtn) {
    dbEvalBtn.addEventListener("click", async () => {
      const id = $("#db-eval-select").value;
      const c = DB_CASES.find((x) => x.id === id);
      const body = DB_POLICY_PAYLOADS[id];
      if (!c || !body) return;
      dbEvalBtn.disabled = true;
      dbEvalBtn.textContent = "Evaluating...";
      try {
        const res = await fetch("/api/trade-assurance/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const out = await res.json();
        let lane = "hold";
        if (out.status === "REFUNDED" || out.verdict === "FULL_REFUND_APPROVED") lane = "refund";
        else if (out.status === "APPROVED" && Number(out.shortfallUsd || 0) > 0) lane = "partial";
        else if (out.status === "APPROVED" || out.verdict === "APPROVED_FOR_PAYMENT" || out.verdict === "CLEAR_FOR_PAYMENT") lane = "release";

        c.computed = Number(out.conformingAmountUsd ?? (out.status === "REFUNDED" ? 0 : out.spendAmountUsdc ?? c.computed));
        c.rule = out.summary || c.rule;
        c.flag = out.flags && out.flags[0] ? String(out.flags[0]).slice(0, 26) : null;
        animateDbMove(id, lane);
        toast(`${id} -> ${lane.toUpperCase()} (${out.verdict || out.status})`);
      } catch (err) {
        toast("Policy API error: " + err.message);
      } finally {
        dbEvalBtn.disabled = false;
        dbEvalBtn.textContent = "Evaluate via Policy API";
      }
    });
  }

  dbRender();

  /* ---------------- Desk 1: Trade Assurance (Reactive Case A..E + 15-Stage Pipeline) ---------------- */
  const STAGES = [
    "Doc Seal", "OFAC SDN", "GLEIF LEI", "PO Parse", "Line Math",
    "FX Check", "Qty Tie-Out", "PierPass", "Accepted", "Shortfall",
    "WASM 651B", "Breaker", "Cap Check", "2-of-2 Quorum", "Escrow Route"
  ];

  const SCENARIO_PREVIEWS = {
    alibaba_trade: { usdc: "100000", contract: "$100,000", accepted: "80 units ($80k)", variance: "-$20,000 Halt", verify: "po-ali-9021-halt" },
    alibaba_reconciled: { usdc: "80000", contract: "$100,000", accepted: "80 units ($80k)", variance: "$20,000 Refunded", verify: "po-ali-9021" },
    alibaba_missing_evidence: { usdc: "100000", contract: "$100,000", accepted: "0 GRN on file", variance: "Hold for GRN", verify: "po-ali-9021-halt" },
    alibaba_conflicting_reports: { usdc: "100000", contract: "$100,000", accepted: "Disputed split", variance: "Multi-Miner Arb", verify: "po-ali-9021-halt" },
    alibaba_refund: { usdc: "0", contract: "$100,000", accepted: "0 conforming", variance: "-$100,000 Refund", verify: "po-ali-9021-halt" }
  };

  const pipeEl = $("#pipe");
  if (pipeEl) {
    pipeEl.innerHTML = STAGES.map((label, i) => `<div class="stage-cell" id="stage-${i}"><span>${String(i + 1).padStart(2, "0")}</span><span>${esc(label)}</span></div>`).join("");
  }

  function updateScenarioPreview() {
    const scen = $("#ta-scenario")?.value || "alibaba_trade";
    const meta = SCENARIO_PREVIEWS[scen] || SCENARIO_PREVIEWS.alibaba_trade;
    if ($("#ta-usdc")) $("#ta-usdc").value = meta.usdc;
    if ($("#ta-verify-case")) $("#ta-verify-case").href = `/verify?case=${encodeURIComponent(meta.verify)}`;
    const tbody = $("#ta-preview-rows");
    if (tbody) {
      tbody.innerHTML = `<tr>
        <th scope="row">${esc($("#ta-scenario option:checked")?.textContent || scen)}</th>
        <td class="mono tabular">${esc(meta.contract)}</td>
        <td class="mono tabular">${esc(meta.accepted)}</td>
        <td class="mono tabular">${esc(meta.variance)}</td>
      </tr>`;
    }
  }
  $("#ta-scenario")?.addEventListener("change", updateScenarioPreview);
  updateScenarioPreview();

  function beginPipelineWait() {
    $$(".stage-cell").forEach((el) => el.classList.remove("is-pass", "is-halted"));
    const prog = $("#pipe-progress");
    if (prog) prog.removeAttribute("value");
    if ($("#pipe-count")) $("#pipe-count").textContent = "AUDITING...";
    if ($("#pipe-left")) $("#pipe-left").textContent = "Running WASM comparator, OFAC + Non-SDN screening & policy gates...";
  }

  function commitPipelineVerdict(d, scenario, ms) {
    const settled = d.status === "APPROVED" || d.status === "REFUNDED";
    const flags = Array.isArray(d.flags) ? d.flags : [];
    let haltIdx = STAGES.length;
    if (!settled) {
      if (scenario === "alibaba_missing_evidence" || flags.some((f) => /MISSING|EVIDENCE|GRN/i.test(f))) haltIdx = 7;
      else if (scenario === "alibaba_conflicting_reports" || flags.some((f) => /CONFLICT|DISPUTE/i.test(f))) haltIdx = 9;
      else haltIdx = 11;
    }
    const passedCount = Math.min(STAGES.length, haltIdx);
    for (let i = 0; i < passedCount; i++) {
      $("#stage-" + i)?.classList.add("is-pass");
    }
    const prog = $("#pipe-progress");
    if (prog) prog.value = passedCount;
    if (haltIdx < STAGES.length) {
      $("#stage-" + haltIdx)?.classList.add("is-halted");
      if ($("#pipe-count")) $("#pipe-count").textContent = `HALT @ STAGE ${haltIdx + 1}`;
      if ($("#pipe-left")) $("#pipe-left").textContent = `Halted at ${STAGES[haltIdx]} (${ms} ms server telemetry)`;
    } else {
      if ($("#pipe-count")) $("#pipe-count").textContent = "15 / 15 PASS";
      if ($("#pipe-left")) $("#pipe-left").textContent = `All 15 stages passed (${ms} ms server telemetry)`;
    }
  }

  function openCertificate(d, payload) {
    const htmlUrl = `/api/audit/case?case=${encodeURIComponent(d.status === "APPROVED" ? "po-ali-9021" : "po-ali-9021-halt")}&format=html`;
    $("#cert-body").innerHTML = `
      <p class="mono" style="font-size:0.76rem;color:var(--ink-muted)">UCC ARTICLE 2 / UN CISG STATUTORY DISPOSITION</p>
      <dl class="doc-kv">
        <dt>Purchase Order</dt><dd>${esc(payload.poNumber)}</dd>
        <dt>Pier-Pass Receipt</dt><dd>${esc(payload.pierPassReceiptId)}</dd>
        <dt>Verdict</dt><dd>${esc(d.status)}: ${esc(d.verdict)}</dd>
        <dt>Settled Amount</dt><dd class="mono tabular">${fmtUsd(d.spendAmountUsdc)}</dd>
        <dt>Network</dt><dd>${esc(d.network)}</dd>
        <dt>Cert Hash</dt><dd class="mono">${esc(d.certHash || "-")}</dd>
        <dt>EAS Schema UID</dt><dd class="mono">${esc(d.easSchemaUid || "-")}</dd>
      </dl>
      <div style="margin-top:1.25rem;display:flex;gap:0.6rem;flex-wrap:wrap">
        <a class="btn btn-primary" href="${esc(htmlUrl)}" target="_blank" rel="noopener">Open Full Certificate</a>
        <a class="btn" href="/verify?case=${d.status === "APPROVED" ? "po-ali-9021" : "po-ali-9021-halt"}">Verify EIP-191 Signature</a>
      </div>`;
    if (window.PramanShell) window.PramanShell.openDialog($("#cert-modal"));
  }

  $("#ta-run")?.addEventListener("click", async () => {
    const rawVal = String($("#ta-usdc").value || "").replace(/[$,\s]/g, "");
    const usdc = Number(rawVal);
    if (!Number.isFinite(usdc)) {
      toast("Disbursement amount must be numeric");
      return;
    }
    const scenario = $("#ta-scenario").value;
    const btn = $("#ta-run");
    btn.disabled = true;
    $("#ta-status").textContent = "POST /api/trade-assurance/audit executing...";
    $("#verdict-panel").hidden = true;
    const payload = {
      poNumber: $("#ta-po").value.trim() || "PO-ALI-9021",
      pierPassReceiptId: $("#ta-rcpt").value.trim() || "CN-LAX-88201",
      scenario,
      disputeResolutionAuthorized: scenario === "alibaba_reconciled",
      reconciledDisbursementUsdc: scenario === "alibaba_reconciled" ? 80000 : usdc
    };
    beginPipelineWait();

    try {
      const t0 = performance.now();
      const res = await fetch("/api/trade-assurance/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      const ms = (performance.now() - t0).toFixed(1);
      commitPipelineVerdict(d, scenario, ms);
      const settled = d.status === "APPROVED" || d.status === "REFUNDED";
      const vb = $("#verdict-body");
      vb.className = "verdict-box " + (settled ? "is-approved" : "is-halt");
      vb.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap">
          <span class="rubber-stamp ${settled ? "is-cleared" : "is-halted"}">${esc(d.status)}</span>
          <strong class="mono">${esc(d.verdict)}</strong>
        </div>
        <p style="margin:0.75rem 0">${esc(d.summary)}</p>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.85rem">
          ${(d.flags || []).map((f) => `<span class="badge ${settled ? "badge-ok" : "badge-halt"}">${esc(f)}</span>`).join("") || '<span class="badge badge-ok">All Compliance Gates Clear</span>'}
        </div>
        <dl class="doc-kv">
          <dt>Circuit Breaker</dt><dd>${esc(d.circuitBreaker?.triggered ? "TRIGGERED: " + d.circuitBreaker.reason : "Not Triggered")}</dd>
          <dt>Spend Amount</dt><dd class="mono tabular">${fmtUsd(d.spendAmountUsdc)}</dd>
          <dt>Latency</dt><dd class="mono tabular">${esc(ms)} ms</dd>
          <dt>Cert Hash</dt><dd class="mono">${esc(d.certHash || "-")}</dd>
        </dl>`;
      $("#verdict-risk").textContent = d.riskLevel || "-";
      $("#verdict-panel").hidden = false;
      const certBtn = $("#ta-cert-btn");
      certBtn.hidden = !d.certHash;
      certBtn.onclick = () => openCertificate(d, payload);
      $("#ta-status").textContent = `Completed in ${ms} ms · ${d.status}`;
    } catch (err) {
      $("#ta-status").textContent = "Audit request failed: " + err.message;
      const prog = $("#pipe-progress");
      if (prog) prog.value = 0;
      if ($("#pipe-count")) $("#pipe-count").textContent = "ERROR";
      if ($("#pipe-left")) $("#pipe-left").textContent = "Server request failed";
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------------- Desk 2: Spend Guard (Solana + General Spend Gate) ---------------- */
  $("#sg-run")?.addEventListener("click", async () => {
    const btn = $("#sg-run");
    const out = $("#sg-out");
    const scenario = $("#sg-scenario").value;
    btn.disabled = true;
    out.innerHTML = `<div class="verdict-box">Evaluating SolanaSpendGuard &amp; 20,022 US Treasury SDN/CMIC RAM...</div>`;
    try {
      const r = await fetch("/api/audit/solana-spend-guard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario })
      });
      const d = await r.json();
      const ok = d.verdict === "APPROVED";
      const flags = [...(d.flags || [])];
      if (d.latencyMs !== undefined) flags.push(`${d.latencyMs} ms`);
      out.innerHTML = `<div class="verdict-box ${ok ? "is-approved" : "is-halt"}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem">
          <span class="rubber-stamp ${ok ? "is-cleared" : "is-halted"}">${esc(d.verdict || (ok ? "APPROVED" : "HALTED"))}</span>
        </div>
        <p style="margin:0.7rem 0">${esc(d.summary || "")}</p>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
          ${flags.map((x) => `<span class="badge ${ok ? "badge-ok" : "badge-halt"}">${esc(x)}</span>`).join("")}
        </div>
      </div>`;
    } catch (e) {
      out.innerHTML = `<div class="verdict-box is-halt">Error: ${esc(e.message)}</div>`;
    } finally {
      btn.disabled = false;
    }
  });

  async function runGeneralSpendGate(vendorOverride) {
    const out = $("#gsg-out");
    const btn = $("#gsg-run");
    if (!out || !btn) return;
    btn.disabled = true;
    out.hidden = false;
    out.textContent = "POST /api/spend-guard/evaluate running...";
    const amount = Number($("#gsg-amount").value || 0);
    const cap = Number($("#gsg-cap").value || 500);
    const payload = {
      vendorName: vendorOverride || $("#gsg-vendor").value.trim() || "Siemens Aktiengesellschaft",
      vendorJurisdiction: $("#gsg-jur").value.trim() || "DE",
      spendAmountUsdc: amount,
      singleAgentCap: cap,
      dualApprovalCap: 50000,
      lineItems: [{ desc: "Operator Spend Gate Verification", qty: 1, unitPrice: amount, amount }],
      statedSubtotal: amount,
      statedTax: 0,
      statedTotal: amount
    };
    try {
      const r = await fetch("/api/spend-guard/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await r.json();
      out.textContent = JSON.stringify(json, null, 2);
    } catch (err) {
      out.textContent = "Request failed: " + err.message;
    } finally {
      btn.disabled = false;
    }
  }

  $("#gsg-run")?.addEventListener("click", () => runGeneralSpendGate());
  $("#gsg-preset-ofac")?.addEventListener("click", () => {
    $("#gsg-vendor").value = "Banco Nacional de Cuba";
    runGeneralSpendGate("Banco Nacional de Cuba");
  });

  /* ---------------- Desk 3: Settlement Ledger (with moveBefore + role=status) ---------------- */
  let LEDGER = [];
  let ledFiltered = [];
  let ledSort = { key: "index", dir: 1 };

  function median(arr) {
    const s = [...arr].sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function formatMiddleHash(h) {
    const s = String(h || "");
    if (s.length <= 16) return esc(s);
    return `<span class="middle-ellipsis"><span>${esc(s.slice(0, 8))}</span>${esc(s.slice(-6))}</span>`;
  }

  function renderLedgerRail() {
    const rail = $("#db-receipt-rail");
    if (!rail) return;
    const rows = LEDGER.slice(0, 6);
    if (!rows.length) {
      rail.innerHTML = `<p style="font-size:0.86rem;color:var(--ink-muted);margin:0">Loading settlements from /api/ledger...</p>`;
      return;
    }
    rail.innerHTML = rows
      .map(
        (t) => `<div style="display:flex;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;padding:0.65rem 0.85rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface-subtle)">
          <strong>${esc(t.minerName || t.title || "Settlement")}</strong>
          <a class="mono" href="${ETHERSCAN}${esc(t.txHash)}" target="_blank" rel="noopener">${formatMiddleHash(t.txHash)}</a>
        </div>`
      )
      .join("");
  }

  function applyLedgerFilters(sortAnnouncement) {
    const q = ($("#lg-q")?.value || "").trim().toLowerCase();
    const intent = $("#lg-intent")?.value || "";
    ledFiltered = LEDGER.filter(
      (c) =>
        (!intent || c.intent === intent) &&
        (!q || [c.title, c.intent, c.minerName, c.txHash, c.receiptHash].join(" ").toLowerCase().includes(q))
    );

    const { key, dir } = ledSort;
    ledFiltered.sort((a, b) => {
      const x = a[key];
      const y = b[key];
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""))) * dir;
    });

    const body = $("#lg-body");
    if (!body) return;
    if (!ledFiltered.length) {
      body.innerHTML = "";
      $("#lg-empty").hidden = false;
      return;
    }
    $("#lg-empty").hidden = true;

    const existingRows = new Map([...body.querySelectorAll("tr[data-idx]")].map((tr) => [tr.dataset.idx, tr]));
    const needRebuild = existingRows.size !== ledFiltered.length || ledFiltered.some((c) => !existingRows.has(String(c.index)));

    if (!needRebuild && typeof body.moveBefore === "function") {
      for (const c of ledFiltered) {
        const row = existingRows.get(String(c.index));
        if (row) body.moveBefore(row, null);
      }
    } else {
      body.innerHTML = ledFiltered
        .map(
          (c) => `<tr data-idx="${esc(c.index)}">
            <td data-label="#" class="mono tabular">${esc(c.index)}</td>
            <th scope="row" data-label="Target">${esc(c.title)}</th>
            <td data-label="Intent"><span class="badge">${esc(String(c.intent || "").replace(/_/g, " ").replace(/ GENERAL$/, ""))}</span></td>
            <td data-label="Miner">${esc(c.minerName)}</td>
            <td data-label="Latency" class="mono tabular">${c.durationMs != null ? `${esc(c.durationMs)} ms` : "-"}</td>
            <td data-label="Cost" class="mono tabular">$${Number(c.costUsd || 0).toFixed(2)}</td>
            <td data-label="Proof"><button type="button" class="btn" data-inspect-tx="${esc(c.index)}" style="min-block-size:1.85rem;padding:0.2rem 0.55rem">${formatMiddleHash(c.txHash)}</button></td>
          </tr>`
        )
        .join("");
    }

    if (sortAnnouncement && $("#lg-sort-status")) {
      $("#lg-sort-status").textContent = sortAnnouncement;
    }
  }

  async function loadLedger() {
    const body = $("#lg-body");
    if (body) body.innerHTML = `<tr><td colspan="7" style="padding:1.5rem;text-align:center">Loading /api/ledger...</td></tr>`;
    try {
      const res = await fetch("/api/ledger");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      LEDGER = Array.isArray(d) ? d : d.calls || [];
      renderLedgerRail();

      if ($("#lg-hero-count")) $("#lg-hero-count").textContent = String(d.totalPaidCalls ?? LEDGER.length);
      if ($("#ledger-tab-count")) $("#ledger-tab-count").textContent = String(d.totalPaidCalls ?? LEDGER.length);
      if ($("#lg-count")) $("#lg-count").textContent = String(LEDGER.length);
      if ($("#lg-miners")) $("#lg-miners").textContent = String(new Set(LEDGER.map((c) => c.minerId)).size);
      const total = Number(d.totalSpentUsd ?? LEDGER.reduce((s, c) => s + Number(c.costUsd || 0), 0));
      if ($("#lg-spent")) $("#lg-spent").textContent = fmtUsd(total);
      const durs = LEDGER.map((c) => c.durationMs).filter((n) => typeof n === "number" && Number.isFinite(n) && n > 0);
      if ($("#lg-latency")) $("#lg-latency").textContent = `${durs.length ? Math.round(median(durs)) : 0} ms`;

      const intents = [...new Set(LEDGER.map((c) => c.intent))].filter(Boolean).sort();
      if ($("#lg-intent")) {
        $("#lg-intent").innerHTML = `<option value="">ALL INTENTS</option>${intents.map((i) => `<option>${esc(i)}</option>`).join("")}`;
      }

      const wrap = $("#lg-escrow-wrap");
      const escrows = Array.isArray(d.escrowResolvers) ? d.escrowResolvers : [];
      const escrow = Array.isArray(d.escrowPurchases) ? d.escrowPurchases : [];
      if (wrap && (escrows.length || escrow.length)) {
        wrap.hidden = false;
        wrap.innerHTML = `<div class="card card-pad">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.85rem;flex-wrap:wrap;gap:0.5rem">
            <h3 id="lg-escrow-caption" style="margin:0;font-size:1.05rem">Sovereign PramanEscrow Settlements &amp; Devnode Signals</h3>
            <span class="badge">${escrows.length} PramanEscrow · ${escrow.length} Devnode Signals</span>
          </div>
          <div class="table-wrapper" tabindex="0" role="region" aria-labelledby="lg-escrow-caption"><table class="data-table stack-mobile">
            <thead><tr><th>Miner / Source</th><th>Case / Intent</th><th>Contract / Receipt</th><th>Block / Amount</th><th>Proof</th></tr></thead>
            <tbody>
              ${escrows
                .map(
                  (r) => `<tr>
                    <th scope="row" data-label="Source" class="mono">${esc(r.contractName || "PramanEscrow")} #${esc(r.dealId ?? 0)}</th>
                    <td data-label="Case">${esc(r.caseName || r.caseId || "PramanEscrow Deal")}</td>
                    <td data-label="Contract" class="mono">${formatMiddleHash(r.contractAddress || "-")}</td>
                    <td data-label="Block" class="mono tabular">Block ${esc(r.blockNumber ?? "-")}</td>
                    <td data-label="Proof"><a class="mono" href="${ETHERSCAN}${esc(r.txHash)}" target="_blank" rel="noopener">${formatMiddleHash(r.txHash)}</a></td>
                  </tr>`
                )
                .join("")}
              ${escrow
                .map(
                  (e) => `<tr>
                    <th scope="row" data-label="Source" class="mono">${esc(e.source || "DEVNODE")} #${esc(e.minerId || "6164")}</th>
                    <td data-label="Intent">${esc(e.intent || "-")}</td>
                    <td data-label="Receipt" class="mono">${formatMiddleHash(e.receiptHash || "-")}</td>
                    <td data-label="Amount" class="mono tabular">${e.amountUsdc != null ? "$" + Number(e.amountUsdc).toFixed(4) : "-"}</td>
                    <td data-label="Signal" class="mono">${formatMiddleHash(e.signalHash || e.txHash || "ESCROW_SIGNAL")}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table></div>
        </div>`;
      }

      applyLedgerFilters();
    } catch (err) {
      if (body) body.innerHTML = "";
      if ($("#lg-empty")) {
        $("#lg-empty").hidden = false;
        $("#lg-empty").textContent = "Ledger unavailable: " + err.message;
      }
    }
  }

  $$("#lg-table th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      ledSort = { key, dir: ledSort.key === key ? -ledSort.dir : 1 };
      applyLedgerFilters(`Sorted settlement ledger by ${th.textContent} (${ledSort.dir === 1 ? "ascending" : "descending"})`);
    });
  });
  $("#lg-q")?.addEventListener("input", () => applyLedgerFilters());
  $("#lg-intent")?.addEventListener("change", () => applyLedgerFilters());
  $("#lg-clear")?.addEventListener("click", () => {
    $("#lg-q").value = "";
    $("#lg-intent").value = "";
    applyLedgerFilters();
  });

  $("#lg-body")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-inspect-tx]");
    if (!btn) return;
    const c = LEDGER.find((x) => String(x.index) === btn.dataset.inspectTx);
    if (!c) return;
    $("#tx-drawer-body").innerHTML = [
      ["Target", esc(c.title)],
      ["Intent", esc(c.intent)],
      ["Miner", esc(`${c.minerName} (#${c.minerId})`)],
      ["Latency", esc(c.durationMs != null ? `${c.durationMs} ms` : "-")],
      ["Cost", fmtUsd(c.costUsd)],
      ["Timestamp", esc(c.timestamp || "-")],
      ["Sepolia Tx", `<a class="mono" href="${ETHERSCAN}${esc(c.txHash)}" target="_blank" rel="noopener">${esc(c.txHash)}</a>`],
      ["Receipt Hash", `<span class="mono">${esc(c.receiptHash || "-")}</span>`],
      ["Signal Hash", `<span class="mono">${esc(c.signalHash || "-")}</span>`]
    ]
      .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
      .join("");
    if (window.PramanShell) window.PramanShell.openDialog($("#tx-drawer"));
  });

  $("#lg-export")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(ledFiltered, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "praman-ledger-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`Exported ${ledFiltered.length} rows`);
  });

  loadLedger();

  /* ---------------- Desk 4: Mining Registry ---------------- */
  async function loadMine(siteNo) {
    const out = $("#mr-out");
    const raw = $("#mr-raw-link");
    if (raw) raw.href = `/api/verify/mine-dossier?siteNo=${encodeURIComponent(siteNo)}`;
    if (!out) return;
    out.innerHTML = `<div class="verdict-box">Querying GSQ archive &amp; EAS seal for site ${esc(siteNo)}...</div>`;
    try {
      const res = await fetch(`/api/verify/mine-dossier?siteNo=${encodeURIComponent(siteNo)}`);
      const d = await res.json();
      const a = d.audit || {};
      const att = d.attestation || {};
      out.innerHTML = `<div class="verdict-box ${d.verified ? "is-approved" : "is-halt"}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap">
          <strong>${esc(d.siteName || `GSQ Site ${siteNo}`)}</strong>
          <span class="rubber-stamp ${d.verified ? "is-cleared" : "is-review"}">${esc(d.verdict || "UNVERIFIED")}</span>
        </div>
        <p style="margin:0.7rem 0">${esc(d.summary || "")}</p>
        <dl class="doc-kv">
          <dt>GSQ Site</dt><dd class="mono">${esc(d.siteNo)} · ${esc(d.tenure || "-")}</dd>
          <dt>Goldfield</dt><dd>${esc(d.goldfield || "-")}</dd>
          <dt>WASM Score</dt><dd class="mono tabular">${Number(a.wasmScoreBps ?? 0).toLocaleString()} bps</dd>
          <dt>Confidence</dt><dd class="mono tabular">${(Number(d.confidence || 0) * 100).toFixed(0)}%</dd>
          <dt>Attestation Seal</dt><dd class="mono">${esc(att.seal || "-")}</dd>
        </dl>
      </div>`;
    } catch (err) {
      out.innerHTML = `<div class="verdict-box is-halt">Error: ${esc(err.message)}</div>`;
    }
  }

  $("#mr-load")?.addEventListener("click", () => loadMine($("#mr-site-input").value.trim() || "494270"));
  $$("[data-mr-preset]").forEach((b) => {
    b.addEventListener("click", () => {
      $("#mr-site-input").value = b.dataset.mrPreset;
      loadMine(b.dataset.mrPreset);
    });
  });

  /* ---------------- Desk 5: Procurement Tools, Track 3 Batch & Client 651B WASM ---------------- */
  async function pvCall(btn, out, path, fetchOpts) {
    btn.disabled = true;
    out.hidden = false;
    out.textContent = "Running live verification...";
    try {
      const res = await fetch(path, fetchOpts);
      const json = await res.json();
      out.textContent = JSON.stringify(json, null, 2);
    } catch (err) {
      out.textContent = "Request failed: " + err.message;
    } finally {
      btn.disabled = false;
    }
  }
  const q = (s) => encodeURIComponent(s.trim());

  $("#pv-po-btn")?.addEventListener("click", (e) => {
    const n = $("#pv-po").value.trim();
    if (!n) return toast("Enter a PO number");
    const claim = $("#pv-po-q").value.trim();
    pvCall(e.currentTarget, $("#pv-po-out"), `/api/miner/po-verify?po_number=${q(n)}${claim ? `&question=${q(claim)}` : ""}`);
  });
  $("#pv-inv-btn")?.addEventListener("click", (e) => {
    const inv = $("#pv-inv").value.trim();
    const led = $("#pv-led").value.trim();
    if (!inv || !led) return toast("Enter invoice and ledger text");
    pvCall(e.currentTarget, $("#pv-inv-out"), `/api/miner/invoice-reconcile?invoice=${q(inv)}&ledger=${q(led)}`);
  });
  $("#pv-co-btn")?.addEventListener("click", (e) => {
    const co = $("#pv-co").value.trim();
    if (!co) return toast("Enter a company name");
    const jur = $("#pv-jur").value.trim();
    pvCall(e.currentTarget, $("#pv-co-out"), `/api/miner/corporate-registry?company=${q(co)}${jur ? `&jurisdiction=${q(jur)}` : ""}`);
  });
  $("#pv-ven-btn")?.addEventListener("click", async (e) => {
    const v = $("#pv-ven").value.trim();
    if (!v) return toast("Enter a vendor name");
    const btn = e.currentTarget;
    const out = $("#pv-ven-out");
    btn.disabled = true;
    out.hidden = false;
    out.textContent = "Running vendor + doc verification...";
    try {
      const [ven, doc] = await Promise.all([
        fetch(`/api/miner/vendor-verify?vendor=${q(v)}`).then((r) => r.json()),
        fetch(`/api/miner/doc-authenticity?prompt=${q("Verify invoice and certificate authenticity for " + v)}`).then((r) => r.json())
      ]);
      out.textContent = JSON.stringify({ vendor: ven, document: doc }, null, 2);
    } catch (err) {
      out.textContent = "Request failed: " + err.message;
    } finally {
      btn.disabled = false;
    }
  });
  $("#pv-sdn-btn")?.addEventListener("click", (e) => {
    const n = $("#pv-sdn").value.trim();
    if (!n) return toast("Enter a counterparty name");
    pvCall(e.currentTarget, $("#pv-sdn-out"), `/api/miner/sanctions-screen?name=${q(n)}`);
  });
  $("#pv-agent-btn")?.addEventListener("click", (e) => {
    const output = $("#pv-agent-output").value.trim();
    const vendor = $("#pv-agent-vendor").value.trim();
    if (!output) return toast("Enter an agent claim");
    pvCall(e.currentTarget, $("#pv-agent-out"), "/api/agent/verify-output", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ output, vendor: vendor || undefined })
    });
  });

  $("#sb-run")?.addEventListener("click", (e) => {
    const lines = ($("#sb-input").value || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50);
    if (!lines.length) return toast("Enter at least 1 counterparty line");
    pvCall(e.currentTarget, $("#sb-out"), "/api/evaluator/sanctions-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch: lines })
    });
  });

  let wasmExports = null;
  $("#wasm-run")?.addEventListener("click", async () => {
    const out = $("#wasm-out");
    out.hidden = false;
    try {
      const t0 = performance.now();
      if (!wasmExports) {
        const res = await fetch("/comparator/comparator.wasm");
        const bytes = await res.arrayBuffer();
        const mod = await WebAssembly.instantiate(bytes, {});
        wasmExports = mod.instance.exports;
      }
      const ptr = wasmExports.imw_alloc(16);
      const mem = wasmExports.memory.buffer;
      const view = new DataView(mem);
      const mode = Number($("#wasm-mode").value || 0);
      const tol = BigInt($("#wasm-tol").value || "0");
      const truth = BigInt($("#wasm-truth").value || "0");
      const miner = BigInt($("#wasm-miner").value || "0");

      view.setInt32(ptr, mode, true);
      view.setBigInt64(ptr + 8, tol, true);
      const scoreBps = Number(wasmExports.imw_score_deterministic(truth, miner, ptr));
      const dt = (performance.now() - t0).toFixed(3);
      out.textContent = JSON.stringify(
        {
          binary: "/comparator/comparator.wasm (651 bytes)",
          mode: mode === 0 ? "Exact" : mode === 1 ? "AbsTol" : "RelTol",
          truth: truth.toString(),
          miner: miner.toString(),
          tolerance: tol.toString(),
          scoreBps,
          verdict: scoreBps === 10000 ? "PASS_10000_BPS" : scoreBps > 0 ? "PARTIAL_TOLERANCE" : "CIRCUIT_BREAKER_HALT",
          clientLatencyMs: Number(dt)
        },
        null,
        2
      );
    } catch (err) {
      out.textContent = "WASM execution failed: " + err.message;
    }
  });

  $("#cqa-btn")?.addEventListener("click", (e) => {
    const mode = $("#cqa-mode")?.value || "clean";
    const advertiser = $("#cqa-adv")?.value.trim() || "Siemens Aktiengesellschaft";
    const payload = mode === "risky"
      ? {
          advertiserName: advertiser,
          landingUrl: "https://unisvvap.org/airdrop-claim",
          claimText: "Guaranteed 400% yield return — unverified promotional offer",
          statedTotalUsd: 12000,
          computedTotalUsd: 10000
        }
      : {
          advertiserName: advertiser,
          landingUrl: "https://siemens.com/enterprise",
          claimText: "#ad Sponsored B2B hardware campaign — terms apply",
          statedTotalUsd: 10000,
          computedTotalUsd: 10000
        };
    pvCall(e.currentTarget, $("#cqa-out"), "/api/creative-qa/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  });

  $("#arb-btn")?.addEventListener("click", (e) => {
    const topic = $("#arb-topic")?.value.trim() || "Mount Morgan Mine historical gold production";
    pvCall(e.currentTarget, $("#arb-out"), "/api/miner/arbitrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: topic })
    });
  });

  $("#mkt-btn")?.addEventListener("click", (e) => {
    const route = $("#mkt-intent")?.value || "/api/miner/crypto-price";
    const queryText = $("#mkt-query")?.value.trim() || "What is Bitcoin worth?";
    pvCall(e.currentTarget, $("#mkt-out"), `${route}?query=${q(queryText)}`);
  });

  $("#biz-btn")?.addEventListener("click", (e) => {
    pvCall(e.currentTarget, $("#biz-out"), "/api/business");
  });
})();
