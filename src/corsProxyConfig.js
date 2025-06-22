// CORS Proxy Configuration
// Easy switching between different proxy solutions

const CORS_PROXY_CONFIG = {
  // Production-ready Cloudflare Workers proxy (recommended)
  CLOUDFLARE_WORKER: {
    name: 'Cloudflare Workers',
    url: 'https://your-worker-name.your-subdomain.workers.dev/?url=',
    cost: 'Free up to 100k requests/day, then $5/month',
    reliability: 'Enterprise-grade',
    setup: 'Requires Cloudflare account setup',
    recommended: true
  },

  // Free third-party proxies (backup options)
  CORSPROXY_IO: {
    name: 'CorsProxy.io',
    url: 'https://corsproxy.io/?',
    cost: 'Free',
    reliability: 'Good',
    setup: 'Ready to use',
    recommended: false
  },

  CORS_SH: {
    name: 'Cors.sh',
    url: 'https://proxy.cors.sh/',
    cost: 'Free with limits',
    reliability: 'Good',
    setup: 'Ready to use',
    recommended: false
  },

  // Custom proxy (for advanced users)
  CUSTOM: {
    name: 'Custom Proxy',
    url: 'https://your-custom-proxy.com/?url=',
    cost: 'Varies',
    reliability: 'Depends on implementation',
    setup: 'Requires custom deployment',
    recommended: false
  }
};

// Current active proxy (change this to switch proxies)
const ACTIVE_PROXY = 'CORSPROXY_IO'; // Change to 'CLOUDFLARE_WORKER' when ready

// Get current proxy configuration
function getCurrentProxyConfig() {
  return CORS_PROXY_CONFIG[ACTIVE_PROXY];
}

// Build proxied URL
function buildProxiedUrl(targetUrl) {
  const config = getCurrentProxyConfig();
  
  if (ACTIVE_PROXY === 'CLOUDFLARE_WORKER') {
    // Cloudflare Worker expects URL as query parameter
    return config.url + encodeURIComponent(targetUrl);
  } else if (ACTIVE_PROXY === 'CORS_SH') {
    // Cors.sh expects URL after the proxy URL
    return config.url + targetUrl;
  } else {
    // Most other proxies expect URL as query parameter
    return config.url + encodeURIComponent(targetUrl);
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CORS_PROXY_CONFIG,
    ACTIVE_PROXY,
    getCurrentProxyConfig,
    buildProxiedUrl
  };
}

// For browser environments
if (typeof window !== 'undefined') {
  window.CorsProxyConfig = {
    CORS_PROXY_CONFIG,
    ACTIVE_PROXY,
    getCurrentProxyConfig,
    buildProxiedUrl
  };
} 