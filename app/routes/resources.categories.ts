import { requireAuth } from '~/server/auth.server'
import { getCategories } from '~/server/categories.server'
import { Route } from './+types/resources.categories'

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)

  const url = new URL(request.url)
  const familyId = url.searchParams.get('family_id')

  const categories = await getCategories({
    token,
    page: 1,
    per_page: 10,
    family_id: familyId ?? undefined,
  })

  return {
    items: categories.data.map((c) => ({
      value: String(c.id),
      label: c.name,
      subcategories: (c.subcategories ?? []).map((s) => ({
        value: String(s.id),
        label: s.name,
      })),
    })),
  }
}
