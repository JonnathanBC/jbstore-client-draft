import { Link } from 'react-router'

import { DataTable } from '~/components/DataTable'
import { Button } from '~/components/ui/button'
import { t } from '~/i18n'
import type { ApiResponse } from '~/types/api'
import type { Shipping } from '~/types/shippings'
import { shippingColumns } from './columns'
import { shippingFilters } from './status'

/** Presentacional: la ruta trae los datos (loader) y esto solo los compone. */
export const ShippingsPage = ({
  shippings,
}: {
  shippings: ApiResponse<Shipping>
}) => (
  <DataTable
    data={shippings.data}
    columns={shippingColumns}
    meta={shippings}
    filters={shippingFilters}
    searchPlaceholder="Buscar por conductor o placa"
    actions={
      <Button asChild>
        <Link to="/admin/orders/create">{t('global.new')}</Link>
      </Button>
    }
  />
)
