import { apiClient, toActionError } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type { Family } from '@/types/family';
import { z } from 'astro/zod';
import { defineAction } from 'astro:actions';

export const createFamily = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string(),
  }),
  handler: async (input, { cookies }) => {
    const token = cookies.get('auth_token')?.value;
    const api = apiClient(token);

    try {
      const { data } = await api.post('/api/families', input);
      return data;
    } catch (err) {
      throw toActionError(err);
    }
  },
});
