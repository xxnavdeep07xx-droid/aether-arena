/**
 * Type-safe fetch wrapper with proper error handling.
 *
 * All API calls from the frontend should use this instead of raw `fetch()`.
 * It checks `response.ok` and throws a descriptive error on failure,
 * preventing silent data corruption when the server returns 4xx/5xx.
 */

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Fetch with error checking — throws on non-2xx responses.
 *
 * Usage in React Query:
 * ```ts
 * queryFn: () => apiFetch('/api/endpoint')
 * ```
 *
 * With transform:
 * ```ts
 * queryFn: () => apiFetch('/api/endpoint').then(d => d.items)
 * ```
 */
export async function apiFetch<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init)
  if (!r.ok) {
    let message = `Request failed: ${r.status}`
    try {
      const data = await r.json()
      if (data.error) message = data.error
    } catch {
      // JSON parse failed — use default message
    }
    throw new ApiError(message, r.status)
  }
  return r.json()
}
