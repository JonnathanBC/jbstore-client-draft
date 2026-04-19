import { apiClient, toActionError } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type { Family } from '@/types/family';
import { z } from 'astro/zod';
import { defineAction } from 'astro:actions';

export const getFamily = defineAction({
  accept: 'json',
  input: z.object({
    id: z.number().int().min(1).optional(),
  }),
  handler: async (input, { cookies }) => {
    const token = cookies.get('auth_token')?.value;
    const api = apiClient(token);

    try {
      const { data } = await api.get<Family>(`/api/families/${input.id}`);
      return data;
    } catch (err) {
      throw toActionError(err);
    }
  },
});
