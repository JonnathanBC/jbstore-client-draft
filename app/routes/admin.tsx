import { Outlet, data } from 'react-router'
import type { Route } from './+types/admin'
import { requireAdmin } from '~/server/auth.server'
import { commitSession, getSession } from '~/server/session.server'
import { Sidebar } from '~/components/admin/Sidebar'
import { Breadcrumbs } from '~/components/shared/Breadcrumbs'
import { RouteErrorContent } from '~/components/shared/RouteErrorContent'
import { AppToaster, type ToastFlash } from '~/components/AppToaster'
import type { RouteHandle } from '~/types/route'
import { fetchMe } from '~/server/user.server'

export const handle: RouteHandle = { breadcrumb: 'Dashboard' }

export const meta: Route.MetaFunction = () => [
  { title: 'Panel de Administración | JB Store' },
]

export async function loader({ request }: Route.LoaderArgs) {
  // El guard es el mismo que usan todos los loaders hijos; acá además traemos el user para el Sidebar
  const { token } = await requireAdmin(request)
  const [user, session] = await Promise.all([
    fetchMe(token),
    getSession(request.headers.get('Cookie')),
  ])
  const toast = (session.get('toast') as ToastFlash | undefined) ?? null

  return data(
    { user, toast },
    { headers: { 'Set-Cookie': await commitSession(session) } },
  )
}

// Reemplaza al layout entero: por eso redibuja el Sidebar y no deja al admin sin navegación
export function ErrorBoundary() {
  return (
    <>
      <Sidebar />
      <div className="min-h-screen px-4 py-6 sm:ml-64">
        <main className="border-weak rounded-lg border border-dashed p-4">
          <RouteErrorContent homeTo="/admin" />
        </main>
      </div>
    </>
  )
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { toast } = loaderData

  return (
    <>
      <Sidebar />
      <div className="min-h-screen px-4 py-6 sm:ml-64">
        <Breadcrumbs />
        <main className="border-weak rounded-lg border border-dashed p-4">
          <Outlet />
        </main>
        <AppToaster toast={toast} />
      </div>
    </>
  )
}
