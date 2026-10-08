import { data, useSearchParams } from 'react-router'
import { Route } from './+types/admin.drivers._index'

import { renderDateTime } from '~/components/table/renders'
import { Table } from '~/components/Table'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import {
  createDriver,
  getDrivers,
  updateDriver,
} from '~/server/drivers.server'
import { useModalStore } from '~/store/modal.store'
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

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const { intent, id, ...payload } = await request.json()

  const result =
    intent === 'update-driver'
      ? await updateDriver(id, payload, token)
      : await createDriver(payload, token)

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

const ActionButtons = ({ driver }: { driver: Driver }) => {
  const openModal = useModalStore((state) => state.open)

  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => openModal('driver', { driver })}
    >
      {t('global.edit')}
    </button>
  )
}

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
  const openModal = useModalStore((state) => state.open)

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  return (
    <>
      <div className="mb-4 text-right">
        <button
          type="button"
          onClick={() => openModal('driver')}
          className="btn btn-primary"
        >
          {t('global.new')}
        </button>
      </div>

      <Table<Driver>
        dataSource={drivers.data}
        columns={columns}
        meta={drivers}
        onPageChange={handlePageChange}
      />
    </>
  )
}
