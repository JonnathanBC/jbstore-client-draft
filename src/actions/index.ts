import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { laravelApi } from '@/libs/api';

export const server = {
  loginAction: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email(),
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
  }),

  registerAction: defineAction({
    accept: 'form',
    input: z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        password_confirmation: z.string().min(8),
      })
      .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match',
        path: ['password_confirmation'],
      }),
    handler: async (input, context) => {
      const res = await laravelApi('/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
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
  }),
};
