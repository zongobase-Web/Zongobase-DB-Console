/**
 * ZongoBase Dynamic API Routing & Integration Coordinator
 */

const DEFAULT_DEV_BACKEND = "https://ais-dev-trhdk5umowo6g37aif6i3z-475148401766.europe-west1.run.app";

export function isExternalHost(): boolean {
  const hn = window.location.hostname;
  // If running on netlify, or outside of standard preview/sandbox domains, mark as external
  return (
    hn.includes("netlify.app") ||
    (!hn.includes("localhost") && !hn.includes("run.app") && !hn.includes("google.com"))
  );
}

export function getBackendOrigin(): string {
  const custom = localStorage.getItem("zongobase_api_url");
  if (custom) {
    return custom.replace(/\/+$/, '');
  }
  if (isExternalHost()) {
    return DEFAULT_DEV_BACKEND;
  }
  return window.location.origin;
}

export function getApiUrl(path: string): string {
  const origin = getBackendOrigin();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // If on standard local/sandbox port, keep path relative to prevent browser CORs overheads
  if (!isExternalHost() && !localStorage.getItem("zongobase_api_url")) {
    return cleanPath;
  }
  return `${origin}${cleanPath}`;
}

export function setCustomApiUrl(url: string | null) {
  if (!url) {
    localStorage.removeItem("zongobase_api_url");
  } else {
    // Sanitize trailing slash
    const sanitized = url.trim().replace(/\/+$/, '');
    localStorage.setItem("zongobase_api_url", sanitized);
  }
  // Reload page to re-establish EventSource and trigger fresh state sync
  window.location.reload();
}
