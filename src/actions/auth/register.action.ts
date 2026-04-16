import { laravelApi } from '@/libs/api';
import { z } from 'astro/zod';
import { ActionError, defineAction } from 'astro:actions';

export const registerUser = defineAction({
  accept: 'form',
  input: z
    .object({
      name: z.string().min(1),
      email: z.email(),
      password: z.string().min(8),
      password_confirmation: z.string().min(8),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: 'Passwords do not match',
      path: ['password_confirmation'],
    }),
  handler: async (input, context) => {
    const res = await laravelApi('api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ActionError({
        code: res.status === 422 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
        message: data?.message ?? 'Registration failed',
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
