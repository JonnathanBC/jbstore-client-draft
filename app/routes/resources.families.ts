import { getFamilies } from '~/server/api.server'
import { requireAuth } from '~/server/auth.server'
import { Route } from './+types/resources.families'

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const families = await getFamilies({
    token,
    page: 1,
    pagination: false,
  })

  return {
    items: families?.data?.map((f) => ({
      value: String(f.id),
      label: f.name,
    })),
  }
}
