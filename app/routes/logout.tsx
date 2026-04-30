import { redirect } from 'react-router'
import type { Route } from './+types/logout'
import { logoutBackend } from '~/server/auth.server'
import { destroySession, getSession } from '~/server/session.server'

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const token = session.get('token')
  if (token) {
    await logoutBackend(token)
  }
  return redirect('/login', {
    headers: { 'Set-Cookie': await destroySession(session) },
  })
}

export async function loader() {
  return redirect('/')
}
