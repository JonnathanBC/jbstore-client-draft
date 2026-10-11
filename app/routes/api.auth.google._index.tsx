import { redirect } from 'react-router'
import type { Route } from './+types/api.auth.google._index'
import { fetchGoogleOAuthUrl } from '~/server/auth.server'
import { createOAuthState } from '~/server/oauthState.server'

export async function loader(_args: Route.LoaderArgs) {
  const { state, setCookie } = await createOAuthState()
  const url = await fetchGoogleOAuthUrl(state)

  return redirect(url, { headers: { 'Set-Cookie': setCookie } })
}
