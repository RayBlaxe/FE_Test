// lib/http.ts
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

  if (!res.ok) {
    // Bisa dibuat handling lebih manis nanti
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  // Kalau API kadang return non-JSON, tinggal sesuaikan
  try {
    return await res.json();
  } catch {
    return null;
  }
}
