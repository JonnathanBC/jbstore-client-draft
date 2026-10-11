import type { Badge } from '~/components/Badge'
import type { DataTableFilter } from '~/components/DataTable'
import { t } from '~/i18n'
import type { Shipping, ShippingStatusEnum } from '~/types/shippings'

export const shippingStatusVariants = {
  pending: 'warning',
  completed: 'success',
  failed: 'danger',
} as const satisfies Record<
  Shipping['status'],
  NonNullable<React.ComponentProps<typeof Badge>['variant']>
>

export const isShippingStatus = (
  value: string | null,
): value is ShippingStatusEnum =>
  value !== null && Object.hasOwn(shippingStatusVariants, value)

/** Cada botón de la tabla manda un intent; acá se traduce al estado que espera la API. */
export const SHIPPING_INTENTS = {
  'mark-as-delivered': 'completed',
  'mark-as-failed': 'failed',
} as const satisfies Record<string, ShippingStatusEnum>

export type ShippingIntent = keyof typeof SHIPPING_INTENTS

export const isShippingIntent = (
  value: FormDataEntryValue | null,
): value is ShippingIntent =>
  typeof value === 'string' && Object.hasOwn(SHIPPING_INTENTS, value)

export const shippingFilters: DataTableFilter[] = [
  {
    key: 'status',
    label: t('global.status'),
    options: [
      { label: t('shipping_status.pending'), value: 'pending' },
      { label: t('shipping_status.completed'), value: 'completed' },
      { label: t('shipping_status.failed'), value: 'failed' },
    ],
  },
]
