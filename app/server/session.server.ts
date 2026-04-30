import { createCookieSessionStorage } from 'react-router'
import type { ToastFlash } from '~/components/AppToaster'

type SessionData = {
  token: string
  userId: number
}

type SessionFlashData = {
  toast: ToastFlash
}

const secret = process.env.SESSION_SECRET
if (!secret) {
  throw new Error('SESSION_SECRET env var is required')
}

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: 'auth_token',
      httpOnly: true,
      sameSite: 'lax',
      secrets: [secret],
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    },
  })
