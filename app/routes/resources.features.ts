import { requireAuth } from '~/server/auth.server'
import { getFeatures } from '~/server/feature.server'
import { Route } from './+types/resources.categories'

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)

  const url = new URL(request.url)
  const optionId = url.searchParams.get('option_id')

  const features = await getFeatures({
    token,
    page: 1,
    per_page: 10,
    option_id: optionId,
  })

  return {
    items: features.data.map((f) => ({
      value: String(f.id),
      label: f.value,
    })),
  }
}
