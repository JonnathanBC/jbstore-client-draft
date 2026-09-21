import { Outlet, data } from 'react-router'
import type { Route } from './+types/_app'
import { Header } from '~/components/shared/Header'
import { Footer } from '~/components/shared/Footer'
import { fetchMe, getOptionalAuth } from '~/server/auth.server'
import { getCart } from '~/server/cart.server'
import { Navbar } from '~/components/shared/Navbar'
import { commitSession, getSession } from '~/server/session.server'
import { AppToaster, type ToastFlash } from '~/components/AppToaster'

async function loadUser(request: Request) {
  const auth = await getOptionalAuth(request)
  if (!auth) return { user: null, isAdmin: false }

  try {
    const user = await fetchMe(auth.token)
    return { user, isAdmin: user.role === 'ROLE_ADMIN' }
  } catch {
    return { user: null, isAdmin: false }
  }
}

async function loadCartCount(request: Request) {
  const auth = await getOptionalAuth(request)
  if (!auth) return 0

  try {
    const cart = await getCart(auth.token)
    return 'error' in cart ? 0 : cart.count
  } catch {
    return 0
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const [auth, cartCount, session] = await Promise.all([
    loadUser(request),
    loadCartCount(request),
    getSession(request.headers.get('Cookie')),
  ])

  const toast = (session.get('toast') as ToastFlash | undefined) ?? null

  return data(
    { ...auth, cartCount, toast },
    { headers: { 'Set-Cookie': await commitSession(session) } },
  )
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { user, isAdmin, cartCount, toast } = loaderData

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <Header user={user} isAdmin={isAdmin} cartCount={cartCount} />

      <Navbar />
      <main className="w-full flex-1">
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </main>
      <Footer />
      <AppToaster toast={toast} />
    </div>
  )
}
