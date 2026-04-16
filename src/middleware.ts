import { laravelApi } from '@/libs/api';
import { defineMiddleware } from 'astro:middleware';

const PROTECTED_PREFIXES = ['/admin'];

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get('auth_token')?.value;

  if (token) {
    const res = await laravelApi('api/auth/me', {}, token);
    if (res.ok) {
      context.locals.user = await res.json();
    } else {
      context.cookies.delete('auth_token', { path: '/' });
    }
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => context.url.pathname.startsWith(p));
  if (isProtected && !context.locals.user) {
    return context.redirect('/login');
  }

  return next();
});
