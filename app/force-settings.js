// This script forces favicon and handles all link redirections
(function() {
  // Force favicon - use a timestamp to bypass caching
  const setFavicon = () => {
    const oldLinks = document.querySelectorAll('link[rel*="icon"]');
    oldLinks.forEach(e => e.parentNode.removeChild(e));
    
    const link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = '/favicon.png?v=' + Date.now();
    document.head.appendChild(link);
  };
  
  // Handle all link redirections
  const redirectLinks = () => {
    document.querySelectorAll('a').forEach(link => {
      if (link.getAttribute('href') === '/dashboard/deposit') {
        link.setAttribute('href', 'http://localhost:3002/dashboard/deposit');
        link.setAttribute('target', '_blank');
      }
      if (link.getAttribute('href') === '/dashboard/withdraw') {
        link.setAttribute('href', 'http://localhost:3002/dashboard/withdraw');
        link.setAttribute('target', '_blank');
      }
    });
  };
  
  // Run immediately
  setFavicon();
  
  // Run after DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setFavicon();
      redirectLinks();
    });
  } else {
    redirectLinks();
  }
  
  // Run after any changes to the DOM (for SPA navigation)
  const observer = new MutationObserver(function(mutations) {
    redirectLinks();
  });
  
  // Start observing when the document body is available
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
