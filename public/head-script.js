// Force browser to use favicon
if (document) {
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
  link.type = 'image/png';
  link.rel = 'icon';
  link.href = '/favicon.png';
  document.getElementsByTagName('head')[0].appendChild(link);
}
