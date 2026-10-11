import { redirect } from 'react-router'
import type { Route } from './+types/api.auth.google.callback'
import { createUserSession, exchangeGoogleCode } from '~/server/auth.server'
import { clearOAuthState, verifyOAuthState } from '~/server/oauthState.server'

const loginWithError = async () =>
  redirect('/login?error=google', {
    headers: { 'Set-Cookie': await clearOAuthState() },
  })

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // Sin state válido no canjeamos nada: protege contra login-CSRF
  if (
    !code ||
    !(await verifyOAuthState(request, url.searchParams.get('state')))
  ) {
    return loginWithError()
  }

  const result = await exchangeGoogleCode(code)
  if ('error' in result) return loginWithError()

  const response = await createUserSession({
    request,
    token: result.token,
    userId: result.user.id,
  })
  // El state es de un solo uso: lo borramos al terminar
  response.headers.append('Set-Cookie', await clearOAuthState())

  return response
}
