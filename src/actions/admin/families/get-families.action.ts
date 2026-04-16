import { laravelApi } from '@/libs/api';
import type { ApiResponse } from '@/types/api';
import type { Family } from '@/types/family';
import { z } from 'astro/zod';
import { ActionError, defineAction } from 'astro:actions';

export const getFamiliesAction = defineAction({
  accept: 'json',
  input: z.object({
    page: z.number().int().min(1).optional(),
    per_page: z.number().int().min(1).max(100).optional(),
    name: z.string().optional(),
  }),
  handler: async (input, { cookies }) => {
    const token = cookies.get('auth_token')?.value;

    const qs = new URLSearchParams();
    if (input.page) qs.set('page', String(input.page));
    if (input.per_page) qs.set('per_page', String(input.per_page));
    if (input.name) qs.set('name', input.name);

    const path = `api/families${qs.toString() ? `?${qs}` : ''}`;
    const res = await laravelApi(path, {}, token);
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ActionError({
        code: res.status === 401 ? 'UNAUTHORIZED' : 'BAD_REQUEST',
        message: body?.message ?? `Laravel respondió ${res.status}`,
      });
    }

    return body as ApiResponse<Family>;
  },
});
