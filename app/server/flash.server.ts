import { redirect, type Session } from 'react-router'
import { commitSession } from './session.server'
import type { ToastFlash } from '~/components/AppToaster'

// Definimos los mismos tipos que usas en session.server.ts para coherencia
type SessionData = {
  token: string
  userId: number
}

type SessionFlashData = {
  toast: ToastFlash
}

type FlashOptions = {
  title: string
  redirectTo: string
}

/**
 * Lógica para emitir un toast de éxito y redirigir
 */
export async function flashSuccess(
  session: Session<SessionData, SessionFlashData>,
  options: FlashOptions,
) {
  const toast: ToastFlash = {
    kind: 'success',
    title: options.title,
  }

  session.flash('toast', toast)

  return redirect(options.redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}

/**
 * Lógica para emitir un toast de error y redirigir
 */
export async function flashError(
  session: Session<SessionData, SessionFlashData>,
  options: FlashOptions,
) {
  const toast: ToastFlash = {
    kind: 'error',
    title: options.title ?? 'Error',
  }

  session.flash('toast', toast)

  return redirect(options.redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}
