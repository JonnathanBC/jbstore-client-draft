import { Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { toast } from 'sonner'

import Alert from '~/components/admin/Alert'
import { showDeleteConfirm } from '~/components/confirm/showDeleteConfirm'
import { Badge } from '~/components/Badge'
import { t } from '~/i18n'
import type { loader } from '~/routes/admin.products.$id'
import type { MutationResult } from '~/server/mutation.server'
import { useModalStore } from '~/store/modal.store'

export const OptionsFeaturesProduct = () => {
  const openModal = useModalStore((state) => state.open)
  const { product } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<MutationResult>()

  const optionsUrl = `/admin/products/${product.id}/options`

  // DELETE /admin/products/:id/options/:optionId → admin.products.$id.options.$optionId
  const handleDeleteOptionProduct = async (optionId: number) => {
    if (!(await showDeleteConfirm({ title: '¿Eliminar esta opción?' }))) return
    fetcher.submit(null, {
      method: 'DELETE',
      action: `${optionsUrl}/${optionId}`,
    })
  }

  // DELETE .../options/:optionId/features/:featureId
  const handleDeleteFeatureProduct = async (data: {
    option_id: number
    feature_id: number
  }) => {
    if (!(await showDeleteConfirm({ title: '¿Eliminar este valor?' }))) return
    fetcher.submit(null, {
      method: 'DELETE',
      action: `${optionsUrl}/${data.option_id}/features/${data.feature_id}`,
    })
  }

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
  }, [fetcher.data, fetcher.state])

  return (
    <section className="card">
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t('admin.options')}</h1>
          <button
            onClick={() => openModal('productOption')}
            className="btn btn-primary"
          >
            {t('admin.add_option')}
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {product?.options?.length === 0 && (
          <Alert message="No hay opciones para este producto" />
        )}
        {product?.options?.map((option) => {
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
