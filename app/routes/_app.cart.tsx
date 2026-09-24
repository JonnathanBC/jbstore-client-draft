import { useEffect } from 'react'
import { data, useFetcher, useRouteLoaderData } from 'react-router'
import { Trash2 } from 'lucide-react'
import { HeaderTitle } from '~/components/HeaderTitle'
import type { ApiError } from '~/lib/apiClient'
import {
  clearCart,
  getCart,
  removeFromCart,
  updateCart,
} from '~/server/cart.server'
import { getPublicProductsByIds } from '~/server/products.server'
import { getOptionalAuth } from '~/server/auth.server'
import {
  clearGuestCart,
  commitGuestCart,
  getGuestCart,
} from '~/server/guestCart.server'
import type { loader as appLoader } from './_app'
import type { Route } from './+types/_app.cart'

export const meta: Route.MetaFunction = () => [{ title: 'Carrito | JB Store' }]

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await getOptionalAuth(request)
  if (!auth) {
    const guestItems = await getGuestCart(request)
    const products = await getPublicProductsByIds([
      ...new Set(guestItems.map((item) => item.product_id)),
    ]).catch(() => [])
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    )

    const items = guestItems.flatMap((item, index) => {
      const product = productsById.get(item.product_id)
      if (!product) return []

      return [
        {
          rowId: String(index),
          id: product.id,
          name: product.name,
          qty: item.quantity,
          price: product.price,
          options: { image: product.image, sku: '', features: [] },
          tax: 0,
          isSaved: false,
          subtotal: product.price * item.quantity,
        },
      ]
    })

    return {
      items: {
        items,
        count: items.reduce((total, item) => total + item.qty, 0),
        subtotal: items
          .reduce((total, item) => total + item.subtotal, 0)
          .toFixed(2),
      },
    }
  }

  const items = await getCart(auth.token)

  if ('error' in items) {
    throw new Response(items.error.message, {
      status: items.error.status,
    })
  }

  // const total = items.reduce((acc, it) => acc + it.price * it.qty, 0)
  return { items }
}

const fail = (error: string, status = 400) =>
  data({ ok: false as const, error }, { status })

const fromApi = (result: object | { error: ApiError }, message: string) =>
  'error' in result
    ? fail(result.error.message, result.error.status)
    : { ok: true as const, message }

export async function action({ request }: Route.ActionArgs) {
  const auth = await getOptionalAuth(request)
  const form = await request.formData()
  const intent = form.get('intent')
  const rowId = form.get('rowId')

  if (!auth) {
    const guestItems = await getGuestCart(request)
    const headers = new Headers()

    if (intent === 'clear') {
      headers.append('Set-Cookie', await clearGuestCart())
      return data(
        { ok: true as const, message: 'Carrito vaciado' },
        { headers },
      )
    }

    const index = Number(rowId)
    if (!Number.isInteger(index) || index < 0 || index >= guestItems.length) {
      return fail('rowId inválido')
    }

    if (intent === 'remove') {
      guestItems.splice(index, 1)
    } else if (intent === 'increase' || intent === 'decrease') {
      const item = guestItems[index]
      const quantity = item.quantity + (intent === 'increase' ? 1 : -1)

      if (quantity <= 0) guestItems.splice(index, 1)
      else guestItems[index] = { ...item, quantity }
    } else {
      return fail('Acción inválida')
    }

    headers.append('Set-Cookie', await commitGuestCart(guestItems))
    return data(
      { ok: true as const, message: 'Carrito actualizado' },
      { headers },
    )
  }

  if (intent === 'clear') {
    return fromApi(await clearCart(auth.token), 'Carrito vaciado')
  }

  if (typeof rowId !== 'string' || !rowId) {
    return fail('rowId inválido')
  }

  switch (intent) {
    case 'increase':
    case 'decrease':
      return fromApi(
        await updateCart(rowId, intent, auth.token),
        'Cantidad actualizada',
      )
    case 'remove':
      return fromApi(
        await removeFromCart(rowId, auth.token),
        'Producto eliminado',
      )
    default:
      return fail('Acción inválida')
  }
}

export default function CartPage({ loaderData }: Route.ComponentProps) {
  // 1) Datos propios de la ruta → llegan por props.loaderData
  const { items } = loaderData

  // 2) Datos del padre (_app) → llegan por useRouteLoaderData
  const appData = useRouteLoaderData<typeof appLoader>('routes/_app')
  const user = appData?.user

  const fetcher = useFetcher<typeof action>()

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return

    if (fetcher.data.ok) console.log('✅', fetcher.data.message)
    else console.error('❌', fetcher.data.error)
  }, [fetcher.state, fetcher.data])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
      <div className="lg:col-span-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeaderTitle title="Carrito de compras" className="text-xl" />(
            {`${items?.count} productos`} )
          </div>
          <fetcher.Form method="post">
            <button
              type="submit"
              name="intent"
              value="clear"
              className="font-semibold text-gray-600 underline hover:text-purple-500 hover:no-underline"
            >
              Limpiar carrito
            </button>
          </fetcher.Form>
        </div>

        <div className="card">
          {items?.items.length === 0 && (
            <p className="text-center">No hay productos en el carrito</p>
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

                  <fetcher.Form method="post">
                    <input type="hidden" name="rowId" value={cart.rowId} />
                    <button
                      type="submit"
                      name="intent"
                      value="remove"
                      className="flex items-center gap-2 text-xs font-semibold text-red-800"
                    >
                      <Trash2 className="size-4" /> Eliminar
                    </button>
                  </fetcher.Form>
                </div>

                {/* price */}
                <p>${cart.price}</p>

                <fetcher.Form method="post" className="ml-auto space-x-3">
                  <input type="hidden" name="rowId" value={cart.rowId} />

                  <button
                    type="submit"
                    name="intent"
                    value="decrease"
                    className="btn btn-primary"
                  >
                    -
                  </button>

                  <span>{cart.qty}</span>

                  <button
                    type="submit"
                    name="intent"
                    value="increase"
                    className="btn btn-primary"
                  >
                    +
                  </button>
                </fetcher.Form>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="lg:col-span-2">
        {!!items?.items.length && (
          <div className="card">
            <div className="mb-2 flex justify-between font-semibold">
              <p>Total:</p>
              <p>$ {items?.subtotal}</p>
            </div>

            <a className="btn btn-primary block w-full text-center">
              Continuar con la compra
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
