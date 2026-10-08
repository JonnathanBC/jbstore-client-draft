import { Modal } from '~/components/modals/Modal'
import { useModalContext } from '~/components/modals/ModalContext'

export default function HealthyModal() {
  const { onClose } = useModalContext()

  return (
    <Modal title="Modal title" onClose={onClose}>
      <p>Modal test</p>
    </Modal>
  )
}
