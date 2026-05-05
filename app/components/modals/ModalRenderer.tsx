import { lazy, Suspense } from 'react'
import { modalRegistry } from '~/config/modalRegistry'
import { useModalStore } from '~/store/modal.store'
import { ModalProvider } from './ModalContext'

export const ModalRenderer = () => {
  const modals = useModalStore((state) => state.modals)
  const close = useModalStore((state) => state.close)

  return modals.map((modal, i) => {
    const { _type, ...modalProps } = modal
    const Component = lazy(modalRegistry[_type].Component)
    const onClose = () => close(i)

    return (
      <Suspense key={i} fallback={null}>
        <ModalProvider value={{ onClose }}>
          <Component {...modalProps} />
        </ModalProvider>
      </Suspense>
    )
  })
}
