import type { APIRoute } from 'astro';
import { apiClient } from '@/services/api';

export const POST: APIRoute = async ({ cookies }) => {
  const token = cookies.get('auth_token')?.value;

  if (token) {
    await apiClient('/logout', { method: 'POST' }, token);
  }

  cookies.delete('auth_token', { path: '/' });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
