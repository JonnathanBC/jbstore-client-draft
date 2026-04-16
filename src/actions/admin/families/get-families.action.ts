import { laravelApi } from '@/libs/api';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';

export const getFamiliesAction = defineAction({
  accept: 'json',
  input: z.object({
    name: z.string().optional(),
  }),
  handler: async (input, { cookies }) => {
    const token = cookies.get('auth_token')?.value;

    const res = await laravelApi('api/families', {}, token);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ActionError({
        code: res.status === 401 ? 'UNAUTHORIZED' : 'BAD_REQUEST',
        message: data?.message ?? `Laravel respondió ${res.status}`,
      });
    }

    return data;
  },
});
