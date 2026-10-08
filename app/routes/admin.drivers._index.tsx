import { useEffect } from 'react'
import { toast } from 'sonner'
import { data, Link, useFetcher, useSearchParams } from 'react-router'
import { Route } from './+types/admin.drivers._index'

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

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const formData = await request.formData()
  const intent = formData.get('intent')

  switch (intent) {
    case 'create-driver': {
      // const result = await updateOrderStatus({
      //   token,
      //   orderId,
      //   status: 'processing',
      // })
      // if ('error' in result) {
      //   return data(
      //     {
      //       success: false,
      //       error: result.error.message,
      //       errors: result.error.errors,
      //     },
      //     { status: result.error.status },
      //   )
      // }
      // return { success: true }
    }
  }
}

const ActionButtons = ({ driver }: { driver: Driver }) => {
  const fetcher = useFetcher<{ success?: string; error?: string }>()

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
    if (fetcher.data.success) toast.success(t('global.successfully_created'))
  }, [fetcher.state, fetcher.data])

  console.log({ driver })

  return (
    <fetcher.Form
      method="post"
      className="flex flex-col space-y-2"
    ></fetcher.Form>
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

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  return (
    <>
      <div className="mb-4 text-right">
        <Link to="/admin/drivers/create" className="btn btn-primary">
          {t('global.new')}
        </Link>
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
