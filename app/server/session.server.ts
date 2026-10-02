import { createCookieSessionStorage } from 'react-router'
import type { ToastFlash } from '~/components/AppToaster'

type SessionData = {
  token: string
  userId: number
}

// Resumen del pago para la página de gracias. Va en la cookie (máx ~4KB),
// por eso guardamos sólo lo que se muestra y no la respuesta entera de Niubiz.
export type PaymentFlash = {
  purchaseNumber: string
  amount: number
  currency: string
  card: string
  brand: string
  transactionDate: string
}

// Pago rechazado: si Niubiz no devuelve `data` (ej: error de autenticación),
// la fecha y la tarjeta no existen.
export type PaymentErrorFlash = {
  message: string
  purchaseNumber: string
  transactionDate?: string
  card?: string
  brand?: string
}

type SessionFlashData = {
  toast: ToastFlash
  payment: PaymentFlash
  paymentError: PaymentErrorFlash
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
