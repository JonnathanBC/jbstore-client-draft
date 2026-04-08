import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';

import { laravelApi } from '@/libs/api';

export const loginAction = defineAction({
  accept: 'form',
  input: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
  handler: async (input, context) => {
    const res = await laravelApi('/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Invalid credentials');
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
