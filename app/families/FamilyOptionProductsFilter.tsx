import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Option } from '~/types/option'

interface Props {
  options: Option[]
}

export const FamilyOptionProductsFilter = ({ options }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [collapsed, setCollapsed] = useState<number[]>([])

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

  const toggleCollapse = (optionId: number) =>
    setCollapsed((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    )

  return (
    <div className="bg-white py-12">
      <div className="container flex">
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

        <div className="flex-1">Products</div>
      </div>
    </div>
  )
}
