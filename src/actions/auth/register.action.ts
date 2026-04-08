// src/actions/auth/register.action.ts

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
      confirm_password: z.string().min(8),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: 'Passwords do not match',
    }),
  handler: async (input, context) => {
    try {
      // 1. Llamada a Laravel usando tu wrapper
      const response = await laravelApi('api/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      console.log({ response });

      // 2. REVISIÓN CRÍTICA: ¿Qué respondió Laravel?
      if (!response.ok) {
        // Si Laravel responde error (401, 422, 500),
        // leemos el error para saber qué pasó.
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Error fatal en Laravel' }));

        throw new ActionError({
          code: 'BAD_REQUEST',
          message: errorData.message || 'Error en el registro',
        });
      }

      const data = await response.json();

      // 3. Guardar la cookie en el context de Astro
      context.cookies.set('auth_token', data.token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return { success: true, user: data.user };
    } catch (error) {
      // Si ya es un ActionError, lo relanzamos
      if (error instanceof ActionError) throw error;

      // Si no, creamos uno nuevo
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },
});
