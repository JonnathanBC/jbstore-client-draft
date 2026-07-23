import { Link, useNavigation, useSearchParams } from 'react-router'

import { Pagination } from '~/components/Pagination'
import { ApiResponse } from '~/types/api'
import { Product } from '~/types/product'

interface Props {
  products: ApiResponse<Product>
}

export const CategoryProducts = ({ products }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigation = useNavigation()

  const isFiltering = navigation.state === 'loading'

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  const handleSort = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set('orderBy', value)
    } else {
      next.delete('orderBy')
    }
    next.delete('page')
    setSearchParams(next, { preventScrollReset: true })
  }

  return (
    <div className="py-12">
      <div className="px-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="mr-2 text-nowrap">Ordenar por:</span>
          <select
            value={searchParams.get('orderBy') ?? ''}
            onChange={(e) => handleSort(e.target.value)}
            className="rounded"
          >
            <option value="relevant">Relevancia</option>
            <option value="major_to_minor">Precio: mayor a menor</option>
            <option value="minor_to_major">Precio: menor a mayor</option>
          </select>
        </div>

        <div
          className={`grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
            isFiltering ? 'opacity-50' : ''
          }`}
        >
          {products.data.map((product) => (
            <article className="overflow-hidden rounded" key={product.id}>
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
                  to=""
                  className="btn btn-primary block w-full text-center"
                >
                  Ver más
                </Link>
              </div>
            </article>
          ))}
        </div>

        {products.last_page > 1 && (
          <Pagination meta={products} onPageChange={handlePageChange} />
        )}
      </div>
    </div>
  )
}
