const container = document.getElementById("glowingSpots");
if (container) {
  const SPOT_COLORS = ["#40cb7a", "#ffcb58", "#56a9ff", "#b561ff"];
  for (let i = 0; i < 30; i++) {
    const span = document.createElement("span");
    const color = SPOT_COLORS[Math.floor(Math.random() * SPOT_COLORS.length)];
    span.style.left = Math.random() * 100 + "vw";
    span.style.top = Math.random() * 100 + "vh";
    span.style.animationDelay = Math.random() * 20 + "s";
    // slower animations by default to save resources
    span.style.animationDuration = 15 + Math.random() * 30 + "s";
    span.style.width = 10 + Math.random() * 30 + "px";
    span.style.height = span.style.width;
    span.style.background = color;
    span.style.borderRadius = "50%";
    span.style.position = "absolute";
    span.style.pointerEvents = "none";
    span.style.boxShadow = `0 0 ${10 + Math.random() * 20}px ${color}`;
    container.appendChild(span);
  }
}

const cursor = document.querySelector(".cursor");
if (cursor) {
  window.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  });
}
