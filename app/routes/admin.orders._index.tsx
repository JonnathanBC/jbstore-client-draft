import { data } from 'react-router'
import { Route } from './+types/admin.orders._index'

import { t } from '~/i18n'
import { OrdersPage } from '~/orders/OrdersPage'
import {
  ASSIGN_DRIVER_INTENT,
  isOrderStatusIntent,
  ORDER_STATUS_INTENTS,
} from '~/orders/status'
import { requireAdmin } from '~/server/auth.server'
import { handleMutation, type MutationResult } from '~/server/mutation.server'
import {
  assignOrderDriver,
  getOrders,
  updateOrderStatus,
} from '~/server/orders.server'

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.orders')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAdmin(request)
  const searchParams = new URL(request.url).searchParams

  const orders = await getOrders({
    token,
    page: Number(searchParams.get('page')) || undefined,
    order: { created_at: 'desc' },
  })

  return { orders }
}

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAdmin(request)
  const formData = await request.formData()
  const intent = formData.get('intent')
  const orderId = String(formData.get('orderId'))

  // Lo envía AssignDriverModal (vive en root y apunta acá con ?index)
  if (intent === ASSIGN_DRIVER_INTENT) {
    const result = await assignOrderDriver({
      token,
      orderId,
      driverId: String(formData.get('driverId')),
    })

    return handleMutation(request, result, { message: 'Conductor asignado' })
  }

  if (!isOrderStatusIntent(intent)) {
    return data<MutationResult>(
      { ok: false, error: 'Acción inválida' },
      { status: 400 },
    )
  }

  const result = await updateOrderStatus({
    token,
    orderId,
    status: ORDER_STATUS_INTENTS[intent],
  })

  return handleMutation(request, result, {
    message: t('global.successfully_updated'),
  })
}

export default function AdminOrdersRoute({ loaderData }: Route.ComponentProps) {
  return <OrdersPage orders={loaderData.orders} />
}
