(() => {
  "use strict";

  const VISIT_URL = "/.netlify/functions/visit";
  const STATS_URL = "/.netlify/functions/stats";
  const SESSION_KEY = "virixoo_visit_recorded_v1";

  function formatCount(value) {
    const n = Number(value) || 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return String(n);
  }

  function injectStyles() {
    if (document.getElementById("virixoo-visitor-counter-styles")) return;

    const style = document.createElement("style");
    style.id = "virixoo-visitor-counter-styles";
    style.textContent = `
      .virixoo-visitor-wrap {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 10px 16px 0;
        background: transparent;
      }

      .virixoo-visitor-counter {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 0 16px;
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 16px;
        background: linear-gradient(135deg, #121a38 0%, #182443 100%);
        color: #fff;
        box-shadow: 0 10px 28px rgba(12,20,48,.18);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .virixoo-visitor-lead {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding-right: 14px;
        color: #bfc7df;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: .04em;
      }

      .virixoo-visitor-icon {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 9px;
        background: rgba(102,80,255,.14);
        color: #8674ff;
        font-size: 15px;
      }

      .virixoo-visitor-stat {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 30px;
        padding: 0 14px;
        border-left: 1px solid rgba(255,255,255,.13);
      }

      .virixoo-visitor-label {
        font-size: 13px;
        font-weight: 900;
      }

      .virixoo-visitor-value {
        min-width: 28px;
        color: #fff;
        font-size: 15px;
        font-weight: 900;
      }

      .virixoo-visitor-stat[data-period="day"] .virixoo-visitor-label { color: #7f74ff; }
      .virixoo-visitor-stat[data-period="month"] .virixoo-visitor-label { color: #42d79b; }
      .virixoo-visitor-stat[data-period="year"] .virixoo-visitor-label { color: #ffab2f; }

      .virixoo-visitor-counter[hidden] {
        display: none !important;
      }

      @media (max-width: 560px) {
        .virixoo-visitor-wrap {
          padding: 8px 10px 0;
        }

        .virixoo-visitor-counter {
          width: 100%;
          max-width: 390px;
          min-height: 44px;
          padding: 0 10px;
          border-radius: 14px;
        }

        .virixoo-visitor-lead {
          padding-right: 10px;
          font-size: 10px;
        }

        .virixoo-visitor-icon {
          width: 25px;
          height: 25px;
          border-radius: 8px;
          font-size: 13px;
        }

        .virixoo-visitor-stat {
          gap: 5px;
          padding: 0 9px;
        }

        .virixoo-visitor-label { font-size: 11px; }
        .virixoo-visitor-value {
          min-width: 20px;
          font-size: 12px;
        }
      }

      @media (max-width: 390px) {
        .virixoo-visitor-lead span:last-child { display: none; }
        .virixoo-visitor-lead { padding-right: 7px; }
        .virixoo-visitor-stat { padding: 0 7px; }
      }
    `;

    document.head.appendChild(style);
  }

  function createCounter() {
    if (document.getElementById("virixoo-visitor-counter")) return null;

    const wrap = document.createElement("div");
    wrap.className = "virixoo-visitor-wrap";

    const counter = document.createElement("div");
    counter.className = "virixoo-visitor-counter";
    counter.id = "virixoo-visitor-counter";
    counter.hidden = true;
    counter.setAttribute("aria-label", "Virixoo visitor statistics");

    counter.innerHTML = `
      <div class="virixoo-visitor-lead">
        <span class="virixoo-visitor-icon" aria-hidden="true">◉</span>
        <span>VISITORS</span>
      </div>

      <div class="virixoo-visitor-stat" data-period="day">
        <span class="virixoo-visitor-label">D</span>
        <span class="virixoo-visitor-value" data-counter-day>0</span>
      </div>

      <div class="virixoo-visitor-stat" data-period="month">
        <span class="virixoo-visitor-label">M</span>
        <span class="virixoo-visitor-value" data-counter-month>0</span>
      </div>

      <div class="virixoo-visitor-stat" data-period="year">
        <span class="virixoo-visitor-label">Y</span>
        <span class="virixoo-visitor-value" data-counter-year>0</span>
      </div>
    `;

    wrap.appendChild(counter);

    const footer = document.querySelector(".site-footer");
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(wrap, footer);
    } else {
      document.body.appendChild(wrap);
    }

    return counter;
  }

  async function recordVisitOncePerSession() {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;

      const response = await fetch(VISIT_URL, {
        method: "POST",
        headers: { "Accept": "application/json" },
        cache: "no-store",
        credentials: "same-origin"
      });

      if (response.ok) {
        sessionStorage.setItem(SESSION_KEY, "1");
      }
    } catch (error) {
      console.warn("Virixoo visitor counter: unable to record visit.", error);
    }
  }

  async function loadStats() {
    const response = await fetch(STATS_URL, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store",
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error(`Stats request failed with ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.success !== true) {
      throw new Error("Stats response was not successful.");
    }

    return data;
  }

  function renderStats(counter, data) {
    const day = counter.querySelector("[data-counter-day]");
    const month = counter.querySelector("[data-counter-month]");
    const year = counter.querySelector("[data-counter-year]");

    if (day) day.textContent = formatCount(data.today);
    if (month) month.textContent = formatCount(data.thisMonth);
    if (year) year.textContent = formatCount(data.thisYear);

    counter.hidden = false;
  }

  async function startCounter() {
    injectStyles();

    const counter = createCounter();
    if (!counter) return;

    await recordVisitOncePerSession();

    try {
      const stats = await loadStats();
      renderStats(counter, stats);
    } catch (error) {
      console.warn("Virixoo visitor counter: unable to load stats.", error);
      counter.hidden = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startCounter, { once: true });
  } else {
    startCounter();
  }
})();
