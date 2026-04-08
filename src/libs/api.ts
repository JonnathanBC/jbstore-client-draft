const API_URL = import.meta.env.PUBLIC_LARAVEL_API_URL;

export async function laravelApi(path: string, options: RequestInit = {}, token?: string) {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  console.log({ options, API_URL });

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const finalUrl = `${API_URL}/${path}`.replace(/([^:]\/)\/+/g, '$1');

  return fetch(finalUrl, { ...options, headers });
}
