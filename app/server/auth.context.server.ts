import { AxiosError } from 'axios'
import {
  createContext,
  redirect,
  type MiddlewareFunction,
  type RouterContextProvider,
} from 'react-router'

import { UserRole, type User } from '~/types/user'
import { commitSession, destroySession, getSession } from './session.server'
import { fetchMe } from './user.server'

/**
 * ÚNICO lugar de la seguridad de rutas.
 *
 * - root:            loadUserMiddleware    → resuelve el usuario una vez por request
 * - admin.tsx:       requireAdminMiddleware → protege TODOS los loaders/actions admin.*
 * - _app._private:   requireUserMiddleware  → checkout, address...
 * - resources.*:     requireAdminMiddleware (no cuelgan del layout admin)
 *
 * Los middlewares corren ANTES que los loaders (que corren en paralelo entre sí),
 * así que los loaders leen el usuario del context sin volver a pedirlo a la API.
 */

export type SessionUser = { token: string; user: User }

const sessionUserContext = createContext<SessionUser | null>(null)

type Context = Readonly<RouterContextProvider>

/** Usuario logueado o null (páginas públicas). */
export const getSessionUser = (context: Context) =>
  context.get(sessionUserContext)

/**
 * Para loaders/actions bajo un guard: si falta, es un error de programación
 * (la ruta no está debajo de requireUserMiddleware/requireAdminMiddleware), no del usuario.
 */
export function requireSessionUser(context: Context): SessionUser {
  const sessionUser = context.get(sessionUserContext)
  if (!sessionUser) {
    throw new Error(
      'requireSessionUser: la ruta no está protegida por un middleware de auth',
    )
  }
  return sessionUser
}

const isUnauthorized = (err: unknown) =>
  err instanceof AxiosError && err.response?.status === 401

export const loadUserMiddleware: MiddlewareFunction<Response> = async (
  { request, context },
  next,
) => {
  const session = await getSession(request.headers.get('Cookie'))
  const token = session.get('token')
  if (!token) return next()

  try {
    context.set(sessionUserContext, { token, user: await fetchMe(token) })
  } catch (err) {
    if (!isUnauthorized(err)) throw err

    // Token vencido o revocado: seguimos como invitado y limpiamos la cookie
    const response = await next()
    response.headers.append('Set-Cookie', await destroySession(session))
    return response
  }

  return next()
}

function redirectToLogin(request: Request) {
  const url = new URL(request.url)
  const redirectTo = url.pathname + url.search
  return redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)
}

export const requireUserMiddleware: MiddlewareFunction<Response> = async (
  { request, context },
  next,
) => {
  if (!context.get(sessionUserContext)) throw redirectToLogin(request)
  return next()
}

export const requireAdminMiddleware: MiddlewareFunction<Response> = async (
  { request, context },
  next,
) => {
  const sessionUser = context.get(sessionUserContext)
  if (!sessionUser) throw redirectToLogin(request)

  if (sessionUser.user.role !== UserRole.ADMIN) {
    // Logueado pero sin permiso: al inicio con aviso (Laravel igual valida con can:admin)
    const session = await getSession(request.headers.get('Cookie'))
    session.flash('toast', {
      kind: 'error',
      title: 'No tenés permiso para entrar al panel de administración',
    })
    throw redirect('/', {
      headers: { 'Set-Cookie': await commitSession(session) },
    })
  }

  return next()
}
