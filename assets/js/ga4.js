const GA_MEASUREMENT_ID = 'G-7FLYS8Y9BB';

(() => {
  if (!GA_MEASUREMENT_ID) return;

  const existingLoader = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`);
  if (!existingLoader) {
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gtagScript);
  }

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
  }

  if (!window.__ccGa4Initialized) {
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
    window.__ccGa4Initialized = true;
  }
})();
