import { requireAuth } from '~/server/auth.server';
import { getCategories } from '~/server/categories.server';

export async function loader({ request }: any) {
  const { token } = await requireAuth(request);
  const categories = await getCategories({
    token,
    page: 1,
    per_page: 10,
  });

  return {
    items: categories.data.map((f) => ({
      value: String(f.id),
      label: f.name,
    })),
  };
}
