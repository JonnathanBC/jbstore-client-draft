import type { APIRoute } from 'astro';
import { laravelApi } from '@/libs/api';

export const GET: APIRoute = async () => {
  const res = await laravelApi('/auth/google');
  const data = await res.json();

  return Response.redirect(data.url, 302);
};
