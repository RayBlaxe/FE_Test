const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Always try to parse JSON response, even for errors
  let data;
  try {
    data = await res.json();
  } catch {
    // If JSON parsing fails, return text
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || `Request failed: ${res.status}`);
    }
    return null;
  }

  // If response is not ok but we have JSON data, return it (for error handling in component)
  if (!res.ok) {
    return data;
  }

  return data;
}
