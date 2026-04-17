import { apiClient } from '@/services/api';
import { defineMiddleware } from 'astro:middleware';
import type { User } from './types/user';

const PROTECTED_PREFIXES = ['/admin'];

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;
  context.locals.isAdmin = false;

  const token = context.cookies.get('auth_token')?.value;

  if (token) {
    try {
      const { data: user } = await apiClient(token).get<User>('/api/auth/me');

      if (user) {
        context.locals.user = user;
        context.locals.isAdmin = user.role === 'ROLE_ADMIN';
      }
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
