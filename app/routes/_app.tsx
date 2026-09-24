import { Outlet, data } from 'react-router'
import type { Route } from './+types/_app'
import { Header } from '~/components/shared/Header'
import { Footer } from '~/components/shared/Footer'
import { getOptionalAuth } from '~/server/auth.server'
import { getCart } from '~/server/cart.server'
import { getGuestCart, guestCartCount } from '~/server/guestCart.server'
import { Navbar } from '~/components/shared/Navbar'
import { commitSession, getSession } from '~/server/session.server'
import { AppToaster, type ToastFlash } from '~/components/AppToaster'
import { fetchMe } from '~/server/user.server'

async function loadUser(token: string | undefined) {
  if (!token) return { user: null, isAdmin: false }

  try {
    const user = await fetchMe(token)
    return { user, isAdmin: user.role === 'ROLE_ADMIN' }
  } catch {
    return { user: null, isAdmin: false }
  }
}

async function loadCartCount(request: Request, token: string | undefined) {
  if (!token) return guestCartCount(await getGuestCart(request))

  const cart = await getCart(token)
  return 'error' in cart ? 0 : cart.count
}

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await getOptionalAuth(request)
  const [userData, cartCount, session] = await Promise.all([
    loadUser(auth?.token),
    loadCartCount(request, auth?.token),
    getSession(request.headers.get('Cookie')),
  ])

  const toast = (session.get('toast') as ToastFlash | undefined) ?? null

  return data(
    { ...userData, cartCount, toast },
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
