/**
 * Custom fetch utility with BridgeFlow version header
 * Automatically adds the x-bridgeflow-version header to all fetch requests
 */

// BUILD_CONFIG is defined globally in the BridgeFlow project

/**
 * Wrapper around fetch that automatically adds the x-bridgeflow-version header
 * @param input Request URL
 * @param init Request initialization options
 * @returns Promise with the fetch Response
 */
const CSRF_COOKIE_NAME = 'bridgeflow_csrf_token';

function getCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    const idx = cookie.indexOf('=');
    const key = idx === -1 ? cookie : cookie.slice(0, idx);
    if (key === name) {
      return idx === -1 ? '' : cookie.slice(idx + 1);
    }
  }
  return null;
}

export const bridgeflowFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const method = init?.method?.toUpperCase() ?? 'GET';
  const csrfToken =
    method !== 'GET' && method !== 'HEAD'
      ? getCookieValue(CSRF_COOKIE_NAME)
      : null;

  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      'x-bridgeflow-version': BUILD_CONFIG.appVersion,
      ...(csrfToken ? { 'x-bridgeflow-csrf-token': csrfToken } : {}),
    },
  });
};
