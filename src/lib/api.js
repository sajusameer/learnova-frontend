const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api';

/**
 * Core fetch wrapper for Strapi REST API
 */
export async function fetchFromStrapi(endpoint, options = {}) {
  const { token, headers, ...customOptions } = options;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_URL}${cleanEndpoint}`, {
    headers: defaultHeaders,
    ...customOptions,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}