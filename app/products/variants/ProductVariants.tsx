// option_id

import { t } from '~/i18n'
import { useModalStore } from '~/store/modal.store'

// features[]
export const ProductVariants = () => {
  const openModal = useModalStore((state) => state.open)

  return (
    <section className="card">
      <header className="px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t('admin.variants')}</h1>
          <button
            onClick={() => openModal('productVariant')}
            className="btn btn-primary"
          >
            Nuevo
          </button>
        </div>
      </header>

      <div className="p-6">Variantes</div>
    </section>
  )
}
