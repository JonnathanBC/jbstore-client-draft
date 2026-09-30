import { redirect } from 'react-router'
import type { Route } from './+types/api.auth.google.callback'
import { createUserSession } from '~/server/auth.server'
import { fetchMe } from '~/server/user.server'

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return redirect('/login')
  }

  const user = await fetchMe(token)

  return createUserSession({ request, token, userId: user.id })
}
