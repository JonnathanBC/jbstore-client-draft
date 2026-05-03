import { lazy, Suspense } from 'react'
import { modalRegistry } from '~/config/modalRegistry'
import { useModalStore } from '~/store/modal.store'

export const ModalRenderer = () => {
  const modals = useModalStore((state) => state.modals)
  const close = useModalStore((state) => state.close)

  return modals.map((modal, i) => {
    const Component = lazy(modalRegistry[modal._type].Component)

    return (
      <Suspense key={i} fallback={null}>
        <Component {...modal} open={true} setOpen={() => close(i)} />
      </Suspense>
    )
  })
}
