import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigation, useSearchParams } from 'react-router'
import { Pagination } from '~/components/Pagination'
import { ApiResponse } from '~/types/api'
import { Option } from '~/types/option'
import { Product } from '~/types/product'

interface Props {
  options: Option[]
  products: ApiResponse<Product>
}

export const FamilyOptionProductsFilter = ({ options, products }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [collapsed, setCollapsed] = useState<number[]>([])
  const navigation = useNavigation()

  const isFiltering = navigation.state === 'loading'

  const selected = searchParams.getAll('features')

  const toggleFeature = (featureId: number) => {
    const value = String(featureId)
    const next = new URLSearchParams(searchParams)
    const current = next.getAll('features')

    next.delete('features')
    const updated = current.includes(value)
      ? current.filter((id) => id !== value)
      : [...current, value]
    updated.forEach((id) => next.append('features', id))

    next.delete('page')
    setSearchParams(next, { preventScrollReset: true })
  }

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('features')
    next.delete('page')
    setSearchParams(next, { preventScrollReset: true })
  }

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  const toggleCollapse = (optionId: number) =>
    setCollapsed((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    )

  return (
    <div className="">
      <div className="container flex">
        {options.length > 0 && (
          <aside className="mr-8 w-52 shrink-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Filtros</h2>

              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-gray-500 underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            {options.map((option) => (
              <div key={option.id} className="mb-4">
                <button
                  type="button"
                  onClick={() => toggleCollapse(option.id)}
                  aria-expanded={!collapsed.includes(option.id)}
                  className="flex w-full items-center justify-between bg-gray-200 px-4 py-2 text-left text-gray-700"
                >
                  {option.name}
                  <ChevronDown
                    className={
                      collapsed.includes(option.id) ? '-rotate-90' : undefined
                    }
                  />
                </button>

                {!collapsed.includes(option.id) && (
                  <ul className="mt-2 space-y-1">
                    {option.features.map((feature) => (
                      <li key={feature.id}>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            value={feature.id}
                            checked={selected.includes(String(feature.id))}
                            onChange={() => toggleFeature(feature.id)}
                          />
                          {feature.value}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </aside>
        )}

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <span className="mr-2 text-nowrap">Ordenar por:</span>
            <select
              value={searchParams.get('sort') ?? ''}
              onChange={(e) => {}}
              className="rounded"
            >
              <option value="1">Relevancia</option>
              <option value="2">Precio: mayor a menor</option>
              <option value="3">Precio: menor a mayor</option>
            </select>
          </div>
          <div
            className={`grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
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
    </div>
  )
}
