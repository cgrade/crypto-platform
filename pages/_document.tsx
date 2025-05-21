import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.png?v=1" />
        <link rel="shortcut icon" href="/favicon.png?v=1" />
        <link rel="apple-touch-icon" href="/favicon.png?v=1" />
      </Head>
      <body>
        {/* Add script to force favicon and handle redirects */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force favicon with timestamp to bypass cache
              function setFavicon() {
                const links = document.querySelectorAll('link[rel*="icon"]');
                links.forEach(link => link.parentNode.removeChild(link));
                
                const favicon = document.createElement('link');
                favicon.rel = 'icon';
                favicon.href = '/favicon.png?v=' + new Date().getTime();
                document.head.appendChild(favicon);
              }
              
              // Handle all redirects
              function handleRedirects() {
                document.querySelectorAll('a[href="/dashboard/deposit"]').forEach(link => {
                  link.setAttribute('href', 'http://localhost:3002/dashboard/deposit');
                  link.setAttribute('target', '_blank');
                });
                
                document.querySelectorAll('a[href="/dashboard/withdraw"]').forEach(link => {
                  link.setAttribute('href', 'http://localhost:3002/dashboard/withdraw');
                  link.setAttribute('target', '_blank');
                });
              }
              
              // Run favicon fix immediately
              setFavicon();
              
              // Handle redirects after DOM loads
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                  handleRedirects();
                  
                  // Watch for DOM changes (for SPA navigation)
                  const observer = new MutationObserver(function() {
                    handleRedirects();
                  });
                  
                  observer.observe(document.body, { childList: true, subtree: true });
                });
              } else {
                handleRedirects();
                
                // Watch for DOM changes (for SPA navigation)
                const observer = new MutationObserver(function() {
                  handleRedirects();
                });
                
                observer.observe(document.body, { childList: true, subtree: true });
              }
            `
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
