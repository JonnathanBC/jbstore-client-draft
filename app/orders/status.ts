import type { Badge } from '~/components/Badge'
import type { Order, OrderStatusEnum } from '~/types/orders'

export const orderStatusVariants = {
  pending: 'warning',
  processing: 'info',
  shipped: 'default',
  completed: 'success',
  cancelled: 'danger',
  failed: 'danger',
  refunded: 'info',
} as const satisfies Record<
  Order['status'],
  NonNullable<React.ComponentProps<typeof Badge>['variant']>
>

/** Intents que solo cambian el estado: cada uno se traduce al estado que espera la API. */
export const ORDER_STATUS_INTENTS = {
  'set-to-processing': 'processing',
  'set-to-refunded': 'refunded',
  cancel: 'cancelled',
} as const satisfies Record<string, OrderStatusEnum>

export type OrderStatusIntent = keyof typeof ORDER_STATUS_INTENTS

/** Asignar repartidor no es un cambio de estado directo: abre un modal y crea el envío. */
export const ASSIGN_DRIVER_INTENT = 'assign-driver'

export const isOrderStatusIntent = (
  value: FormDataEntryValue | null,
): value is OrderStatusIntent =>
  typeof value === 'string' && Object.hasOwn(ORDER_STATUS_INTENTS, value)

/** Siguiente paso del flujo según el estado (espejo de las transiciones del backend). */
export const orderNextStep = {
  pending: { intent: 'set-to-processing', labelKey: 'global.ready_to_ship' },
  processing: {
    intent: ASSIGN_DRIVER_INTENT,
    labelKey: 'global.assign_delivery',
  },
  failed: { intent: 'set-to-refunded', labelKey: 'admin.mark_as_refunded' },
  refunded: {
    intent: ASSIGN_DRIVER_INTENT,
    labelKey: 'global.assign_delivery',
  },
} as const satisfies Partial<
  Record<
    Order['status'],
    {
      intent: OrderStatusIntent | typeof ASSIGN_DRIVER_INTENT
      labelKey: string
    }
  >
>

export const getOrderNextStep = (status: Order['status']) =>
  status in orderNextStep
    ? orderNextStep[status as keyof typeof orderNextStep]
    : undefined

/** content es un objeto por rowId: la cantidad real es la suma de qty, no la cantidad de claves. */
export const orderItemsCount = (order: Order) =>
  Object.values(order.content ?? {}).reduce((sum, item) => sum + item.qty, 0)
