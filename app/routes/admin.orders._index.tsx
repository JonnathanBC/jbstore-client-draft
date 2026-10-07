import { useEffect } from 'react'
import { toast } from 'sonner'
import { data, Link, useFetcher, useSearchParams } from 'react-router'
import { Route } from './+types/admin.orders._index'

import { renderDateTime } from '~/components/table/renders'
import { Badge } from '~/components/Badge'
import { PdfIcon } from '~/components/icons/PdfIcon'
import { Table } from '~/components/Table'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { getOrders, updateOrderStatus } from '~/server/orders.server'
import { Order } from '~/types/orders'
import { Column } from '~/types/table'

const orderStatusVariants = {
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

const orderNextStep = {
  pending: { intent: 'set-to-processing', labelKey: 'global.ready_to_ship' },
  processing: { intent: 'set-to-delivery', labelKey: 'global.assign_delivery' },
} as const satisfies Partial<
  Record<Order['status'], { intent: string; labelKey: string }>
>

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.orders')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)

  const orders = await getOrders({
    token,
    order: {
      created_at: 'desc',
    },
  })

  return { orders }
}

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const formData = await request.formData()
  const intent = formData.get('intent')
  const orderId = String(formData.get('orderId'))

  switch (intent) {
    case 'set-to-processing': {
      const result = await updateOrderStatus({
        token,
        orderId,
        status: 'processing',
      })

      if ('error' in result) {
        return data(
          {
            success: false,
            error: result.error.message,
            errors: result.error.errors,
          },
          { status: result.error.status },
        )
      }

      return { success: true }
    }
    case 'set-to-delivery':
      console.log('Set to delivery')
      return { ok: true }
    case 'cancel':
      console.log('Cancel')
      return { ok: true }
  }
}

const ActionButtons = ({ order }: { order: Order }) => {
  const fetcher = useFetcher<{ success?: string; error?: string }>()
  const step = orderNextStep[order.status as keyof typeof orderNextStep]

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
    if (fetcher.data.success) toast.success(t('global.successfully_updated'))
  }, [fetcher.state, fetcher.data])

  return (
    <fetcher.Form method="post" className="flex flex-col space-y-2">
      <input type="hidden" name="orderId" value={order.id} />

      {step && (
        <button
          name="intent"
          value={step.intent}
          type="submit"
          className="font-medium text-blue-600 underline hover:no-underline"
        >
          {t(step.labelKey)}
        </button>
      )}

      <button
        name="intent"
        value="cancel"
        type="submit"
        className="font-medium text-blue-600 underline hover:no-underline"
      >
        {t('global.cancel')}
      </button>
    </fetcher.Form>
  )
}

const columns: Column<Order>[] = [
  { title: 'No Orden', dataIndex: 'id' as const },
  {
    title: 'Ticket',
    render: (row: Order) => (
      <Link to={`/resources/orders/${row.id}/ticket`} reloadDocument>
        <PdfIcon className="size-10" />
      </Link>
    ),
  },
  {
    title: 'Fecha',
    dataIndex: 'created_at' as const,
    render: (row: Order) => <>{renderDateTime(row.created_at)}</>,
  },
  {
    title: 'Total',
    dataIndex: 'total' as const,
    render: (row: Order) => <>S/ {row.total}</>,
  },
  {
    title: 'Cantidad',
    dataIndex: 'content' as const,
    render: (row: Order) => <>{Array(row.content).length}</>,
  },
  {
    title: 'Estado',
    dataIndex: 'status' as const,
    render: (row: Order) => (
      <Badge
        label={row.status}
        labelClassName="capitalize"
        variant={orderStatusVariants[row.status]}
      />
    ),
  },
  {
    title: 'Acciones',
    render: (row: Order) => <ActionButtons order={row} />,
  },
]

export default function OrdersPage({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  return (
    <>
      <div className="mb-4 text-right">
        <Link to="/admin/orders/create" className="btn btn-primary">
          {t('global.new')}
        </Link>
      </div>

      <Table<Order>
        dataSource={orders.data}
        columns={columns}
        meta={orders}
        onPageChange={handlePageChange}
      />
    </>
  )
}
