import { apiClient } from '@/services/api';
import { defineAction } from 'astro:actions';

export const logoutAction = defineAction({
  accept: 'json',
  handler: async (_input, context) => {
    const token = context.cookies.get('auth_token')?.value;

    if (token) {
      await apiClient(token)
        .post('/api/auth/logout')
        .catch(() => null);
    }

    context.cookies.delete('auth_token', { path: '/' });

    return { success: true };
  },
});
