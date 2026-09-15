import { useState } from 'react'
import { data, useFetcher } from 'react-router'
import { Star, Truck } from 'lucide-react'
import { RouteHandle } from '~/types/route'
import { t } from '~/i18n'
import type { Product } from '~/types/product'
import type { Route } from './+types/_app.products.$id'
import { getPublicProduct } from '~/server/products.server'
import { requireAuth } from '~/server/auth.server'
import { getSession, commitSession } from '~/server/session.server'
import { addToCart } from '~/server/cart.server'
import { Variants } from '~/products/variants/Variants'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.product ? `${data.product.name} | JB Store` : 'JB Store',
  },
]

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (match as { data?: { product?: Product } }).data
    return [
      { label: t('global.product') },
      { label: data?.product?.name ?? t('global.edit') },
    ]
  },
}

export async function loader({ request: _, params }: Route.LoaderArgs) {
  const id = Number(params.id)
  if (!Number.isFinite(id) || id < 1) {
    throw new Response('Producto no encontrado', { status: 404 })
  }

  try {
    const product = await getPublicProduct(id)
    return { product }
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500
    throw new Response(
      status === 404 ? 'Producto no encontrado' : 'Error del servidor',
      {
        status,
      },
    )
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const id = Number(params.id)
  const form = await request.formData()
  const quantity = Number(form.get('quantity'))

  if (
    !Number.isInteger(id) ||
    id < 1 ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return data({ error: 'Datos inválidos' }, { status: 400 })
  }

  const result = await addToCart({ product_id: id, quantity }, token)
  const session = await getSession(request.headers.get('Cookie'))

  const failed = 'error' in result

  session.flash(
    'toast',
    failed
      ? { kind: 'error', title: 'No se pudo agregar al carrito' }
      : { kind: 'success', title: 'Producto agregado al carrito' },
  )

  return data(
    { ok: !failed },
    { headers: { 'Set-Cookie': await commitSession(session) } },
  )
}

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [quantity, setQuantity] = useState(1)
  const busy = fetcher.state !== 'idle'

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{product.name}</h1>

      <div className="card">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="col-span-1">
            <figure className="mb-2">
              <img
                src={product.image}
                alt={product.name}
                className="aspect-video w-full object-cover object-center"
              />
            </figure>
          </div>

          <div className="col-span-1">
            <h1 className="mb-2 text-xl text-gray-600">{product.name}</h1>
            <div className="mb-4 flex items-center space-x-2">
              <ul className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <li key={star}>
                    <Star className="size-4 text-yellow-400" />
                  </li>
                ))}
              </ul>

              <p className="text-sm text-gray-700">4.5 (55)</p>
            </div>

            <p className="mb-4 text-2xl font-semibold text-gray-600">
              ${product.price}
            </p>

            <div className="mb-6 flex items-center space-x-6">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>

              {/* <Variants /> */}
            </div>

            <fetcher.Form method="post">
              <input type="hidden" name="quantity" value={quantity} />
              <button
                type="submit"
                className="btn btn-primary mb-6 w-full"
                disabled={busy}
              >
                {busy ? 'Agregando...' : 'Agregar al carrito'}
              </button>
            </fetcher.Form>
            <p className="text-sm">{product.description}</p>

            <div className="mt-2 flex items-center space-x-2 text-gray-700">
              <Truck className="size-5" />
              <span>Despacho a domicilio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
