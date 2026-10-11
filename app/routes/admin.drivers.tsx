import { useEffect } from 'react'
import { Link, Outlet, useFetcher, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Route } from './+types/admin.drivers'

import { showDeleteConfirm } from '~/components/confirm/showDeleteConfirm'
import { renderDateTime } from '~/components/table/renders'
import { Table } from '~/components/Table'
import { t } from '~/i18n'
import { requireAdmin } from '~/server/auth.server'
import { getDrivers } from '~/server/drivers.server'
import { Column } from '~/types/table'
import { Driver } from '~/types/driver'
import { Button } from '~/components/ui/button'

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.drivers')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAdmin(request)

  const drivers = await getDrivers({
    token,
    order: {
      updated_at: 'desc',
    },
  })

  return { drivers }
}

const ActionButtons = ({ driver }: { driver: Driver }) => {
  const fetcher = useFetcher<{ error?: string }>()

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.state, fetcher.data])

  const handleDelete = async () => {
    if (!(await showDeleteConfirm())) return
    // DELETE a /admin/drivers/:id → lo resuelve el action de admin.drivers.$id
    fetcher.submit(null, { method: 'DELETE', action: String(driver.id) })
  }

  return (
    <>
      <Button asChild>
        <Link to={String(driver.id)} className="mr-4">
          {t('global.edit')}
        </Link>
      </Button>
      <Button
        variant="danger"
        type="button"
        disabled={fetcher.state !== 'idle'}
        onClick={handleDelete}
      >
        {t('global.delete')}
      </Button>
    </>
  )
}

const columns: Column<Driver>[] = [
  { title: 'ID', dataIndex: 'id' as const },
  {
    title: 'Nombres',
    dataIndex: 'user_id' as const,
    render: (row: Driver) => (
      <span>
        {row.user.first_name} {row.user.last_name}
      </span>
    ),
  },
  {
    title: 'Tipo',
    dataIndex: 'type' as const,
    render: (row: Driver) => (
      <span>
        {row.type === 'car' && <span>Automovil</span>}
        {row.type === 'motorcycle' && <span>Motocicleta</span>}
      </span>
    ),
  },
  {
    title: 'Placa',
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
        <Button asChild>
          <Link to="create">{t('global.new')}</Link>
        </Button>
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
