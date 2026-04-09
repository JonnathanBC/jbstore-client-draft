import { defineMiddleware } from 'astro:middleware';
import { laravelApi } from '@/libs/api';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth/'];

export const onRequest = defineMiddleware(async (context, next) => {
  const isPublic = PUBLIC_PATHS.some((p) => context.url.pathname.startsWith(p));
  if (isPublic) return next();

  const token = context.cookies.get('auth_token')?.value;

  console.log({ token });
  // if (!token) return context.redirect('/login');

  // const res = await laravelApi('/user', {}, token);
  // if (!res.ok) {
  //   context.cookies.delete('auth_token', { path: '/' });
  //   return context.redirect('/login');
  // }

  // context.locals.user = await res.json();
  return next();
});
