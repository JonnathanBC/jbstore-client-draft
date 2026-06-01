import { Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '~/components/Badge'
import { t } from '~/i18n'
import { useModalStore } from '~/store/modal.store'
import { Option } from '~/types/option'

interface Props {
  productId: number | string
  options?: Option[]
}

export const ProductVariants = ({ options, productId }: Props) => {
  const openModal = useModalStore((state) => state.open)
  const fetcher = useFetcher()

  const handleDeleteOptionProduct = (optionId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta opción?')) return
    fetcher.submit(
      { option_id: optionId, _action: 'remove-option-product' },
      { method: 'POST', action: `/admin/products/${productId}` },
    )
  }

  const handleDeleteFeatureProduct = (data: {
    option_id: number
    feature_id: number
  }) => {
    if (!confirm('¿Estás seguro de eliminar esta feature?')) return
    fetcher.submit(
      { ...data, _action: 'delete-feature-product' },
      {
        method: 'POST',
        action: `/admin/products/${productId}`,
        // encType: 'application/json',
      },
    )
  }

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data, fetcher.state])

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
                  onClick={() => handleDeleteOptionProduct(option.id)}
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
                          handleDeleteFeatureProduct({
                            option_id: option.id,
                            feature_id: feature.id,
                          })
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
                          handleDeleteFeatureProduct({
                            option_id: option.id,
                            feature_id: feature.id,
                          })
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
