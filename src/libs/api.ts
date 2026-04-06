const API_URL = import.meta.env.LARAVEL_API_URL;

export async function laravelApi(path: string, options: RequestInit = {}, token?: string) {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, { ...options, headers });
}
