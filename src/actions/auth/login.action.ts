import { laravelApi, toActionError } from '@/libs/api';
import { z } from 'astro/zod';
import { defineAction } from 'astro:actions';

export const loginAction = defineAction({
  accept: 'json',
  input: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
  handler: async (input, context) => {
    try {
      const { data } = await laravelApi().post<{ user: unknown; token: string }>(
        '/api/auth/login',
        input,
      );

      context.cookies.set('auth_token', data.token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return { user: data.user };
    } catch (err) {
      throw toActionError(err);
    }
  },
});
