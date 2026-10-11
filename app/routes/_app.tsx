import { Outlet, data, useRouteLoaderData } from 'react-router'
import { RouteErrorContent } from '~/components/shared/RouteErrorContent'
import type { Route } from './+types/_app'
import { Header } from '~/components/shared/Header'
import { Footer } from '~/components/shared/Footer'
import { getSessionUser } from '~/server/auth.context.server'
import { UserRole } from '~/types/user'
import { getCartCount } from '~/server/cart.server'
import { getGuestCart, guestCartCount } from '~/server/guestCart.server'
import { Navbar } from '~/components/shared/Navbar'
import { commitSession, getSession } from '~/server/session.server'
import { AppToaster, type ToastFlash } from '~/components/AppToaster'

async function loadCartCount(request: Request, token: string | undefined) {
  if (!token) return guestCartCount(await getGuestCart(request))

  const cart = await getCartCount(token)
  if ('error' in cart) {
    throw new Response(cart.error.message, { status: cart.error.status })
  }

  return cart.count
}

export async function loader({ request, context }: Route.LoaderArgs) {
  // El middleware del root ya resolvió el usuario (y limpió la cookie si el token venció)
  const sessionUser = getSessionUser(context)
  const user = sessionUser?.user ?? null
  const userData = { user, isAdmin: user?.role === UserRole.ADMIN }

  const [cartCount, session] = await Promise.all([
    loadCartCount(request, sessionUser?.token),
    getSession(request.headers.get('Cookie')),
  ])

  const toast = (session.get('toast') as ToastFlash | undefined) ?? null
  // Flash de un solo uso: /checkout/thanks lo lee de la cookie entrante en
  // paralelo, y este layout es el único que reescribe la cookie. Leer un flash
  // con get() lo consume.
  session.get('payment')
  session.get('paymentError')

  return data(
    { ...userData, cartCount, toast },
    { headers: { 'Set-Cookie': await commitSession(session) } },
  )
}

// Reemplaza al layout entero: redibuja Header/Footer para que un 404 no deje al usuario sin navegación
export function ErrorBoundary() {
  // Si falló una ruta hija, los datos de este layout siguen disponibles
  const layoutData = useRouteLoaderData<typeof loader>('routes/_app')

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <Header
        user={layoutData?.user ?? null}
        isAdmin={layoutData?.isAdmin ?? false}
        cartCount={layoutData?.cartCount ?? 0}
      />
      <main className="w-full flex-1">
        <div className="mx-auto max-w-7xl p-6">
          <RouteErrorContent />
        </div>
      </main>
      <Footer />
    </div>
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
