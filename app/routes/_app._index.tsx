import { CarruselImage } from '~/components/shared/CarruselImage'
import { getPublicCovers } from '~/server/covers.server'
import type { Route } from './+types/_app._index'
import { getPublicProducts } from '~/server/products.server'
import { Link } from 'react-router'

export const meta: Route.MetaFunction = () => [{ title: 'JB Store' }]

export async function loader() {
  const [covers, lastProducts] = await Promise.all([
    getPublicCovers(),
    getPublicProducts(),
  ])
  return { covers, lastProducts }
}

export default function HomeIndex({ loaderData }: Route.ComponentProps) {
  const { covers, lastProducts } = loaderData

  return (
    <div>
      <CarruselImage
        images={covers.map((cover) => ({
          id: cover.id,
          src: cover.image,
          alt: cover.title,
        }))}
      />

      <div className="mt-4 md:mt-12">
        <h1 className="mb-4 text-2xl font-bold text-gray-700">
          Últimos productos
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {lastProducts.data.map((product) => (
            <article className="rounde overflow-hidden" key={product.id}>
              <img
                src={product.image!}
                alt="Imagen Producto"
                className="h-48 w-full object-cover object-center"
              />

              <div className="py-2">
                <h2 className="mb-2 line-clamp-2 min-h-14 text-lg font-semibold text-gray-700">
                  {product.name}
                </h2>
                <p className="mb-4 text-gray-600">${product.price}</p>

                <Link
                  to={`/products/${product.id}`}
                  className="btn btn-primary block w-full text-center"
                >
                  Ver más
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
