/* Praman Shared Application Shell: Theme, Overflow Nav, Command Palette, Top-Layer Transitions */
(function () {
  const THEME_KEY = "praman-theme";
  const MOTION_KEY = "praman-motion";

  const CMD_ITEMS = [
    { label: "Company Overview", meta: "/", href: "/" },
    { label: "Operator Desks (5 Workflows)", meta: "/desks", href: "/desks" },
    { label: "Trade Assurance Escrow Desk", meta: "/desks#trade-assurance", href: "/desks#trade-assurance" },
    { label: "Autonomous Spend Guard (Solana + EVM)", meta: "/desks#spend-guard", href: "/desks#spend-guard" },
    { label: "Settlement Ledger (32 On-Chain Tx)", meta: "/desks#settlement-ledger", href: "/desks#settlement-ledger" },
    { label: "Forensic Mining Registry (GSQ 494270)", meta: "/desks#mining-registry", href: "/desks#mining-registry" },
    { label: "Two-Mind FX, Tencent #01/#03 & 651B WASM", meta: "/desks#verification-labs", href: "/desks#verification-labs" },
    { label: "Verify Receipt & EIP-191 Memos", meta: "/verify", href: "/verify" },
    { label: "Receipt: Alibaba PO-ALI-9021 ($80k/$20k)", meta: "/verify?case=po-ali-9021", href: "/verify?case=po-ali-9021" },
    { label: "Receipt: PO-ALI-9021 Halted Claim", meta: "/verify?case=po-ali-9021-halt", href: "/verify?case=po-ali-9021-halt" },
    { label: "Receipt: Takar Case 1 & Case 2 (Sepolia)", meta: "/verify?case=takar-case-2", href: "/verify?case=takar-case-2" },
    { label: "Receipt: Solana Token-2022 Halt", meta: "/verify?case=solana-token2022-halt", href: "/verify?case=solana-token2022-halt" },
    { label: "Receipt: Two-Mind FX Divergence", meta: "/verify?case=minds-fx-divergence", href: "/verify?case=minds-fx-divergence" },
    { label: "Receipt: Tencent #01 Hallucination Halt", meta: "/verify?case=tencent-01-halt", href: "/verify?case=tencent-01-halt" },
    { label: "Documentation & 19-Tool MCP Reference", meta: "/docs", href: "/docs" },
    { label: "Product Roadmap & Enterprise Pilot", meta: "/roadmap", href: "/roadmap" }
  ];

  function getResolvedTheme() {
    const meta = document.querySelector('meta[name="color-scheme"]');
    const content = meta ? meta.getAttribute("content") : "light";
    if (content === "dark") return "dark";
    return "light";
  }

  function syncThemeIframes(theme) {
    document.querySelectorAll("iframe[data-theme-sync]").forEach((frame) => {
      try {
        const u = new URL(frame.getAttribute("src") || frame.src, location.origin);
        if (u.origin !== location.origin) return;
        u.searchParams.set("theme", theme);
        const nextSrc = u.pathname + u.search + u.hash;
        if (frame.contentDocument && frame.contentDocument.documentElement) {
          frame.contentDocument.documentElement.dataset.theme = theme;
          const childMeta = frame.contentDocument.querySelector('meta[name="color-scheme"]');
          if (childMeta) childMeta.setAttribute("content", theme);
        }
        if (frame.contentWindow) {
          frame.contentWindow.postMessage({ type: "praman-theme", theme }, location.origin);
        }
        if (!frame.dataset.themeLoadHook) {
          frame.dataset.themeLoadHook = "1";
          frame.addEventListener("load", () => {
            const current = getResolvedTheme();
            try {
              if (frame.contentDocument && frame.contentDocument.documentElement) {
                frame.contentDocument.documentElement.dataset.theme = current;
                const childMeta = frame.contentDocument.querySelector('meta[name="color-scheme"]');
                if (childMeta) childMeta.setAttribute("content", current);
              }
              if (frame.contentWindow) {
                frame.contentWindow.postMessage({ type: "praman-theme", theme: current }, location.origin);
                frame.contentWindow.postMessage(
                  { type: "praman-motion", reduced: document.documentElement.dataset.motion === "reduced" },
                  location.origin
                );
              }
            } catch (_) {}
          });
        }
        if (frame.getAttribute("data-theme-src-synced") !== theme) {
          frame.setAttribute("data-theme-src-synced", theme);
          // For archify frames that do not listen to postMessage, update query on reload if theme changed via toggle
          if (frame.dataset.reloadOnTheme === "true" && frame.getAttribute("src") !== nextSrc) {
            frame.setAttribute("src", nextSrc);
          }
        }
      } catch (_) {}
    });
  }

  function applyTheme(choice, persist) {
    const meta = document.querySelector('meta[name="color-scheme"]');
    const valid = choice === "dark" || choice === "light" ? choice : null;
    if (persist) {
      try {
        if (valid) localStorage.setItem(THEME_KEY, valid);
        else localStorage.removeItem(THEME_KEY);
      } catch (_) {}
    }
    if (meta) {
      meta.setAttribute("content", valid || "light");
    }
    const resolved = getResolvedTheme();
    document.documentElement.dataset.theme = resolved;
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", resolved === "dark" ? "true" : "false");
      const label = resolved === "dark" ? "Switch to light mode" : "Switch to dark mode";
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    }
    syncThemeIframes(resolved);
  }

  function canTransitionDisplay() {
    return typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("transition-behavior", "allow-discrete");
  }

  function openDialog(dialogEl) {
    if (!dialogEl || dialogEl.open) return;
    dialogEl.removeAttribute("data-closing");
    dialogEl.showModal();
  }

  function closeTopLayer(dialogEl) {
    if (!dialogEl || !dialogEl.open) return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (canTransitionDisplay() || reduced || document.documentElement.dataset.motion === "reduced") {
      dialogEl.close();
      return;
    }
    dialogEl.setAttribute("data-closing", "true");
    setTimeout(() => {
      dialogEl.removeAttribute("data-closing");
      if (dialogEl.open) dialogEl.close();
    }, 180);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function copyText(text, triggerBtn) {
    try {
      await navigator.clipboard.writeText(text);
      if (triggerBtn) {
        const orig = triggerBtn.dataset.origLabel || triggerBtn.textContent;
        triggerBtn.dataset.origLabel = orig;
        triggerBtn.textContent = "Copied";
        setTimeout(() => {
          triggerBtn.textContent = orig;
        }, 1400);
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function setupNavbarOverflow() {
    const header = document.querySelector(".site-header");
    const nav = document.querySelector(".site-nav");
    const list = document.querySelector("#nav-links-list");
    const drawer = document.querySelector("#nav-drawer");
    const menuBtn = document.querySelector("#nav-menu-btn");
    if (!header || !nav || !list || !drawer || !menuBtn) return;

    const evaluate = () => {
      header.classList.add("is-wide");
      drawer.removeAttribute("popover");
      const fits = list.scrollWidth <= nav.clientWidth + 2;
      if (fits) {
        header.classList.add("is-wide");
        drawer.removeAttribute("popover");
        menuBtn.setAttribute("aria-expanded", "false");
      } else {
        header.classList.remove("is-wide");
        drawer.setAttribute("popover", "auto");
      }
    };

    const ro = new ResizeObserver(evaluate);
    ro.observe(header);
    ro.observe(nav);
    window.addEventListener("load", evaluate);
    drawer.addEventListener("toggle", (e) => {
      menuBtn.setAttribute("aria-expanded", e.newState === "open" ? "true" : "false");
    });
    evaluate();
  }

  function setupCommandPalette() {
    const dlg = document.getElementById("cmd-palette");
    if (!dlg) return;
    const input = document.getElementById("cmd-search-input");
    const list = document.getElementById("cmd-results-list");
    let selectedIndex = 0;

    function render(query) {
      const q = (query || "").trim().toLowerCase();
      const matches = CMD_ITEMS.filter((it) => !q || it.label.toLowerCase().includes(q) || it.meta.toLowerCase().includes(q));
      selectedIndex = 0;
      list.innerHTML = matches.length
        ? matches
            .map(
              (m, i) => `<li><a class="cmd-item" href="${escapeHtml(m.href)}" aria-selected="${i === 0 ? "true" : "false"}"><span>${escapeHtml(m.label)}</span><span class="kbd-pill">${escapeHtml(m.meta)}</span></a></li>`
            )
            .join("")
        : `<li class="cmd-item"><span>No matching route or receipt</span></li>`;
    }

    document.querySelectorAll("[data-open-cmd]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openDialog(dlg);
        render("");
        requestAnimationFrame(() => input && input.focus());
      });
    });

    if (input) {
      input.addEventListener("input", () => render(input.value));
      input.addEventListener("keydown", (e) => {
        const links = Array.from(list.querySelectorAll("a.cmd-item"));
        if (!links.length) return;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % links.length;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          selectedIndex = (selectedIndex - 1 + links.length) % links.length;
        } else if (e.key === "Enter") {
          e.preventDefault();
          links[selectedIndex]?.click();
          closeTopLayer(dlg);
          return;
        }
        links.forEach((a, idx) => a.setAttribute("aria-selected", idx === selectedIndex ? "true" : "false"));
        links[selectedIndex]?.scrollIntoView({ block: "nearest" });
      });
    }

    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) closeTopLayer(dlg);
    });

    document.addEventListener("keydown", (e) => {
      const tag = document.activeElement ? document.activeElement.tagName : "";
      const editable = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (document.activeElement && document.activeElement.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dlg.open) closeTopLayer(dlg);
        else {
          openDialog(dlg);
          render("");
          requestAnimationFrame(() => input && input.focus());
        }
      } else if (e.key === "/" && !editable && !dlg.open) {
        e.preventDefault();
        openDialog(dlg);
        render("");
        requestAnimationFrame(() => input && input.focus());
      }
    });
  }

  function setupScrollProgressFallback() {
    if (typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("animation-timeline", "scroll()")) {
      return;
    }
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      document.documentElement.style.setProperty("--scroll-progress", p.toFixed(4));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function setupMotionToggle() {
    const btn = document.getElementById("motion-toggle");
    const saved = (() => {
      try {
        return localStorage.getItem(MOTION_KEY);
      } catch (_) {
        return null;
      }
    })();
    if (saved === "reduced") {
      document.documentElement.dataset.motion = "reduced";
    }
    if (btn) {
      const syncBtn = () => {
        const reduced = document.documentElement.dataset.motion === "reduced";
        btn.setAttribute("aria-pressed", reduced ? "true" : "false");
        btn.setAttribute("aria-label", reduced ? "Enable animations" : "Reduce page animations");
        btn.textContent = reduced ? "Animations: Reduced" : "Animations: Auto";
      };
      syncBtn();
      btn.addEventListener("click", () => {
        const next = document.documentElement.dataset.motion === "reduced" ? "normal" : "reduced";
        if (next === "reduced") document.documentElement.dataset.motion = "reduced";
        else delete document.documentElement.dataset.motion;
        try {
          localStorage.setItem(MOTION_KEY, next);
        } catch (_) {}
        syncBtn();
        document.querySelectorAll("iframe[data-theme-sync]").forEach((frame) => {
          try {
            if (frame.contentWindow) {
              frame.contentWindow.postMessage({ type: "praman-motion", reduced: next === "reduced" }, location.origin);
            }
          } catch (_) {}
        });
      });
    }
  }

  function setupToggletips() {
    document.querySelectorAll("[popovertarget][data-toggletip]").forEach((btn) => {
      const targetId = btn.getAttribute("popovertarget");
      const pop = targetId ? document.getElementById(targetId) : null;
      if (!pop) return;
      pop.addEventListener("toggle", (e) => {
        btn.setAttribute("aria-expanded", e.newState === "open" ? "true" : "false");
      });
    });
  }

  function init() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      applyTheme(stored, false);
    } catch (_) {
      applyTheme(null, false);
    }

    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const next = getResolvedTheme() === "dark" ? "light" : "dark";
        applyTheme(next, true);
      });
    }

    window.addEventListener("storage", (e) => {
      if (e.key === THEME_KEY) {
        applyTheme(e.newValue, false);
      }
    });

    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", () => {
        // Respect explicit user choice if saved; only update when unset
        let stored = null;
        try {
          stored = localStorage.getItem(THEME_KEY);
        } catch (_) {}
        if (!stored) applyTheme(null, false);
      });
    }

    document.querySelectorAll("dialog [data-close-dialog]").forEach((btn) => {
      btn.addEventListener("click", () => closeTopLayer(btn.closest("dialog")));
    });

    setupNavbarOverflow();
    setupCommandPalette();
    setupScrollProgressFallback();
    setupMotionToggle();
    setupToggletips();
  }

  window.PramanShell = {
    getTheme: getResolvedTheme,
    setTheme: (t) => applyTheme(t, true),
    openDialog,
    closeTopLayer,
    canTransitionDisplay,
    escapeHtml,
    copyText
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
