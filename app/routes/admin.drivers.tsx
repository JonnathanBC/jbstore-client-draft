import { Link, Outlet, useSearchParams } from 'react-router'
import { Route } from './+types/admin.drivers'

import { renderDateTime } from '~/components/table/renders'
import { Table } from '~/components/Table'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { getDrivers } from '~/server/drivers.server'
import { Column } from '~/types/table'
import { Driver } from '~/types/driver'

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.drivers')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)

  const drivers = await getDrivers({
    token,
    order: {
      updated_at: 'desc',
    },
  })

  return { drivers }
}

const ActionButtons = ({ driver }: { driver: Driver }) => (
  <Link to={String(driver.id)} className="btn btn-primary">
    {t('global.edit')}
  </Link>
)

const columns: Column<Driver>[] = [
  { title: 'ID', dataIndex: 'id' as const },
  {
    title: 'Nombres',
    dataIndex: 'user_id' as const,
    render: (row: Driver) => <>{row.user_id}</>,
  },
  {
    title: 'Tipo',
    dataIndex: 'type' as const,
    render: (row: Driver) => <>{row.type}</>,
  },
  {
    title: 'Matricula vehicular',
    dataIndex: 'license_plate' as const,
    render: (row: Driver) => <>{row.license_plate}</>,
  },
  {
    title: 'Fecha',
    dataIndex: 'updated_at' as const,
    render: (row: Driver) => <>{renderDateTime(row.created_at)}</>,
  },
  {
    title: 'Acciones',
    render: (row: Driver) => <ActionButtons driver={row} />,
  },
]

export default function DriversPage({ loaderData }: Route.ComponentProps) {
  const { drivers } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  return (
    <>
      <div className="mb-4 text-right">
        <Link to="create" className="btn btn-primary">
          {t('global.new')}
        </Link>
      </div>

      <Table<Driver>
        dataSource={drivers.data}
        columns={columns}
        meta={drivers}
        onPageChange={handlePageChange}
      />

      {/* Acá se monta el modal de la ruta hija: /create o /:id */}
      <Outlet />
    </>
  )
}
