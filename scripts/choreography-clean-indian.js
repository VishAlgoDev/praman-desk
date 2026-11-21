// Synchronized live choreography for Praman Desk Walkthrough (Prabhat Indian Founder Narration)
// Total runtime: 314s

(function runWalkthroughChoreography() {
  console.log("Starting Praman Desk 314s Live Walkthrough Choreography...");

  function smoothScrollTo(y, durationMs = 1200) {
    const startY = window.scrollY;
    const diff = y - startY;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      window.scrollTo(0, startY + diff * ease);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const events = [
    // Act 1: Thesis (0s - 49s)
    { t: 6000, action: () => smoothScrollTo(120, 1500) },
    { t: 28000, action: () => smoothScrollTo(280, 1500) },

    // Act 2: Architecture & WASM Math (50s - 104s)
    { t: 52000, action: () => {
        const playground = document.querySelector('.playground-grid');
        if (playground) playground.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    { t: 72000, action: () => {
        const btnWasm = document.getElementById('btn-wasm-verify');
        if (btnWasm) btnWasm.click();
      }
    },

    // Act 3: Threat Simulator (105s - 179s)
    // Scenario 1: OFAC Sanctions / Lazarus
    { t: 106000, action: () => {
        const s1 = document.getElementById('card-scen-1');
        if (s1) s1.click();
        const playground = document.querySelector('.playground-grid');
        if (playground) playground.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    { t: 114000, action: () => {
        const runBtn = document.getElementById('btn-run-inspect');
        if (runBtn) runBtn.click();
      }
    },
    // Scenario 2: Arithmetic Overcharge ($450 vs $350)
    { t: 130000, action: () => {
        const s2 = document.getElementById('card-scen-2');
        if (s2) s2.click();
      }
    },
    { t: 137000, action: () => {
        const runBtn = document.getElementById('btn-run-inspect');
        if (runBtn) runBtn.click();
      }
    },
    // Scenario 5: Treasury Delegation Cap & Multisig Halt
    { t: 154000, action: () => {
        const s5 = document.getElementById('card-scen-5');
        if (s5) s5.click();
      }
    },
    { t: 162000, action: () => {
        const runBtn = document.getElementById('btn-run-inspect');
        if (runBtn) runBtn.click();
      }
    },

    // Act 4: Two-Mind Collaboration (180s - 230s)
    // Scenario 7: Dual-Agent FX Rate Audit
    { t: 182000, action: () => {
        const s7 = document.getElementById('card-scen-7');
        if (s7) s7.click();
      }
    },
    { t: 190000, action: () => {
        const runBtn = document.getElementById('btn-run-inspect');
        if (runBtn) runBtn.click();
      }
    },
    // Scenario 3: Verified Autonomous API Payout (Anthropic tokens)
    { t: 210000, action: () => {
        const s3 = document.getElementById('card-scen-3');
        if (s3) s3.click();
      }
    },
    { t: 218000, action: () => {
        const runBtn = document.getElementById('btn-run-inspect');
        if (runBtn) runBtn.click();
      }
    },

    // Act 5: Reciprocal Bridges & Developer SDKs (231s - 277s)
    { t: 232000, action: () => {
        if (typeof switchMainTab === 'function') switchMainTab('developer');
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }
    },
    { t: 242000, action: () => {
        window.scrollBy({ top: 400, behavior: 'smooth' });
      }
    },
    { t: 254000, action: () => {
        if (typeof switchMainTab === 'function') switchMainTab('network');
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    },
    { t: 258000, action: () => {
        if (typeof testFakeWatchBridge === 'function') testFakeWatchBridge('https://unisvvap.org', 'UNISWAP');
      }
    },
    { t: 264000, action: () => {
        if (typeof testRugReceiptBridge === 'function') testRugReceiptBridge('0x098B716B8Aaf21512996dC57EB0615e2383E2f96');
      }
    },
    { t: 270000, action: () => {
        if (typeof testPaysheetBridge === 'function') testPaysheetBridge('0x098B716B8Aaf21512996dC57EB0615e2383E2f96');
      }
    },

    // Act 6: On-Chain Ledger & Benchmark (278s - 314s)
    { t: 279000, action: () => {
        const ledgerDetails = document.getElementById('ledger-accordion');
        if (ledgerDetails && !ledgerDetails.open) ledgerDetails.open = true;
        ledgerDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    { t: 288000, action: () => {
        const tbody = document.querySelector('#ledger-accordion .accordion-content > div');
        if (tbody) tbody.scrollBy({ top: 250, behavior: 'smooth' });
      }
    },
    { t: 302000, action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  ];

  events.forEach(({ t, action }) => {
    setTimeout(() => {
      try {
        action();
      } catch (err) {
        console.warn('Choreography event error at ' + t + 'ms:', err);
      }
    }, t);
  });

  return 'Choreography scheduled with ' + events.length + ' milestones across 314 seconds.';
})();
