import { useRouteLoaderData } from 'react-router'
import { Trash2 } from 'lucide-react'
import { HeaderTitle } from '~/components/HeaderTitle'
import { getCart } from '~/server/cart.server'
import { getOptionalAuth } from '~/server/auth.server'
import type { loader as appLoader } from './_app'
import type { Route } from './+types/_app.cart'

export const meta: Route.MetaFunction = () => [{ title: 'Carrito | JB Store' }]

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await getOptionalAuth(request)
  if (!auth) return { items: null }

  const items = await getCart(auth.token)

  if ('error' in items) {
    throw new Response(items.error.message, {
      status: items.error.status,
    })
  }

  // const total = items.reduce((acc, it) => acc + it.price * it.qty, 0)
  return { items }
}

export default function CartPage({ loaderData }: Route.ComponentProps) {
  // 1) Datos propios de la ruta → llegan por props.loaderData
  const { items } = loaderData

  // 2) Datos del padre (_app) → llegan por useRouteLoaderData
  const appData = useRouteLoaderData<typeof appLoader>('routes/_app')
  const user = appData?.user

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
      <div className="lg:col-span-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeaderTitle title="Carrito de compras" className="text-xl" />(
            {`${items?.count} productos`} )
          </div>
          <button className="font-semibold text-gray-600 underline hover:text-purple-500 hover:no-underline">
            Limpiar carrito
          </button>
        </div>

        <div className="card">
          {items?.items.length === 0 && (
            <p className="text-center">No hya productos en el carrito</p>
          )}
          <ul className="space-y-4">
            {items?.items.map((cart) => (
              <li className="lg:flex">
                <img
                  className="mr-2 aspect-video w-full rounded object-cover object-center lg:w-36"
                  src={cart.options.image}
                />
                <div className="w-80">
                  <p className="mb-1 text-sm">
                    <a href={`/products/${cart.id}`}>{cart.name}</a>
                  </p>

                  <button className="flex items-center gap-2 text-xs font-semibold text-red-800">
                    <Trash2 className="size-4" /> Eliminar
                  </button>
                </div>

                {/* price */}
                <p>${cart.price}</p>

                <div className="ml-auto space-x-3">
                  <button type="button" className="btn btn-primary">
                    -
                  </button>

                  <span>{cart.qty}</span>

                  <button type="button" className="btn btn-primary">
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="card">
          <div className="mb-2 flex justify-between font-semibold">
            <p>Total:</p>
            <p>$ {items?.subtotal}</p>
          </div>

          <a className="btn btn-primary block w-full text-center">
            Continuar con la compra
          </a>
        </div>
      </div>
    </div>
  )
}
