import { laravelApi } from '@/libs/api';
import { familiesPaginatedSchema } from '@/schemas/family.schema';
import { z } from 'astro/zod';
import { ActionError, defineAction } from 'astro:actions';

export const getFamiliesAction = defineAction({
  accept: 'json',
  input: z.object({
    name: z.string().optional(),
  }),
  handler: async (_input, { cookies }) => {
    const token = cookies.get('auth_token')?.value;

    const res = await laravelApi('api/families', {}, token);
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ActionError({
        code: res.status === 401 ? 'UNAUTHORIZED' : 'BAD_REQUEST',
        message: body?.message ?? `Laravel respondió ${res.status}`,
      });
    }

    const parsed = familiesPaginatedSchema.safeParse(body);
    if (!parsed.success) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Respuesta inesperada de Laravel: ${parsed.error.message}`,
      });
    }

    return parsed.data;
  },
});
