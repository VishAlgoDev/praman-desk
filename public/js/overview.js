import { vault, padlock, riffle, branches } from "/vendor/hairline/index.js";

const CODE_SNIPPETS = {
  curl: `curl -X POST https://praman-desk.vercel.app/api/trade-assurance/audit \\
  -H "Content-Type: application/json" \\
  -d '{
    "scenario": "alibaba_reconciled",
    "poNumber": "PO-ALI-9021",
    "pierPassReceiptId": "CN-LAX-88201",
    "disputeResolutionAuthorized": true,
    "reconciledDisbursementUsdc": 80000
  }'`,
  solana: `import { SolanaSpendGuard } from "praman-sdk/solana";

const guard = new SolanaSpendGuard({
  maxSingleSpendUsdc: 500,
  sessionSpendCapUsdc: 1500,
  requireResolvedLookupTables: true,
  blockToken2022Extensions: ["PermanentDelegate", "TransferHook", "FreezeAuthority"]
});

await guard.verifyBeforeSign(transaction, { rpcConnection });`,
  python: `from packages.praman_sdk.praman import PramanClient

client = PramanClient("https://praman-desk.vercel.app")
verdict = client.audit_trade_assurance(
    scenario="alibaba_reconciled",
    po_number="PO-ALI-9021",
    pier_pass_receipt="CN-LAX-88201",
    reconciled_usdc=80000,
)
print(verdict["status"], verdict["certHash"])`,
  mcp: `{
  "mcpServers": {
    "praman-desk": {
      "url": "https://praman-desk.vercel.app/api/mcp"
    }
  }
}`
};

const hairlineInstances = [];

function getHairlineOpts() {
  const reduced =
    (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    document.documentElement.dataset.motion === "reduced";
  const theme = window.PramanShell ? window.PramanShell.getTheme() : "light";
  return {
    theme: theme === "dark" ? "dark" : "light",
    intensity: 0.75,
    play: !reduced
  };
}

function renderHairlineIllustrations() {
  const opts = getHairlineOpts();
  if (hairlineInstances.length) {
    for (const fig of hairlineInstances) {
      try {
        if (fig && typeof fig.update === "function") fig.update(opts);
      } catch (_) {}
    }
    return;
  }

  const pairs = [
    ["hl-vault", vault, "Escrow clearance vault"],
    ["hl-padlock", padlock, "Pre-signature spend lock"],
    ["hl-riffle", riffle, "Statutory receipt verification"],
    ["hl-branches", branches, "Multi-miner consensus quorum"]
  ];

  for (const [id, figureFn, label] of pairs) {
    const el = document.getElementById(id);
    if (!el || typeof figureFn !== "function") continue;
    try {
      const fig = figureFn(el, { ...opts, label });
      if (fig) hairlineInstances.push(fig);
    } catch (_) {}
  }
}

async function loadHeroMemo(caseId) {
  const tabs = document.querySelectorAll("[data-hero-case]");
  tabs.forEach((t) => t.setAttribute("aria-pressed", t.dataset.heroCase === caseId ? "true" : "false"));

  const stamp = document.getElementById("hm-stamp");
  const ref = document.getElementById("hm-ref");
  const amt = document.getElementById("hm-amount");
  const rule = document.getElementById("hm-rule");
  const net = document.getElementById("hm-net");
  const sig = document.getElementById("hm-sig");
  const vLink = document.getElementById("hm-verify-link");
  const cLink = document.getElementById("hm-cert-link");

  if (sig) sig.textContent = "Loading cryptographic EIP-191 memo from /api/audit/case...";
  try {
    const res = await fetch(`/api/audit/case?case=${encodeURIComponent(caseId)}&format=json`);
    const data = await res.json();
    const memo = data.memoVerification || {};

    const verdict = String(data.clearanceVerdict || data.verdict || "CLEARED").toUpperCase();
    const isHalt = verdict.includes("HALT") || verdict.includes("BLOCK") || verdict.includes("REJECT");
    const isReview = verdict.includes("HOLD") || verdict.includes("REVIEW") || verdict.includes("DIVERGENCE");
    if (stamp) {
      stamp.textContent = isHalt ? "HALTED" : isReview ? "REVIEW" : "CLEARED";
      stamp.className = "rubber-stamp " + (isHalt ? "is-halted" : isReview ? "is-review" : "is-cleared");
    }
    if (ref) ref.textContent = data.poNumber || data.caseId || caseId;
    if (amt) {
      if (data.releasedAmountUsdc !== undefined) {
        amt.textContent = `$${Number(data.releasedAmountUsdc).toLocaleString("en-US", { minimumFractionDigits: 2 })} released / $${Number(data.refundedAmountUsdc || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} refunded`;
      } else {
        const val = Number(data.poAmount ?? data.invoiceAmount ?? 0);
        const unit = data.chain === "solana-devnet" && val < 5 ? "SOL" : "USDC";
        amt.textContent = unit === "SOL" ? `${val} SOL` : `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
      }
    }
    if (rule) rule.textContent = data.title || data.clearanceSummary || verdict;
    if (net) net.textContent = data.chain === "solana-devnet" ? "Solana Devnet / Pre-Sign" : "Ethereum Sepolia (TakarSettle)";
    if (sig) {
      sig.textContent = memo.signature
        ? `SHA-256: ${memo.sha256 || "n/a"}\nSigner: ${memo.signerAddress || "n/a"}\nEIP-191: ${String(memo.signature).slice(0, 44)}...`
        : "Signature pending / unavailable for this record.";
    }
    if (vLink) vLink.href = `/verify?case=${encodeURIComponent(caseId)}`;
    if (cLink) cLink.href = `/api/audit/case?case=${encodeURIComponent(caseId)}&format=html`;
  } catch (err) {
    if (sig) sig.textContent = `Could not reach /api/audit/case: ${err.message}`;
  }
}

function initForceField() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const isReduced = () =>
    (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    document.documentElement.dataset.motion === "reduced";

  let width = 0;
  let height = 0;
  const particles = [];
  const COUNT = 84;
  const mouse = { x: -9999, y: -9999, active: false };

  function initParticles() {
    particles.length = 0;
    const cols = Math.max(4, Math.floor(Math.sqrt(COUNT * (width / Math.max(1, height)))));
    const rows = Math.max(3, Math.ceil(COUNT / cols));
    const xStep = width / (cols + 1);
    const yStep = height / (rows + 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hx = (c + 1) * xStep;
        const hy = (r + 1) * yStep;
        particles.push({
          x: hx,
          y: hy,
          homeX: hx,
          homeY: hy,
          vx: 0,
          vy: 0,
          r: 1.5,
          color: (r + c) % 3 === 0 ? "#4ade80" : "#60a5fa"
        });
      }
    }
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = Math.max(1, rect.width);
    height = canvas.height = Math.max(1, rect.height);
    initParticles();
    if (isReduced()) drawFrame();
  }

  const band = canvas.parentElement;
  band.addEventListener("mousemove", (e) => {
    const rect = band.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  band.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!isReduced()) {
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140 && dist > 0) {
            const f = (1 - dist / 140) * 11;
            p.vx += (dx / dist) * f;
            p.vy += (dy / dist) * f;
          }
        }
        p.vx = (p.vx + (p.homeX - p.x) * 0.045) * 0.9;
        p.vy = (p.vy + (p.homeY - p.y) * 0.045) * 0.9;
        p.x += p.vx;
        p.y += p.vy;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    if (!isReduced()) requestAnimationFrame(drawFrame);
  }

  window.addEventListener("resize", resize);
  resize();
  if (!isReduced()) requestAnimationFrame(drawFrame);
}

function initQuickstartTabs() {
  const pre = document.getElementById("quickstart-code");
  const copyBtn = document.getElementById("copy-quickstart-btn");
  const btns = document.querySelectorAll("[data-code-tab]");
  let activeKey = "curl";

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeKey = btn.dataset.codeTab;
      btns.forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      if (pre && CODE_SNIPPETS[activeKey]) pre.textContent = CODE_SNIPPETS[activeKey];
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      if (window.PramanShell) window.PramanShell.copyText(CODE_SNIPPETS[activeKey] || "", copyBtn);
    });
  }
}

function initTelemetryScrollTrigger() {
  const section = document.getElementById("blueprint");
  const frame = document.getElementById("pencil-iframe");
  if (!section || !frame) return;

  let wasVisible = false;
  let lastPlayAt = 0;

  const isReducedMotion = () =>
    (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    document.documentElement.dataset.motion === "reduced";

  const sendToFrame = (payload) => {
    try {
      if (frame.contentWindow) {
        frame.contentWindow.postMessage(payload, location.origin);
        return true;
      }
    } catch (_) {}
    return false;
  };

  const syncIfInView = (forcePlay) => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 900;
    const inViewNow = rect.bottom > 60 && rect.top < vh - 60;
    if (inViewNow) {
      wasVisible = true;
      const now = Date.now();
      if (forcePlay || now - lastPlayAt >= 300) {
        if (sendToFrame({ type: "praman-play" })) lastPlayAt = now;
      }
    } else if (!isReducedMotion()) {
      wasVisible = false;
      sendToFrame({ type: "praman-reset" });
    }
  };

  window.addEventListener("message", (ev) => {
    if (ev.origin !== location.origin || !ev.data || typeof ev.data !== "object") return;
    if (ev.data.type === "praman-pencil-ready") {
      syncIfInView(true);
    }
  });

  frame.addEventListener("load", () => {
    syncIfInView(true);
  });

  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.14) {
            if (!wasVisible) {
              wasVisible = true;
              const now = Date.now();
              if (now - lastPlayAt >= 300 && sendToFrame({ type: "praman-play" })) {
                lastPlayAt = now;
              }
            }
          } else if (!entry.isIntersecting || entry.intersectionRatio === 0) {
            if (wasVisible && !entry.isIntersecting) {
              wasVisible = false;
              if (!isReducedMotion()) {
                sendToFrame({ type: "praman-reset" });
              }
            }
          }
        }
      },
      { threshold: [0, 0.14] }
    );
    observer.observe(section);
  } else {
    syncIfInView(true);
  }

  // Handle already-loaded eager iframe when script executes after load
  if (frame.contentDocument && frame.contentDocument.readyState === "complete") {
    syncIfInView(true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderHairlineIllustrations();
  loadHeroMemo("po-ali-9021");
  initForceField();
  initQuickstartTabs();
  initTelemetryScrollTrigger();

  document.querySelectorAll("[data-hero-case]").forEach((btn) => {
    btn.addEventListener("click", () => loadHeroMemo(btn.dataset.heroCase));
  });

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      requestAnimationFrame(renderHairlineIllustrations);
    });
  }
  const motionBtn = document.getElementById("motion-toggle");
  if (motionBtn) {
    motionBtn.addEventListener("click", () => {
      requestAnimationFrame(renderHairlineIllustrations);
    });
  }
});
