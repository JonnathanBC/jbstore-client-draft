import { Outlet, redirect } from 'react-router'
import type { Route } from './+types/_auth'
import { getOptionalAuth } from '~/server/auth.server'

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await getOptionalAuth(request)
  if (auth) throw redirect('/')
  return null
}

export default function AuthLayout() {
  return (
    <main className="min-h-screen w-full bg-white">
      <Outlet />
    </main>
  )
}
