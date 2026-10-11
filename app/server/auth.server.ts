import { redirect } from 'react-router'
import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import type { User } from '~/types/user'
import type { ToastFlash } from '~/components/AppToaster'
import { commitSession, getSession } from './session.server'
import { mergeGuestCartOnLogin } from './guestCart.server'

// Los guards de rutas (login/admin) viven en auth.context.server.ts

/**
 * Único punto de entrada para iniciar sesión (login, registro, Google...).
 * Crea la sesión y fusiona el carrito guest: si un login nuevo no pasa por
 * aquí, los items del invitado quedan huérfanos en la cookie.
 */
export async function createUserSession({
  request,
  token,
  user,
  redirectTo = '/',
  toast,
}: {
  request: Request
  token: string
  user: Pick<User, 'id'>
  redirectTo?: string
  toast?: ToastFlash
}) {
  const session = await getSession(request.headers.get('Cookie'))
  session.set('token', token)
  session.set('userId', user.id)
  if (toast) session.flash('toast', toast)

  const headers = new Headers({ 'Set-Cookie': await commitSession(session) })
  const clearGuest = await mergeGuestCartOnLogin(request, token)
  if (clearGuest) headers.append('Set-Cookie', clearGuest)

  return redirect(safeRedirect(redirectTo), { headers })
}

// Solo rutas internas: evita open redirect con redirectTo=https://sitio-malicioso.com
// Base ficticia: solo la usamos para que URL resuelva `to` como lo haría el navegador.
const INTERNAL_ORIGIN = 'http://internal.invalid'

function safeRedirect(to: string, fallback = '/') {
  // Los navegadores tratan `\` como `/`: `/\evil.com` termina siendo `//evil.com`
  if (!to.startsWith('/') || to.startsWith('//') || to.includes('\\')) {
    return fallback
  }

  // Doble chequeo: si al resolverla cambia de origen (ej. con tabs/saltos de línea), no es interna
  const url = new URL(to, INTERNAL_ORIGIN)
  return url.origin === INTERNAL_ORIGIN
    ? url.pathname + url.search + url.hash
    : fallback
}

export interface LoginResult {
  token: string
  user: User
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult | { error: ApiError }> {
  try {
    const { data } = await apiClient().post<{ token: string; user: User }>(
      '/api/auth/login',
      {
        email,
        password,
      },
    )
    return { token: data.token, user: data.user }
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export interface RegisterInput {
  name: string
  last_name: string
  phone: string
  email: string
  password: string
  password_confirmation: string
  document_type?: 'PP' | 'CI' | 'RUC'
  document_number?: string
}

export async function register(
  input: RegisterInput,
): Promise<LoginResult | { error: ApiError }> {
  try {
    const { data } = await apiClient().post<{ token: string; user: User }>(
      '/api/auth/register',
      input,
    )
    return { token: data.token, user: data.user }
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function logoutBackend(token: string): Promise<void> {
  try {
    const client = apiClient(token)
    await client.post('/api/auth/logout')
  } catch {
    // Best-effort: if backend logout fails, we still destroy the local session.
  }
}

export async function fetchGoogleOAuthUrl(state: string): Promise<string> {
  const { data } = await apiClient().get<{ url: string }>('/api/auth/google', {
    params: { state },
  })
  return data.url
}

/** Server-to-server: el token nunca pasa por la URL ni por el navegador. */
export async function exchangeGoogleCode(
  code: string,
): Promise<LoginResult | { error: ApiError }> {
  try {
    const { data } = await apiClient().post<LoginResult>(
      '/api/auth/google/exchange',
      { code },
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
