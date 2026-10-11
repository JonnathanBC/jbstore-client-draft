import { useEffect } from 'react'
import { toast } from 'sonner'
import { data, Link, useFetcher } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Route } from './+types/admin.shippings._index'

import { renderDateTime } from '~/components/table/renders'
import { DataTable, type DataTableFilter } from '~/components/DataTable'
import { Badge } from '~/components/Badge'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { Shipping, ShippingStatusEnum } from '~/types/shippings'
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
  const searchParams = new URL(request.url).searchParams

  const search = searchParams.get('search') || undefined
  const status = searchParams.get('status') as ShippingStatusEnum | null
  const page = Number(searchParams.get('page')) || undefined

  const shippings = await getShippings({
    token,
    search,
    // Un status que no existe se ignora, si no el backend responde 422
    status: status && status in shippingStatusVariants ? status : undefined,
    page,
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
    case 'mark-as-failed': {
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
    }

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
            className="font-medium text-blue-600 underline hover:no-underline"
          >
            {t('admin.mark_as_paid')}
          </button>
          <button
            type="submit"
            name="action"
            value="mark-as-failed"
            className="font-medium text-blue-600 underline hover:no-underline"
          >
            {t('admin.mark_as_a_delivery_error')}
          </button>
        </>
      )}
    </fetcher.Form>
  )
}

const columns: ColumnDef<Shipping>[] = [
  { header: 'ID', accessorKey: 'id' },
  { header: 'No Orden', accessorKey: 'order_id' },
  {
    header: 'Conductor',
    id: 'driver',
    cell: ({ row }) => (
      <>
        {row.original.driver.user.first_name}{' '}
        {row.original.driver.user.last_name}
      </>
    ),
  },
  {
    header: 'Placa',
    id: 'license_plate',
    cell: ({ row }) => <>{row.original.driver.license_plate}</>,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge
        label={row.original.status}
        labelClassName="capitalize"
        variant={shippingStatusVariants[row.original.status]}
      />
    ),
  },
  {
    header: 'Reembolsado el',
    accessorKey: 'refunded_at',
    cell: ({ row }) => <>{renderDateTime(row.original.refunded_at)}</>,
  },
  {
    header: 'Entregado el',
    accessorKey: 'delivered_at',
    cell: ({ row }) => <>{renderDateTime(row.original.delivered_at)}</>,
  },
  {
    header: 'Modificado el',
    accessorKey: 'updated_at',
    cell: ({ row }) => <>{renderDateTime(row.original.updated_at)}</>,
  },
  {
    header: 'Acciones',
    id: 'actions',
    cell: ({ row }) => <ActionButtons shipping={row.original} />,
  },
]

const filters: DataTableFilter[] = [
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

export default function ShippingsPage({ loaderData }: Route.ComponentProps) {
  const { shippings } = loaderData

  return (
    <DataTable
      data={shippings.data}
      columns={columns}
      meta={shippings}
      filters={filters}
      searchPlaceholder="Buscar por conductor o placa"
      actions={
        <Link to="/admin/orders/create" className="btn btn-primary">
          {t('global.new')}
        </Link>
      }
    />
  )
}
