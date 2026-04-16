import { laravelApi, toActionError } from '@/libs/api';
import type { ApiResponse } from '@/types/api';
import type { Family } from '@/types/family';
import { z } from 'astro/zod';
import { defineAction } from 'astro:actions';

export const getFamiliesAction = defineAction({
  accept: 'json',
  input: z.object({
    page: z.number().int().min(1).optional(),
    per_page: z.number().int().min(1).max(100).optional(),
    name: z.string().optional(),
  }),
  handler: async (input, { cookies }) => {
    const token = cookies.get('auth_token')?.value;
    const api = laravelApi(token);

    try {
      const { data } = await api.get<ApiResponse<Family>>('/api/families', {
        params: input,
      });
      return data;
    } catch (err) {
      throw toActionError(err);
    }
  },
});
