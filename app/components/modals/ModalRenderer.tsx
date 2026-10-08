import { ComponentType, lazy, LazyExoticComponent, Suspense } from 'react'

import { modalRegistry } from '~/config/modalRegistry'
import { ModalType, useModalStore } from '~/store/modal.store'
import { ModalProvider } from './ModalContext'

// `lazy()` tiene que crearse UNA vez por tipo: si se crea en cada render,
// React lo ve como otro componente y re-monta el modal (se pierde el estado del form).
const lazyModals = Object.fromEntries(
  Object.entries(modalRegistry).map(([type, { Component }]) => [
    type,
    lazy(Component as () => Promise<{ default: ComponentType<object> }>),
  ]),
) as Record<ModalType, LazyExoticComponent<ComponentType<object>>>

export const ModalRenderer = () => {
  const modals = useModalStore((state) => state.modals)
  const close = useModalStore((state) => state.close)

  return modals.map(({ id, type, props }) => {
    const Component = lazyModals[type]

    return (
      <Suspense key={id} fallback={null}>
        <ModalProvider value={{ onClose: () => close(id) }}>
          <Component {...props} />
        </ModalProvider>
      </Suspense>
    )
  })
}
