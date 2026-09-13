/**
 * GitHub Pages API interceptor
 * On github.io, /api/* endpoints don't exist (no backend)
 * Redirect them to Cloudflare Worker proxy
 * 
 * This runs BEFORE any data layer tries to fetch /api/*
 */

import { WORKER_URL, getApiUrl } from './proxy.js';

function isGitHubPages() {
  return typeof window !== 'undefined' && window.location.hostname.includes('github.io');
}

function shouldProxy(url) {
  if (!isGitHubPages()) return false;
  if (!WORKER_URL || WORKER_URL.includes('yourname')) return false;
  
  // Only proxy /api/* paths
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname.startsWith('/api/');
  } catch {
    return String(url).startsWith('/api/');
  }
}

function toWorkerUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    // Preserve pathname + search
    return `${WORKER_URL}${parsed.pathname}${parsed.search}`;
  } catch {
    // Fallback for relative URLs
    const urlStr = String(url);
    if (urlStr.startsWith('/api/')) {
      return `${WORKER_URL}${urlStr}`;
    }
    return url;
  }
}

export function installGitHubPagesInterceptor() {
  if (!isGitHubPages()) {
    console.log('[GitHub Pages Interceptor] Not on github.io, skipping');
    return;
  }
  
  if (!WORKER_URL || WORKER_URL.includes('yourname')) {
    console.warn('[GitHub Pages Interceptor] WORKER_URL not set, API calls will fail');
    return;
  }
  
  console.log(`[GitHub Pages Interceptor] Installing - Worker: ${WORKER_URL}`);
  
  const originalFetch = window.fetch.bind(window);
  
  window.fetch = async function(input, init) {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    if (shouldProxy(url)) {
      const workerUrl = toWorkerUrl(url);
      console.log(`[GitHub Pages Interceptor] ${url} -> ${workerUrl}`);
      
      // If input is Request object, clone with new URL
      if (input instanceof Request) {
        const newRequest = new Request(workerUrl, {
          method: input.method,
          headers: input.headers,
          body: input.body,
          signal: input.signal,
          credentials: 'omit',
        });
        return originalFetch(newRequest, init);
      }
      
      return originalFetch(workerUrl, init);
    }
    
    return originalFetch(input, init);
  };
  
  // Also patch for WebSocket? No, AIS uses HTTP polling on GitHub Pages now
  console.log('[GitHub Pages Interceptor] Installed ✓');
}

// Auto-install if on GitHub Pages
if (typeof window !== 'undefined') {
  installGitHubPagesInterceptor();
}
