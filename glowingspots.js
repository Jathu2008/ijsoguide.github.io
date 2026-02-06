// Glowing spots disabled globally.
// This script intentionally does not create any decorative spots so the
// site's existing background effects remain unchanged.
const container = document.getElementById("glowingSpots");
if (container) {
  // Ensure no leftover spots and hide the container so it doesn't intercept layout.
  container.innerHTML = "";
  container.style.display = "none";
  container.style.pointerEvents = "none";
  container.setAttribute("aria-hidden", "true");
}

// Preserve cursor behavior (unrelated background interaction).
const cursor = document.querySelector(".cursor");
if (cursor) {
  window.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  });
}
