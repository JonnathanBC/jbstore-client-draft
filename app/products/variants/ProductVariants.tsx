import { Trash2, X } from 'lucide-react'
import { useFetcher } from 'react-router'
import { Badge } from '~/components/Badge'
import { t } from '~/i18n'
import { useModalStore } from '~/store/modal.store'
import { Option } from '~/types/option'

interface Props {
  options?: Option[]
}

export const ProductVariants = ({ options }: Props) => {
  const openModal = useModalStore((state) => state.open)
  const fetcher = useFetcher()

  const handleDelete = (optionId: number) => {
    alert(`${optionId}`)
  }

  const handleDeleteFeature = (data: {
    option_id: number
    feature_id: number
  }) => {
    fetcher.submit(
      { ...data, intent: 'delete-feature' },
      {
        method: 'POST',
        action: '/admin/products/',
        encType: 'application/json',
      },
    )
  }

  return (
    <section className="card">
      <header className="px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t('admin.options')}</h1>
          <button
            onClick={() => openModal('productVariant')}
            className="btn btn-primary"
          >
            Nuevo
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {options?.map((option) => {
          return (
            <div
              key={option.id}
              className="relative rounded-lg border border-zinc-200 bg-white p-6"
            >
              <div className="absolute -top-3 flex items-center bg-white px-4">
                <button
                  className="mr-1 text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(option.id)}
                >
                  <Trash2 className="size-5" />
                </button>
                <span>{option.name}</span>
              </div>

              {/* Valores */}
              <div className="flex flex-wrap gap-3">
                {option?.features?.map((feature) => {
                  if (option.type === 1) {
                    return (
                      <Badge
                        key={feature.id}
                        label={feature.description}
                        onClick={() =>
                          handleDeleteFeature(option.id, feature.id)
                        }
                      />
                    )
                  }

                  return (
                    <div key={feature.id} className="relative">
                      <span
                        style={{ backgroundColor: feature.value }}
                        className="inline-block size-6 rounded-full border-2 shadow-lg"
                      />

                      <button
                        className="absolute -top-1 left-4 z-10 flex size-3 items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
                        onClick={() =>
                          handleDeleteFeature(option.id, feature.id)
                        }
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
