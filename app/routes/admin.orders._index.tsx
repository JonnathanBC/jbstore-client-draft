import { Link, useSearchParams } from 'react-router'
import { Route } from './+types/admin.orders._index'
import { t } from '~/i18n'
import { Table } from '~/components/Table'
import { Order } from '~/types/orders'
import { Column } from '~/types/table'
import { requireAuth } from '~/server/auth.server'
import { getOrders } from '~/server/orders.server'
import { renderDateTime } from '~/components/table/renders'
import { Badge } from '~/components/Badge'
import { PdfIcon } from '~/components/icons/PdfIcon'

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
    render: (row: Order) => (
      <div className="flex flex-col space-y-2">
        <button className="font-medium text-blue-600 underline hover:no-underline">
          {row.status === 'pending' && t('global.ready_to_ship')}
          {row.status === 'processing' && t('global.assign_delivery')}
        </button>

        <button className="font-medium text-blue-600 underline hover:no-underline">
          {t('global.cancel')}
        </button>
      </div>
    ),
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
