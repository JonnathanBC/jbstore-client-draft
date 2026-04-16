import { laravelApi } from '@/libs/api';
import { defineMiddleware } from 'astro:middleware';

const PROTECTED_PREFIXES = ['/admin'];

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get('auth_token')?.value;

  if (token) {
    try {
      const { data } = await laravelApi(token).get('/api/auth/me');
      context.locals.user = data;
    } catch {
      context.cookies.delete('auth_token', { path: '/' });
    }
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => context.url.pathname.startsWith(p));
  if (isProtected && !context.locals.user) {
    return context.redirect('/login');
  }

  return next();
});
