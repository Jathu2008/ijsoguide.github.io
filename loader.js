// Page Loader Management
(function() {
  // Hide loader when page fully loads
  window.addEventListener('load', () => {
    const loader = document.getElementById('page-loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 500);
    }
  });

  // Fallback: hide loader after 8 seconds (in case page takes too long to load)
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
    }
  }, 8000);

  // Show loader on navigation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href && !link.target && !link.hasAttribute('data-no-loader')) {
      const href = link.href;
      // Only show loader for internal navigation
      if (href.includes(window.location.hostname) || href.startsWith('/') || !href.includes('://')) {
        const loader = document.getElementById('page-loader');
        if (loader) {
          loader.classList.remove('hidden');
        }
      }
    }
  });
})();
