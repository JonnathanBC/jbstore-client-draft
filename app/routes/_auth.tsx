import { Outlet, redirect } from 'react-router'
import type { Route } from './+types/_auth'
import { getSessionUser } from '~/server/auth.context.server'

// Login/registro no tienen sentido logueado. Un token vencido ya lo limpió el middleware del root.
export function loader({ context }: Route.LoaderArgs) {
  if (getSessionUser(context)) throw redirect('/')
  return null
}

export default function AuthLayout() {
  return (
    <main className="min-h-screen w-full bg-white">
      <Outlet />
    </main>
  )
}
