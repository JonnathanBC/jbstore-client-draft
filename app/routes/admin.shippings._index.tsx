import { useEffect } from 'react'
import { toast } from 'sonner'
import { data, Link, useFetcher, useSearchParams } from 'react-router'
import { Route } from './+types/admin.shippings._index'

import { renderDateTime } from '~/components/table/renders'
import { Table } from '~/components/Table'
import { Badge } from '~/components/Badge'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { Shipping } from '~/types/shippings'
import { Column } from '~/types/table'
import { getShippings, updateShippingStatus } from '~/server/shippings.server'

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

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const formData = request.formData()
  const shippingId = Number((await formData).get('shippingId'))
  const action = (await formData).get('action')

  switch (action) {
    case 'mark-as-paid': {
      const result = await updateShippingStatus({
        token,
        shippingId,
        status: 'completed',
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
    case 'mark-as-failed':
      const result = await updateShippingStatus({
        token,
        shippingId,
        status: 'failed',
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

    default:
      break
  }
}

const ActionButtons = ({ shipping }: { shipping: Shipping }) => {
  const fetcher = useFetcher<{ success?: string; error?: string }>()

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
    if (fetcher.data.success) toast.success(t('global.successfully_updated'))
  }, [fetcher.state, fetcher.data])

  return (
    <fetcher.Form method="post" className="flex flex-col space-y-2">
      <input type="hidden" name="shippingId" value={shipping.id} />

      {shipping?.status === 'pending' && (
        <>
          <button
            type="submit"
            name="action"
            value="mark-as-paid"
            onClick={() => {}}
            className="font-medium text-blue-600 underline hover:no-underline"
          >
            {t('admin.mark_as_paid')}
          </button>
          <button
            type="submit"
            name="action"
            value="mark-as-failed"
            onClick={() => {}}
            className="font-medium text-blue-600 underline hover:no-underline"
          >
            {t('admin.mark_as_a_delivery_error')}
          </button>
        </>
      )}
    </fetcher.Form>
  )
}

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
    render: (row: Shipping) => <>{row.driver.license_plate}</>,
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
    title: 'Reembolsado el',
    dataIndex: 'refunded_at' as const,
    render: (row: Shipping) => <>{renderDateTime(row.refunded_at)}</>,
  },
  {
    title: 'Entregado el',
    dataIndex: 'delivered_at' as const,
    render: (row: Shipping) => <>{renderDateTime(row.delivered_at)}</>,
  },
  {
    title: 'Modificado el',
    dataIndex: 'updated_at' as const,
    render: (row: Shipping) => <>{renderDateTime(row.updated_at)}</>,
  },
  {
    title: 'Acciones',
    render: (row: Shipping) => <ActionButtons shipping={row} />,
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
