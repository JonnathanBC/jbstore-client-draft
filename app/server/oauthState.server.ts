import { randomBytes, timingSafeEqual } from 'node:crypto'
import { createCookie } from 'react-router'

/**
 * Anti login-CSRF del login con Google: el `state` se guarda en una cookie de ESTE navegador
 * y Google lo devuelve en el callback. Si no coincide, alguien nos mandó un link con su propio login.
 */
const oauthStateCookie = createCookie('oauth_state', {
  httpOnly: true,
  // lax (no strict): el callback llega como navegación top-level desde Google y tiene que traer la cookie
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth/google',
  maxAge: 60 * 10,
  secrets: [process.env.SESSION_SECRET!],
})

export async function createOAuthState() {
  // hex: el backend exige alfanumérico de 32 a 128 chars
  const state = randomBytes(32).toString('hex')

  return { state, setCookie: await oauthStateCookie.serialize(state) }
}

export async function verifyOAuthState(
  request: Request,
  received: string | null,
) {
  const expected: unknown = await oauthStateCookie.parse(
    request.headers.get('Cookie'),
  )

  if (typeof expected !== 'string' || !received) return false

  const a = Buffer.from(expected)
  const b = Buffer.from(received)
  // timingSafeEqual: comparar en tiempo constante, no revela cuántos chars coinciden
  return a.length === b.length && timingSafeEqual(a, b)
}

export const clearOAuthState = () =>
  oauthStateCookie.serialize('', { maxAge: 0 })
