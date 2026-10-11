import { requireAdmin } from '~/server/auth.server'
import { getOptions } from '~/server/options.server'
import { Route } from './+types/resources.categories'

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAdmin(request)

  const options = await getOptions({
    token,
    page: 1,
    per_page: 10,
  })

  return {
    items: options.data.map((f) => ({
      value: String(f.id),
      label: f.name,
    })),
  }
}
