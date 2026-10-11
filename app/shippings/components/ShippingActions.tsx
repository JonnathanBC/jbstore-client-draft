import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'

import { t } from '~/i18n'
import type { MutationResult } from '~/server/mutation.server'
import type { Shipping } from '~/types/shippings'
import type { ShippingIntent } from '../status'

const ACTIONS: { intent: ShippingIntent; labelKey: string }[] = [
  { intent: 'mark-as-delivered', labelKey: 'admin.mark_as_paid' },
  { intent: 'mark-as-failed', labelKey: 'admin.mark_as_a_delivery_error' },
]

export const ShippingActions = ({ shipping }: { shipping: Shipping }) => {
  const fetcher = useFetcher<MutationResult>()

  // El toast de éxito llega por flash (handleMutation); acá solo el de error
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
  }, [fetcher.state, fetcher.data])

  // Solo un envío pendiente puede cambiar de estado (misma regla que el enum del backend)
  if (shipping.status !== 'pending') return null

  return (
    <fetcher.Form method="post" className="flex flex-col space-y-2">
      <input type="hidden" name="shippingId" value={shipping.id} />

      {ACTIONS.map(({ intent, labelKey }) => (
        <button
          key={intent}
          type="submit"
          name="intent"
          value={intent}
          disabled={fetcher.state !== 'idle'}
          className="font-medium text-blue-600 underline hover:no-underline disabled:opacity-50"
        >
          {t(labelKey)}
        </button>
      ))}
    </fetcher.Form>
  )
}
