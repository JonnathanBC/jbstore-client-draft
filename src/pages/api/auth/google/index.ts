import type { APIRoute } from 'astro';
import { apiClient } from '@/services/api';

export const GET: APIRoute = async () => {
  const res = await apiClient('/auth/google');
  const data = await res.json();

  return Response.redirect(data.url, 302);
};
