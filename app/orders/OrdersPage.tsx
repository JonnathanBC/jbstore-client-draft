import { Link } from 'react-router'

import { DataTable } from '~/components/DataTable'
import { Button } from '~/components/ui/button'
import { t } from '~/i18n'
import type { ApiResponse } from '~/types/api'
import type { Order } from '~/types/orders'
import { orderColumns } from './columns'

/** Presentacional: la ruta trae los datos (loader) y esto solo los compone. */
export const OrdersPage = ({ orders }: { orders: ApiResponse<Order> }) => (
  <DataTable
    data={orders.data}
    columns={orderColumns}
    meta={orders}
    // El endpoint de órdenes todavía no soporta ?search ni ?status
    searchable={false}
    actions={
      <Button asChild>
        <Link to="/admin/orders/create">{t('global.new')}</Link>
      </Button>
    }
  />
)
