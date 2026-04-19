import { apiClient, toActionError } from '@/services/api';
import type { Family } from '@/types/family';
import { z } from 'astro/zod';
import { defineAction } from 'astro:actions';

export const updateFamily = defineAction({
  accept: 'form',
  input: z.object({
    id: z.coerce.number().int().min(1),
    name: z.string(),
  }),
  handler: async ({ id, ...payload }, { cookies }) => {
    const token = cookies.get('auth_token')?.value;
    const api = apiClient(token);

    try {
      const { data } = await api.patch<Family>(`/api/families/${id}`, payload);
      return data;
    } catch (err) {
      throw toActionError(err);
    }
  },
});
