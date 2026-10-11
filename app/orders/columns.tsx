import type { ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router'

import { Badge } from '~/components/Badge'
import { PdfIcon } from '~/components/icons/PdfIcon'
import { renderDateTime } from '~/components/table/renders'
import type { Order } from '~/types/orders'
import { OrderActions } from './components/OrderActions'
import { orderItemsCount, orderStatusVariants } from './status'

export const orderColumns: ColumnDef<Order>[] = [
  { header: 'No Orden', accessorKey: 'id' },
  {
    header: 'Ticket',
    id: 'ticket',
    cell: ({ row }) => (
      <Link
        to={`/resources/orders/${row.original.id}/ticket`}
        reloadDocument
        aria-label={`Descargar ticket de la orden ${row.original.id}`}
      >
        <PdfIcon className="size-10" />
      </Link>
    ),
  },
  {
    header: 'Fecha',
    accessorKey: 'created_at',
    cell: ({ row }) => <>{renderDateTime(row.original.created_at)}</>,
  },
  {
    header: 'Total',
    accessorKey: 'total',
    cell: ({ row }) => <>S/ {row.original.total}</>,
  },
  {
    header: 'Cantidad',
    id: 'items_count',
    cell: ({ row }) => <>{orderItemsCount(row.original)}</>,
  },
  {
    header: 'Estado',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge
        label={row.original.status}
        labelClassName="capitalize"
        variant={orderStatusVariants[row.original.status]}
      />
    ),
  },
  {
    header: 'Acciones',
    id: 'actions',
    cell: ({ row }) => <OrderActions order={row.original} />,
  },
]
