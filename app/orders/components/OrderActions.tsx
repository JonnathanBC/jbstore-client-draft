import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'

import { t } from '~/i18n'
import type { MutationResult } from '~/server/mutation.server'
import { useModalStore } from '~/store/modal.store'
import type { Order } from '~/types/orders'
import { ASSIGN_DRIVER_INTENT, getOrderNextStep } from '../status'

const linkClass =
  'font-medium text-blue-600 underline hover:no-underline disabled:opacity-50'

export const OrderActions = ({ order }: { order: Order }) => {
  const fetcher = useFetcher<MutationResult>()
  const openModal = useModalStore((state) => state.open)
  const step = getOrderNextStep(order.status)
  const busy = fetcher.state !== 'idle'

  // El toast de éxito llega por flash (handleMutation); acá solo el de error
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
  }, [fetcher.state, fetcher.data])

  return (
    <fetcher.Form method="post" className="flex flex-col space-y-2">
      <input type="hidden" name="orderId" value={order.id} />

      {/* Asignar repartidor necesita elegir conductor: abre modal en vez de enviar */}
      {step?.intent === ASSIGN_DRIVER_INTENT && (
        <button
          type="button"
          onClick={() => openModal('assignDriver', { orderId: order.id })}
          className={linkClass}
        >
          {t(step.labelKey)}
        </button>
      )}

      {step && step.intent !== ASSIGN_DRIVER_INTENT && (
        <button
          type="submit"
          name="intent"
          value={step.intent}
          disabled={busy}
          className={linkClass}
        >
          {t(step.labelKey)}
        </button>
      )}

      {/* En shipped/failed queda visible a propósito: el backend explica por qué no se puede */}
      {order.status !== 'cancelled' && (
        <button
          type="submit"
          name="intent"
          value="cancel"
          disabled={busy}
          className={linkClass}
        >
          {t('global.cancel')}
        </button>
      )}
    </fetcher.Form>
  )
}
