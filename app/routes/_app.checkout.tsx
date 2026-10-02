import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'
import type { Route } from './+types/_app.checkout'
import { CreditCardIcon, Info } from 'lucide-react'
import { requireAuth } from '~/server/auth.server'
import { getPaymentSessionToken } from '~/server/payments.server'
import { getCart } from '~/server/cart.server'
import { niubizPublicConfig } from '~/server/niubiz.server'
import { useNiubizScript, waitForNiubizModal } from '~/hooks/useNiubizScript'
import { getSession } from '~/server/session.server'
import { formatNiubizDate } from '~/lib/niubiz'

export const meta: Route.MetaFunction = () => [{ title: 'Checkout | JB Store' }]

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuth(request)
  // Checkout exige login: usamos el carrito de Laravel, que trae envío y total.
  const cart = await getCart(auth.token)
  if ('error' in cart) {
    throw new Response(cart.error.message, { status: cart.error.status })
  }
  // Lo deja /checkout/paid si Niubiz rechazó el pago. El layout _app lo consume.
  const session = await getSession(request.headers.get('Cookie'))
  const paymentError = session.get('paymentError') ?? null

  return {
    cart,
    niubiz: niubizPublicConfig,
    paymentError,
  }
}

// Niubiz exige un número de compra numérico, único y de hasta 12 dígitos.
const generatePurchaseNumber = () => String(Date.now()).slice(-12)

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuth(request)

  const result = await getPaymentSessionToken(auth.token)

  if ('error' in result) {
    return {
      error: result.error.message || 'No se pudo iniciar el pago con Niubiz',
    }
  }

  return {
    token: result.sessionKey,
    amount: result.amount,
    purchaseNumber: generatePurchaseNumber(),
  }
}

export default function CheckoutPage({ loaderData }: Route.ComponentProps) {
  const [paymentType, setPaymentType] = useState<
    'card-credit' | 'bank-deposit'
  >('card-credit')

  const { niubiz, paymentError } = loaderData
  const niubizLoaded = useNiubizScript(niubiz.scriptUrl)
  const fetcher = useFetcher<typeof action>()
  const [openingModal, setOpeningModal] = useState(false)
  const isBusy = fetcher.state !== 'idle' || openingModal

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if ('error' in fetcher.data) {
      toast.error(fetcher.data.error)
      return
    }
    if (!window.VisanetCheckout) {
      toast.error('El checkout de Niubiz no se pudo cargar')
      return
    }

    const { token, amount, purchaseNumber } = fetcher.data

    // amount viene de Laravel con el envío incluido: el front no lo recalcula.
    const params = new URLSearchParams({
      purchaseNumber,
      amount: String(amount),
    })

    // Niubiz resuelve las rutas relativas contra SU dominio: van absolutas.
    const absolute = (path: string) =>
      new URL(path, window.location.origin).href

    window.VisanetCheckout.configure({
      sessiontoken: token,
      channel: 'web',
      merchantid: niubiz.merchantId,
      purchasenumber: purchaseNumber,
      amount,
      expirationminutes: '20',
      timeouturl: absolute('/checkout'),
      formbuttoncolor: '#000000',
      action: absolute(`/checkout/paid?${params}`),
    })
    setOpeningModal(true)
    waitForNiubizModal().then(() => setOpeningModal(false))
    window.VisanetCheckout.open()
  }, [fetcher.state, fetcher.data, niubiz.merchantId])

  return (
    <div className="mb-16 text-gray-700">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="col-span-1">
          <div className="ml-auto px-4 py-12 sm:pl-6 lg:max-w-160 lg:pr-8 lg:pl-8">
            <h1 className="mb-2 text-2xl font-semibold">Pago</h1>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
              <ul className="divide-y divide-gray-200">
                <li>
                  <label className="flex items-center p-4">
                    <input
                      type="radio"
                      name="payment"
                      defaultChecked={paymentType === 'card-credit'}
                      value={paymentType}
                      onChange={() => setPaymentType('card-credit')}
                    />
                    <span className="ml-2">Tarjeta de débito / crédito</span>
                    <img
                      src="https://codersfree.com/img/payments/credit-cards.png"
                      alt="cards credit images"
                      className="ml-auto h-6"
                    />
                  </label>
                  {paymentType === 'card-credit' && (
                    <div className="border-t border-gray-200 bg-gray-100 p-4 text-center">
                      <CreditCardIcon className="mx-auto size-20" />
                      <p className="mt-2">
                        Luego de hacer click en pagar ahora se abrirá el
                        checkout de Niubiz para completar tu compra y de forma
                        segura
                      </p>
                    </div>
                  )}
                </li>

                <li>
                  <label className="flex items-center p-4">
                    <input
                      type="radio"
                      name="payment"
                      value={paymentType}
                      onChange={() => setPaymentType('bank-deposit')}
                    />
                    <span className="ml-2">Deposito bancario</span>
                  </label>

                  {paymentType === 'bank-deposit' && (
                    <div className="flex justify-center border-t border-gray-200 bg-gray-100 p-4">
                      <div>
                        <p>1. Pago por depósito o transferencia bancaria</p>
                        <p>- JEP: 4044848484848</p>
                        <p>-CCI: 002-090990-09</p>
                        <p>- Razón social: Jonnathan Baculima</p>
                        <p>- RUC: 0101010101</p>
                        <p>2. Pago por YAPE</p>
                        <p>- Yape al número: 9809809809</p>
                        <p>- Jonnathan Baculima</p>
                        <p className="font-bold">
                          Enviar comprobante a: 099 909 9090
                        </p>
                      </div>
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div className="mr-auto px-4 py-12 sm:pr-6 lg:max-w-160 lg:pr-8 lg:pl-8">
            <ul className="mb-4 space-y-4">
              {loaderData.cart.items.map((cart) => (
                <li className="flex items-center space-x-4" key={cart.id}>
                  <div className="shrink-0">
                    <img
                      src={cart.options.image}
                      className="aspect-square size-14 rounded object-cover"
                      alt="Image product"
                    />
                  </div>
                  <div className="flex-1">
                    <p>{cart.name}</p>
                    <p className="text-sm text-gray-500">
                      <span>{cart.qty} X </span>
                      <span>${cart.price}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex justify-between">
              <p>Subtotal</p>
              <p>${loaderData.cart.subtotal}</p>
            </div>

            <div className="mt-2 flex justify-between">
              <p className="flex items-center gap-1">
                Precio de envío
                <span
                  title={`El precio de envío es de ${loaderData.cart.shipping} dólares`}
                >
                  <Info className="size-4" />
                </span>
              </p>
              <p>${loaderData.cart.shipping}</p>
            </div>

            <hr className="my-3" />

            <div className="mb-4 flex justify-between text-lg font-semibold">
              <p className="text-lg font-semibold">Total</p>
              <p>${loaderData.cart.total}</p>
            </div>

            {paymentType === 'card-credit' && (
              <fetcher.Form method="post">
                <button
                  type="submit"
                  disabled={!niubizLoaded || isBusy}
                  className="btn btn-primary mt-4 w-full"
                >
                  {isBusy ? 'Procesando...' : 'Finalizar pedido'}
                </button>
              </fetcher.Form>
            )}

            {paymentError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
              >
                <p className="font-bold">{paymentError.message}</p>
                <p className="mt-2">
                  <span className="font-medium">Número de pedido:</span>{' '}
                  {paymentError.purchaseNumber}
                </p>
                {paymentError.transactionDate && (
                  <p>
                    <span className="font-medium">
                      Fecha y hora del pedido:
                    </span>{' '}
                    {formatNiubizDate(paymentError.transactionDate)}
                  </p>
                )}
                {paymentError.card && (
                  <p>
                    <span className="font-medium">Tarjeta:</span>{' '}
                    {paymentError.card}
                    {paymentError.brand &&
                      ` (${paymentError.brand.toUpperCase()})`}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
