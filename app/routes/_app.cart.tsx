import { useRouteLoaderData } from 'react-router'
import type { Route } from './+types/_app.cart'
import type { loader as appLoader } from './_app'

export const meta: Route.MetaFunction = () => [{ title: 'Carrito | JB Store' }]

// Loader propio de la ruta — datos específicos del /cart (fake por ahora)
export async function loader(_args: Route.LoaderArgs) {
  const items = [
    { id: 1, name: 'Teclado mecánico', price: 59.9, qty: 1 },
    { id: 2, name: 'Mouse inalámbrico', price: 24.5, qty: 2 },
    { id: 3, name: 'Monitor 24"', price: 189.0, qty: 1 },
  ]
  const total = items.reduce((acc, it) => acc + it.price * it.qty, 0)
  return { items, total }
}

export default function CartPage({ loaderData }: Route.ComponentProps) {
  // 1) Datos propios de la ruta → llegan por props.loaderData
  const { items, total } = loaderData

  // 2) Datos del padre (_app) → llegan por useRouteLoaderData
  const appData = useRouteLoaderData<typeof appLoader>('routes/_app')
  const user = appData?.user

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Carrito</h1>

      <p className="mb-4 text-slate-600">
        {user
          ? `Hola, ${user.name}.`
          : 'Iniciá sesión para guardar tu carrito.'}
      </p>

      <ul className="divide-y rounded-lg border bg-white">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between p-3">
            <div>
              <p className="font-medium">{it.name}</p>
              <p className="text-xs text-slate-500">Cantidad: {it.qty}</p>
            </div>
            <span className="font-semibold">
              ${(it.price * it.qty).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-end font-semibold">
        Total: ${total.toFixed(2)}
      </div>
    </div>
  )
}
