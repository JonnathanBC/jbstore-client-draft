import { z } from 'astro/zod';

export const familySchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const familiesPaginatedSchema = z.object({
  data: z.array(familySchema),
  current_page: z.number(),
  last_page: z.number(),
  per_page: z.number(),
  total: z.number(),
});

export type Family = z.infer<typeof familySchema>;
export type FamiliesPaginated = z.infer<typeof familiesPaginatedSchema>;
