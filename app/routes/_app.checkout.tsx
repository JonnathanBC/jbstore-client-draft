import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'
import type { Route } from './+types/_app.checkout'
import { CreditCardIcon } from 'lucide-react'
import { requireAuth } from '~/server/auth.server'
import { getPaymentSessionToken } from '~/server/payments.server'

export const meta: Route.MetaFunction = () => [{ title: 'Checkout | JB Store' }]

export async function loader({ request }: Route.LoaderArgs) {}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuth(request)

  const result = await getPaymentSessionToken(auth.token)

  if ('error' in result) {
    return {
      error:
        result.error.message ||
        'No se pudo marcar la dirección como predeterminada',
    }
  }

  return { token: result.sessionKey }
}

export default function CheckoutPage({ loaderData }: Route.ComponentProps) {
  const [paymentType, setPaymentType] = useState<
    'card-credit' | 'bank-deposit'
  >('card-credit')

  const fetcher = useFetcher<{
    error?: string
    token?: string
  }>()

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
  }, [fetcher.state, fetcher.data])

  return (
    <div className="mb-16 text-gray-700">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="col-span-1 bg-white">
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
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi
              facilis molestiae laudantium fugit earum placeat neque voluptatum,
              iure consectetur? Officia et aliquid voluptatum nobis fugit, optio
              quaerat ipsa beatae labore!
            </p>

            <fetcher.Form method="post">
              <button
                type="submit"
                disabled={fetcher.state !== 'idle'}
                className="btn btn-primary mt-4 w-full"
              >
                {fetcher.state === 'submitting'
                  ? 'Procesando...'
                  : 'Pagar ahora'}
              </button>
            </fetcher.Form>
          </div>
        </div>
      </div>
    </div>
  )
}
