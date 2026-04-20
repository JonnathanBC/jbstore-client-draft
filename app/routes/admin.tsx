import { Outlet, data } from 'react-router';
import type { Route } from './+types/admin';
import { requireAuth, fetchMe } from '~/server/auth.server';
import { commitSession, getSession } from '~/server/session.server';
import { Sidebar } from '~/components/admin/Sidebar';
import { Navbar } from '~/components/admin/Navbar';
import { Breadcrumbs } from '~/components/shared/Breadcrumbs';
import { AppToaster, type ToastFlash } from '~/components/AppToaster';
import type { RouteHandle } from '~/types/route';

export const handle: RouteHandle = { breadcrumb: 'Dashboard' };

export const meta: Route.MetaFunction = () => [{ title: 'Panel de Administración | JB Store' }];

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request);
  const user = await fetchMe(token);

  const session = await getSession(request.headers.get('Cookie'));
  const toast = (session.get('toast') as ToastFlash | undefined) ?? null;

  return data(
    { user, toast },
    { headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user, toast } = loaderData;

  return (
    <>
      <Navbar user={user} />
      <Sidebar />
      <div className="p-4 sm:ml-64 min-h-screen pt-18">
        <Breadcrumbs />
        <main className="p-4 border border-gray-200 border-dashed rounded-lg">
          <Outlet />
        </main>
        <AppToaster toast={toast} />
      </div>
    </>
  );
}
