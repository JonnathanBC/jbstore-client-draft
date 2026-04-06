import type { APIRoute } from 'astro';
import { laravelApi } from '@/libs/api';

export const POST: APIRoute = async ({ cookies }) => {
  const token = cookies.get('auth_token')?.value;

  if (token) {
    await laravelApi('/logout', { method: 'POST' }, token);
  }

  cookies.delete('auth_token', { path: '/' });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
