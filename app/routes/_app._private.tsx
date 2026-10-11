import { Outlet } from 'react-router'
import type { Route } from './+types/_app._private'
import { requireUserMiddleware } from '~/server/auth.context.server'

/**
 * Layout sin path (no agrega segmento a la URL): todo lo que cuelga de acá exige login.
 * Para proteger una ruta nueva alcanza con nombrarla `_app._private.<ruta>.tsx`.
 */
export const middleware: Route.MiddlewareFunction[] = [requireUserMiddleware]

export default function PrivateLayout() {
  return <Outlet />
}
