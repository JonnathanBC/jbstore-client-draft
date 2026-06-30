import { Outlet } from 'react-router'
import type { Route } from './+types/_app'
import { Header } from '~/components/shared/Header'
import { Footer } from '~/components/shared/Footer'
import { fetchMe, getOptionalAuth } from '~/server/auth.server'
import { Navbar } from '~/components/shared/Navbar'

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await getOptionalAuth(request)
  if (!auth) return { user: null, isAdmin: false }

  try {
    const user = await fetchMe(auth.token)
    return { user, isAdmin: user.role === 'ROLE_ADMIN' }
  } catch {
    return { user: null, isAdmin: false }
  }
}


export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { user, isAdmin } = loaderData
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <Header user={user} isAdmin={isAdmin} />

      <Navbar />
      <main className="w-full flex-1">
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
