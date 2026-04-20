import { Outlet } from 'react-router';
import type { Route } from './+types/_app';
import { Header } from '~/components/shared/Header';
import { Footer } from '~/components/shared/Footer';
import { fetchMe, getOptionalAuth } from '~/server/auth.server';

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await getOptionalAuth(request);
  if (!auth) return { user: null, isAdmin: false };

  try {
    const user = await fetchMe(auth.token);
    return { user, isAdmin: user.role === 'ROLE_ADMIN' };
  } catch {
    return { user: null, isAdmin: false };
  }
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { user, isAdmin } = loaderData;
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header user={user} isAdmin={isAdmin} />
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
