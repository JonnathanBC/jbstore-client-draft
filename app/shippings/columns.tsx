import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '~/components/Badge'
import { renderDateTime } from '~/components/table/renders'
import type { Shipping } from '~/types/shippings'
import { ShippingActions } from './components/ShippingActions'
import { shippingStatusVariants } from './status'

export const shippingColumns: ColumnDef<Shipping>[] = [
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
    cell: ({ row }) => <ShippingActions shipping={row.original} />,
  },
]
