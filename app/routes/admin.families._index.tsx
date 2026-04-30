import { Link, useSearchParams } from 'react-router'
import type { Route } from './+types/admin.families._index'
import { requireAuth } from '~/server/auth.server'
import { getFamilies } from '~/server/api.server'
import { Table } from '~/components/Table'
import { t } from '~/i18n'
import type { Family } from '~/types/family'
import type { RouteHandle } from '~/types/route'

export const handle: RouteHandle = { breadcrumb: t('admin.families') }

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.families')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? 1)
  const per_page = Number(url.searchParams.get('per_page') ?? 10)

  const families = await getFamilies({
    token,
    page,
    per_page,
    order: { updated_at: 'desc' },
  })

  return { families }
}

const columns = [
  { title: 'ID', dataIndex: 'id' as const },
  { title: 'Name', dataIndex: 'name' as const },
  {
    title: 'Acciones',
    render: (row: Family) => (
      <Link
        to={`/admin/families/${row.id}`}
        className="text-primary text-sm hover:underline"
      >
        {t('global.edit')}
      </Link>
    ),
  },
]

export default function FamiliesIndex({ loaderData }: Route.ComponentProps) {
  const { families } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  return (
    <>
      <div className="mb-4 text-right">
        <Link to="/admin/families/create" className="btn btn-primary">
          {t('global.new')}
        </Link>
      </div>

      <Table<Family>
        dataSource={families.data}
        columns={columns}
        meta={families}
        onPageChange={handlePageChange}
      />
    </>
  )
}
