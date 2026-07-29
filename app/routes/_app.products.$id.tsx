import { RouteHandle } from '~/types/route'
import { t } from '~/i18n'
import type { Product } from '~/types/product'
import { Route } from './+types/admin.products.$id'
import { getPublicProduct } from '~/server/products.server'
import { Star, Truck } from 'lucide-react'

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
    console.log({ product })
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

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData
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
            <div className="text-sm">{product.description}</div>
          </div>

          <div className="col-span-1">
            <h1 className="mb-2 text-xl text-gray-600">{product.name}</h1>
            <div className="mb-4 flex items-center space-x-2">
              <ul className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <li>
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
              <button className="btn btn-primary">-</button>
              <span>1</span>
              <button className="btn btn-primary">+</button>
            </div>

            <button className="btn btn-primary mb-6 w-full">
              Agregar al carrito
            </button>

            <div className="flex items-center space-x-2 text-gray-700">
              <Truck className="size-5" />
              <span>Despacho a domicilio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
