import { Outlet, data } from 'react-router'
import type { Route } from './+types/admin'
import { requireAuth, fetchMe } from '~/server/auth.server'
import { commitSession, getSession } from '~/server/session.server'
import { Sidebar } from '~/components/admin/Sidebar'
import { Navbar } from '~/components/admin/Navbar'
import { Breadcrumbs } from '~/components/shared/Breadcrumbs'
import { AppToaster, type ToastFlash } from '~/components/AppToaster'
import type { RouteHandle } from '~/types/route'
import { UserRole } from '~/types/user'

export const handle: RouteHandle = { breadcrumb: 'Dashboard' }

export const meta: Route.MetaFunction = () => [
  { title: 'Panel de Administración | JB Store' },
]

async function requireAdmin(request: Request) {
  const { token } = await requireAuth(request)
  const user = await fetchMe(token)

  if (user.role !== UserRole.ADMIN) {
    throw new Response('This action is unauthorized.', {
      status: 403,
      statusText: 'FORBIDDEN',
    })
  }

  return user
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAdmin(request)
  const session = await getSession(request.headers.get('Cookie'))
  const toast = (session.get('toast') as ToastFlash | undefined) ?? null

  return data(
    { user, toast },
    { headers: { 'Set-Cookie': await commitSession(session) } },
  )
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user, toast } = loaderData

  return (
    <>
      <Navbar user={user} />
      <Sidebar />
      <div className="min-h-screen p-4 pt-18 sm:ml-64">
        <Breadcrumbs />
        <main className="border-weak rounded-lg border border-dashed p-4">
          <Outlet />
        </main>
        <AppToaster toast={toast} />
      </div>
    </>
  )
}
