import { requireAuth } from '~/server/auth.server'
import { getUsers } from '~/server/user.server'
import { Route } from './+types/resources.users'

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? undefined

  const users = await getUsers({ token, search })

  return {
    items: users.map((u) => ({
      value: String(u.id),
      label: [u.name, u.last_name].filter(Boolean).join(' ') + ` (${u.email})`,
    })),
  }
}
