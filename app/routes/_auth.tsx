import { Outlet, data, redirect } from 'react-router'
import type { Route } from './+types/_auth'
import { getOptionalAuth } from '~/server/auth.server'
import { fetchMe } from '~/server/user.server'
import { destroySession, getSession } from '~/server/session.server'

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await getOptionalAuth(request)
  if (auth) {
    try {
      await fetchMe(auth.token)
      throw redirect('/')
    } catch (error) {
      if (error instanceof Response) throw error

      const session = await getSession(request.headers.get('Cookie'))
      return data(null, {
        headers: { 'Set-Cookie': await destroySession(session) },
      })
    }
  }
  return null
}

export default function AuthLayout() {
  return (
    <main className="min-h-screen w-full bg-white">
      <Outlet />
    </main>
  )
}
