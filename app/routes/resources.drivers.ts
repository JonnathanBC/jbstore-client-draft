import { requireAuth } from '~/server/auth.server'
import { getDrivers } from '~/server/drivers.server'
import { Route } from './+types/resources.drivers'

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)

  const drivers = await getDrivers({
    token,
    page: 1,
    per_page: 100,
  })

  return {
    items: drivers.data.map((d) => ({
      value: String(d.id),
      label: `${d.user.first_name} ${d.user.last_name} (${d.license_plate})`,
    })),
  }
}
