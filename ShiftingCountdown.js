class ShiftingCountdown {
  constructor(selectorOrElement, targetDate) {
    if (typeof selectorOrElement === 'string') this.container = document.querySelector(selectorOrElement);
    else this.container = selectorOrElement;

    if (!this.container) {
      console.error(`ShiftingCountdown: Could not find container ${selectorOrElement}`);
      return;
    }

    // Allow passing Date/string or fallback to data attribute
    const dataTarget = this.container.dataset.target;
    this.targetDate = targetDate ? new Date(targetDate) : dataTarget ? new Date(dataTarget) : null;
    if (!this.targetDate || isNaN(this.targetDate)) {
      console.warn('ShiftingCountdown: invalid or missing target date, defaulting to 2026-10-01');
      this.targetDate = new Date('2026-10-01T00:00:00');
    }

    this.elements = {};
    this.previousTime = { Day: -1, Hour: -1, Minute: -1, Second: -1 };

    // Constants
    this.SECOND = 1000;
    this.MINUTE = this.SECOND * 60;
    this.HOUR = this.MINUTE * 60;
    this.DAY = this.HOUR * 24;

    this.init();
  }

  init() {
    this.injectStyles();

    const mainLabel = this.container.dataset.label || '';
    this.container.innerHTML = `
      <div class="sc-box">
        ${mainLabel ? `<div class="sc-title">${mainLabel}</div>` : ''}
        <div class="sc-wrapper">
          ${this.buildUnitHTML('Day', 'Days')}
          ${this.buildUnitHTML('Hour', 'Hrs')}
          ${this.buildUnitHTML('Minute', 'Mins')}
          ${this.buildUnitHTML('Second', 'Secs')}
        </div>
      </div>
    `;

    ['Day', 'Hour', 'Minute', 'Second'].forEach(unit => {
      this.elements[unit] = this.container.querySelector(`[data-unit="${unit}"] .sc-number`);
    });

    this.update();
    this._interval = setInterval(() => this.update(), 1000);
  }

  injectStyles() {
    if (document.getElementById('sc-styles-v2')) return;
    const style = document.createElement('style');
    style.id = 'sc-styles-v2';
    style.innerHTML = `
      /* Floating countdown container - glass box */
      [data-shifting-countdown] { position: absolute; top: 3.5rem; left: 50%; transform: translateX(-50%); z-index: 50; display:block; pointer-events: none; }
      /* glass box that holds the numbers; will accept pointer events so it doesn't click-through */
      [data-shifting-countdown] .sc-box {
        pointer-events: auto;
        display: inline-block;
        background: rgba(6, 0, 16, 0.6);
        border: 1px solid rgba(255,255,255,0.06);
        backdrop-filter: blur(6px);
        padding: 0.2rem 0.45rem; /* reduced padding */
        border-radius: 10px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.55);
        max-width: calc(100% - 2rem);
      }
      [data-shifting-countdown] .sc-wrapper { display:inline-flex; align-items:center; justify-content:center; gap:0.75rem; font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; white-space: nowrap; }
      .sc-item { flex:0 0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0.15rem 0.4rem; gap:0.12rem; min-width:2.8rem; pointer-events: auto; }
      /* allow the animated numbers to move without clipping */
      .sc-number-wrapper { position: relative; width: 100%; overflow: visible; text-align: center; min-height: 1.2em; }
      .sc-number { display:block; font-size:1rem; line-height:1.05; font-weight:600; color: #fff; background: var(--gradient-main); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      @media (min-width:768px){ .sc-number{ font-size:1.2rem } }
      @media (min-width:1024px){ .sc-number{ font-size:1.4rem } }
      .sc-label { font-size:0.85rem; font-weight:600; color: rgba(255,255,255,0.9); text-transform: none; }
      .sc-divider { display:none }
      .sc-item .sc-number.animate-exit { transform: translateY(-50%); opacity: 0 }
      .sc-item .sc-number.animate-enter { transform: translateY(0%); opacity: 1 }
      /* Ensure hero section positioned for absolute placement */
      .hero-section { position: relative; }
      .sc-title { text-align:center; color: rgba(255,255,255,0.92); font-weight:700; font-size:0.9rem; margin-bottom:0.2rem; letter-spacing:0.02em }
      /* Floating animation for subtle lift */
      [data-shifting-countdown] .sc-box { animation: sc-float 6s ease-in-out infinite; transform-origin: center; }

      @keyframes sc-float {
        0% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
        100% { transform: translateY(0); }
      }

      /* Responsive: reduce top offset on smaller screens */
      @media (max-width: 768px) {
        [data-shifting-countdown] { top: 2.25rem; }
      }
    `;
    document.head.appendChild(style);
  }

  buildUnitHTML(unit, label) {
    return `
      <div class="sc-item" data-unit="${unit}">
        <div class="sc-number-wrapper"><span class="sc-number">00</span></div>
        <span class="sc-label">${label}</span>
        <div class="sc-divider"></div>
      </div>
    `;
  }

  update() {
    const now = new Date();
    const distance = this.targetDate - now;
    if (distance < 0) return;

    const times = {
      Day: Math.floor(distance / this.DAY),
      Hour: Math.floor((distance % this.DAY) / this.HOUR),
      Minute: Math.floor((distance % this.HOUR) / this.MINUTE),
      Second: Math.floor((distance % this.MINUTE) / this.SECOND),
    };

    Object.keys(times).forEach(unit => {
      let value = times[unit];
      if (unit === 'Second') value = String(value).padStart(2, '0');
      if (times[unit] !== this.previousTime[unit]) {
        this.animateChange(unit, value);
        this.previousTime[unit] = times[unit];
      }
    });
  }

  animateChange(unit, newValue) {
    const element = this.elements[unit];
    if (!element) return;

    // Exit animation
    const exit = element.animate([
      { transform: 'translateY(0%)', opacity: 1 },
      { transform: 'translateY(-50%)', opacity: 0 }
    ], { duration: 300, fill: 'forwards', easing: 'ease-in-out' });

    exit.onfinish = () => {
      element.textContent = newValue;
      // Enter animation
      element.animate([
        { transform: 'translateY(50%)', opacity: 0 },
        { transform: 'translateY(0%)', opacity: 1 }
      ], { duration: 300, fill: 'forwards', easing: 'ease-in-out' });
    };
  }

  destroy() {
    if (this._interval) clearInterval(this._interval);
    this.container.innerHTML = '';
  }
}

// Auto-initialize any element with data-shifting-countdown
document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('[data-shifting-countdown]');
  if (!els || els.length === 0) return;
  els.forEach((el, idx) => {
    if (!el.id) el.id = `sc-auto-${idx}`;
    const target = el.dataset.target || window.SHIFTING_COUNTDOWN_TARGET || '2026-10-01T00:00:00';
    // eslint-disable-next-line no-new
    new ShiftingCountdown(`#${el.id}`, target);
  })
});

// Export class for manual usage
window.ShiftingCountdown = ShiftingCountdown;
