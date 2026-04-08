import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';

import { laravelApi } from '@/libs/api';

export const registerUser = defineAction({
  accept: 'json',
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
  handler: async ({ email, password, name }, context) => {
    // if (remember_me) {
    //   context.cookies.set('email', email, {
    //     expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    //     path: '/',
    //   });
    // } else {
    //   context.cookies.delete('email', { path: '/' });
    // }

    // Creación de usuario
    try {
      const response = await laravelApi('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log({ user: data.user });
      console.log({ token: data.token });

      // Verificar el correo electronico if is necessary

      // Extraer datos relevantes del usuario
      // const userData = {
      //   uid: user.user.uid,
      //   email: user.user.email,
      //   displayName: user.user.displayName,
      // };

      context.cookies.set('auth_token', data.token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return data;
    } catch (error) {
      throw new ActionError({
        message: error instanceof Error ? error.message : 'Registration failed',
        code: 'BAD_REQUEST',
      });
    }
  },
});
