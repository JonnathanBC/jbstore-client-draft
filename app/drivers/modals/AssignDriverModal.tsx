import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'

import { Modal } from '~/components/modals/Modal'
import { useModalContext } from '~/components/modals/ModalContext'
import type { MutationResult } from '~/server/mutation.server'

interface Props {
  orderId: number
}

type DriverItems = { items: { value: string; label: string }[] }

export default function AssignDriverModal({ orderId }: Props) {
  const { onClose } = useModalContext()
  const drivers = useFetcher<DriverItems>()
  const fetcher = useFetcher<MutationResult>()
  const isSubmitting = fetcher.state !== 'idle'

  useEffect(() => {
    drivers.load('/resources/drivers')
  }, [])

  // El toast de éxito llega por flash; acá sólo el de error y el cierre.
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
    if (fetcher.data.ok) onClose()
  }, [fetcher.state, fetcher.data])

  return (
    <Modal title="Asignar conductor" onClose={onClose}>
      {/* El modal vive en root: sin `action` explícito el POST iría a root.
          `?index` apunta a admin.orders._index y no al layout padre. */}
      <fetcher.Form
        method="post"
        action="/admin/orders?index"
        className="space-y-4"
      >
        <input type="hidden" name="intent" value="assign-driver" />
        <input type="hidden" name="orderId" value={orderId} />

        <label htmlFor="driverId" className="block">
          Conductor
        </label>
        <select
          id="driverId"
          name="driverId"
          required
          disabled={drivers.state === 'loading'}
          className="border-weak focus:ring-primary h-10 w-full rounded-lg border px-3 focus:ring-2 focus:outline-none"
        >
          <option value="">Seleccioná un conductor</option>
          {drivers.data?.items.map((driver) => (
            <option key={driver.value} value={driver.value}>
              {driver.label}
            </option>
          ))}
        </select>

        <div className="text-right">
          <button
            type="submit"
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Asignando...' : 'Asignar'}
          </button>
        </div>
      </fetcher.Form>
    </Modal>
  )
}
