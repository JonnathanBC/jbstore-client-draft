import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, cookies }) => {
  const token = url.searchParams.get('token');

  if (!token) {
    return Response.redirect(new URL('/login', url.origin), 302);
  }

  cookies.set('auth_token', token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.redirect(new URL('/', url.origin), 302);
};
