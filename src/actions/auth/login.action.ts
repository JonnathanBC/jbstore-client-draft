import { laravelApi } from '@/libs/api';
import { z } from 'astro/zod';
import { ActionError, defineAction } from 'astro:actions';

export const loginAction = defineAction({
  accept: 'json',
  input: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
  handler: async (input, context) => {
    const res = await laravelApi('api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ActionError({
        code: res.status === 422 ? 'BAD_REQUEST' : 'UNAUTHORIZED',
        message: data?.message ?? 'Invalid credentials',
      });
    }

    context.cookies.set('auth_token', data.token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { user: data.user };
  },
});
