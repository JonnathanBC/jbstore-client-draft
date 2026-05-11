import { lazy, Suspense } from 'react'
import { useModalStore } from '~/store/modal.store'
import { ModalProvider } from './ModalContext'
import { modalRegistry } from '~/config/modalRegistry'

const lazyComponents: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<unknown>>
> = {
  healthy: lazy(() => import('~/features/healthy/HealthyModal')),
  option: lazy(() => import('~/features/options/OptionForm')),
}

export const ModalRenderer = () => {
  const modals = useModalStore((state) => state.modals)
  const close = useModalStore((state) => state.close)

  return modals.map((modal) => {
    const { _type, ...modalProps } = modal
    const Component = lazy(modalRegistry[_type].Component)
    const modalId = modal._type + '-' + JSON.stringify(modalProps)
    const onClose = () => close(modals.indexOf(modal))

    if (!Component) return null

    return (
      <Suspense key={modalId} fallback={null}>
        <ModalProvider value={{ onClose }}>
          <Component {...modalProps} />
        </ModalProvider>
      </Suspense>
    )
  })
}
