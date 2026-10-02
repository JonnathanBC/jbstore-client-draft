import { Link, redirect } from 'react-router'
import { CircleCheckBig } from 'lucide-react'
import type { Route } from './+types/_app.checkout_.thanks'
import { requireAuth } from '~/server/auth.server'
import { getSession } from '~/server/session.server'

export const meta: Route.MetaFunction = () => [
  { title: 'Gracias por tu compra | JB Store' },
]

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request)
  const session = await getSession(request.headers.get('Cookie'))

  // No hacemos commit acá: el layout _app ya consume el flash y reescribe la cookie.
  const payment = session.get('payment')
  if (!payment) return redirect('/')

  return { payment }
}

// Niubiz manda la fecha como yyMMddHHmmss (ej: 261002115315).
function formatNiubizDate(value: string) {
  const [yy, MM, dd, HH, mm] = value.match(/\d{2}/g) ?? []
  if (!mm) return value
  return `${dd}/${MM}/20${yy} ${HH}:${mm}`
}

export default function CheckoutThanksPage({
  loaderData,
}: Route.ComponentProps) {
  const { payment } = loaderData

  const details = [
    { label: 'Número de pedido', value: payment.purchaseNumber },
    { label: 'Fecha y hora', value: formatNiubizDate(payment.transactionDate) },
    {
      label: 'Importe',
      value: `${payment.currency} ${payment.amount.toFixed(2)}`,
    },
    {
      label: 'Tarjeta',
      value: `${payment.brand.toUpperCase()} ${payment.card}`,
    },
  ]

  return (
    <div className="mx-auto mb-16 max-w-xl px-4 py-12 text-gray-700">
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
        <div className="bg-gray-100 p-6 text-center">
          <CircleCheckBig className="mx-auto size-16 text-green-600" />
          <h1 className="mt-4 text-2xl font-semibold">
            ¡Gracias por tu compra!
          </h1>
          <p className="mt-2 text-gray-500">
            Tu pago fue aprobado. Guardá estos datos como comprobante.
          </p>
        </div>

        <dl className="divide-y divide-gray-200">
          {details.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 p-4">
              <dt className="font-semibold text-gray-500">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Link to="/" className="btn btn-primary mt-6 block w-full text-center">
        Seguir comprando
      </Link>
    </div>
  )
}
