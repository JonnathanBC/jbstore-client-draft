import { redirect } from 'react-router'
import type { Route } from './+types/_app.checkout_.paid'
import { requireAuth } from '~/server/auth.server'
import { capturePayment } from '~/server/payments.server'
import { commitSession, getSession } from '~/server/session.server'

// Sólo se llega acá por el POST que hace Niubiz al terminar el formulario.
export const loader = () => redirect('/checkout')

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuth(request)
  const session = await getSession(request.headers.get('Cookie'))

  const url = new URL(request.url)
  const formData = await request.formData()
  const transactionToken = String(formData.get('transactionToken') ?? '')
  const customerEmail = String(formData.get('customerEmail') ?? '')
  const channel = String(formData.get('channel') ?? '')

  const purchaseNumber = url.searchParams.get('purchaseNumber') ?? ''
  const amount = Number(url.searchParams.get('amount'))

  if (!transactionToken || !purchaseNumber || !amount) {
    session.flash('toast', {
      kind: 'error',
      title: 'No se pudo procesar el pago',
      description: 'Niubiz no devolvió los datos de la transacción',
    })
    return redirect('/checkout', {
      headers: { 'Set-Cookie': await commitSession(session) },
    })
  }

  const result = await capturePayment(auth.token, {
    amount,
    transactionToken,
    customerEmail,
    channel,
    purchaseNumber,
  })

  if ('error' in result) {
    session.flash('toast', {
      kind: 'error',
      title: 'El pago fue rechazado',
      description: result.error.message,
    })
    return redirect('/checkout', {
      headers: { 'Set-Cookie': await commitSession(session) },
    })
  }

  session.flash('payment', {
    purchaseNumber: result.order.purchaseNumber,
    amount: result.order.authorizedAmount,
    currency: result.order.currency,
    card: result.dataMap.CARD,
    brand: result.dataMap.BRAND,
    transactionDate: result.order.transactionDate,
  })
  return redirect('/checkout/thanks', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}
