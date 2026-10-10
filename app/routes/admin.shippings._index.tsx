import { Link, useSearchParams } from 'react-router'
import { Route } from './+types/admin.shippings._index'

import { renderDateTime } from '~/components/table/renders'
import { Table } from '~/components/Table'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { Shipping } from '~/types/shippings'
import { Column } from '~/types/table'
import { getShippings } from '~/server/shippings.server'
import { Badge } from '~/components/Badge'

const shippingStatusVariants = {
  pending: 'warning',
  completed: 'success',
  failed: 'danger',
} as const satisfies Record<
  Shipping['status'],
  NonNullable<React.ComponentProps<typeof Badge>['variant']>
>

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.shippings')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)

  const shippings = await getShippings({
    token,
    order: {
      updated_at: 'desc',
    },
  })

  return { shippings }
}

export async function action({ request }: Route.ActionArgs) {}

const columns: Column<Shipping>[] = [
  { title: 'ID', dataIndex: 'id' as const },
  { title: 'No Orden', dataIndex: 'order_id' as const },
  {
    title: 'Conductor',
    dataIndex: 'driver' as const,
    render: (row: Shipping) => (
      <>
        {row.driver.user.first_name} {row.driver.user.last_name}
      </>
    ),
  },
  {
    title: 'Placa',
    dataIndex: 'driver' as const,
    render: (row: Shipping) => <>{row.driver.plate_number}</>,
  },
  {
    title: 'Status',
    dataIndex: 'status' as const,
    render: (row: Shipping) => (
      <Badge
        label={row.status}
        labelClassName="capitalize"
        variant={shippingStatusVariants[row.status]}
      />
    ),
  },
  {
    title: 'Modificado el',
    dataIndex: 'updated_at' as const,
    render: (row: Shipping) => <>{renderDateTime(row.updated_at)}</>,
  },
]

export default function ShippingsPage({ loaderData }: Route.ComponentProps) {
  const { shippings } = loaderData
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

      <Table<Shipping>
        dataSource={shippings.data}
        columns={columns}
        meta={shippings}
        onPageChange={handlePageChange}
      />
    </>
  )
}
