// --- Global Path Fixer & Navigation ---
const projectRoot = new URL(".", import.meta.url).href;

/**
 * Fixes relative paths for links and images based on the project root.
 * @param {HTMLElement} rootElement - The element to search within.
 */
function fixPaths(rootElement = document) {
  rootElement.querySelectorAll("a, img").forEach((el) => {
    const attr = el.tagName === "A" ? "href" : "src";
    let val = el.getAttribute(attr);

    // Check if value is a relative path (not starting with http, //, /, mailto:, tel:, #, or ?)
    if (val && !val.match(/^(http|\/\/|\/|mailto:|tel:|#|\?)/)) {
      if (val.startsWith("./")) {
        val = val.substring(2);
      }
      const newUrl = projectRoot + val;
      el.setAttribute(attr, newUrl);
    }
  });
}

// Initial Path Fix
document.addEventListener("DOMContentLoaded", () => {
  fixPaths();
  initNavigation();
  initParticles();
  initRevealAnimations();
});

// --- Navigation Injection ---
function initNavigation() {
  if (document.querySelector("nav")) return;

  fetch(projectRoot + "navigation.html")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch navigation.html");
      return response.text();
    })
    .then((data) => {
      const n = document.createElement("nav");
      const parser = new DOMParser();
      const docNav = parser.parseFromString(data, "text/html");

      // Inject and fix paths specifically for the navbar
      n.innerHTML = docNav.body.innerHTML;
      fixPaths(n);
      document.body.insertBefore(n, document.body.firstChild);

      setupMobileMenu();
    })
    .catch((err) => console.error("Navigation Error:", err));
}

function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");
  if (!menuToggle || !menu) return;

  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("active");
    if (menuToggle.classList.contains("fa-bars")) {
      menuToggle.classList.replace("fa-bars", "fa-xmark");
    } else {
      menuToggle.classList.replace("fa-xmark", "fa-bars");
    }
  });

  menu.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", () => {
      if (menu.classList.contains("active")) menuToggle.click();
    });
  });
}

// --- Background Particles ---
function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: null, y: null, radius: 80 };

  // Configurable colors (full palette)
  const PARTICLE_COLORS = ["#56a9ff", "#b561ff", "#40cb7a", "#ffcb58"];

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

  function hexToRgbObj(hex) {
    const h = hex.replace("#", "");
    const bigint = parseInt(h, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = Math.random() * 30 + 1;
      const baseHex =
        PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      this.baseHex = baseHex;
      this.color = `rgba(${hexToRgb(baseHex)}, ${Math.random() * 0.5 + 0.2})`;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    update() {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius) {
        let force = (mouse.radius - distance) / mouse.radius;
        this.x -= (dx / distance) * force * this.density;
        this.y -= (dy / distance) * force * this.density;
      } else {
        if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 10;
        if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 10;
      }
    }
  }

  function init() {
    particles = [];
    
    const area = canvas.height * canvas.width;
    let numberOfParticles = Math.round(area / 8000);
    const MAX_PARTICLES = 1800;
    numberOfParticles = Math.min(numberOfParticles, MAX_PARTICLES);
    for (let i = 0; i < numberOfParticles; i++) particles.push(new Particle());
  }

  // Animation control: throttle FPS and allow pause/resume
  const TARGET_FPS = 30; // lower frame rate
  const FRAME_INTERVAL = 1000 / TARGET_FPS;
  let lastFrameTime = 0;
  let animRunning = false;

  function animate(timestamp) {
    if (!animRunning) return;
    if (!lastFrameTime) lastFrameTime = timestamp;
    const elapsed = timestamp - lastFrameTime;
    if (elapsed >= FRAME_INTERVAL) {
      lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.draw();
        p.update();
      });
      connect();
    }
    requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (animRunning) return;
    animRunning = true;
    lastFrameTime = 0;
    requestAnimationFrame(animate);
  }

  function stopAnimation() {
    animRunning = false;
  }

  function connect() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 80) {
          // Blend the two particle base colors for the connecting line
          const colorA = particles[a].baseHex || PARTICLE_COLORS[0];
          const colorB = particles[b].baseHex || PARTICLE_COLORS[0];
          const cA = hexToRgbObj(colorA);
          const cB = hexToRgbObj(colorB);
          const avgR = Math.round((cA.r + cB.r) / 2);
          const avgG = Math.round((cA.g + cB.g) / 2);
          const avgB = Math.round((cA.b + cB.b) / 2);
          ctx.strokeStyle = `rgba(${avgR}, ${avgG}, ${avgB}, ${(1 - distance / 100) * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  init();

  // Only start animations when the page is visible (helps performance and ratings)
  function enablePageAnimations() {
    document.documentElement.classList.add("animations-enabled");
    startAnimation();
    // resume glowing spots if present
    const spots = document.querySelectorAll("#glowingSpots span");
    spots.forEach((s) => (s.style.animationPlayState = "running"));
  }

  function disablePageAnimations() {
    document.documentElement.classList.remove("animations-enabled");
    stopAnimation();
    const spots = document.querySelectorAll("#glowingSpots span");
    spots.forEach((s) => (s.style.animationPlayState = "paused"));
  }

  // Start only if visible now
  if (document.visibilityState === "visible") enablePageAnimations();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") enablePageAnimations();
    else disablePageAnimations();
  });

  // Also enable when user first interacts (scroll or mousemove) to avoid animating background before user arrives
  let userInteracted = false;
  function onFirstInteraction() {
    if (userInteracted) return;
    userInteracted = true;
    enablePageAnimations();
    window.removeEventListener("scroll", onFirstInteraction);
    window.removeEventListener("mousemove", onFirstInteraction);
  }
  window.addEventListener("scroll", onFirstInteraction, { passive: true });
  window.addEventListener("mousemove", onFirstInteraction, { passive: true });
}

// --- Reveal Animations ---
function initRevealAnimations() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));
}