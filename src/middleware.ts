import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const session = context.cookies.get('session'); // nombre de tu cookie

  // Si no hay sesión y no estás ya en /login
  if (!session && context.url.pathname !== '/login') {
    return context.redirect('/login');
  }

  return next();
});
