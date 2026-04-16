import { laravelApi } from '@/libs/api';
import { defineAction } from 'astro:actions';

export const logoutAction = defineAction({
  accept: 'json',
  handler: async (_input, context) => {
    const token = context.cookies.get('auth_token')?.value;

    if (token) {
      await laravelApi('api/auth/logout', { method: 'POST' }, token).catch(() => null);
    }

    context.cookies.delete('auth_token', { path: '/' });

    return { success: true };
  },
});
