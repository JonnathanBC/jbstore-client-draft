import { Outlet, data } from 'react-router'
import type { Route } from './+types/admin'
import {
  requireAdminMiddleware,
  requireSessionUser,
} from '~/server/auth.context.server'
import { commitSession, getSession } from '~/server/session.server'
import { Sidebar } from '~/components/admin/Sidebar'
import { Breadcrumbs } from '~/components/shared/Breadcrumbs'
import { RouteErrorContent } from '~/components/shared/RouteErrorContent'
import { AppToaster, type ToastFlash } from '~/components/AppToaster'
import type { RouteHandle } from '~/types/route'

export const handle: RouteHandle = { breadcrumb: 'Dashboard' }

export const meta: Route.MetaFunction = () => [
  { title: 'Panel de Administración | JB Store' },
]

// Protege este layout Y todos sus hijos (loaders + actions de admin.*): ningún hijo repite el chequeo
export const middleware: Route.MiddlewareFunction[] = [requireAdminMiddleware]

export async function loader({ request, context }: Route.LoaderArgs) {
  // Ya lo resolvió el middleware del root: sin request extra a /api/user/me
  const { user } = requireSessionUser(context)
  const session = await getSession(request.headers.get('Cookie'))
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
