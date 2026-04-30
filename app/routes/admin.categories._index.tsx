import { Link, useSearchParams } from 'react-router'

import { Table } from '~/components/Table'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { getCategories } from '~/server/categories.server'
import type { RouteHandle } from '~/types/route'
import type { Category } from '~/types/category'
import type { Route } from './+types/admin.categories._index'

export const handle: RouteHandle = { breadcrumb: t('admin.categories') }

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.categories')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? 1)
  const per_page = Number(url.searchParams.get('per_page') ?? 10)

  const categories = await getCategories({
    token,
    page,
    per_page,
    order: { updated_at: 'desc' },
  })

  return { categories }
}

const columns = [
  { title: 'ID', dataIndex: 'id' as const },
  { title: 'Name', dataIndex: 'name' as const },
  {
    title: 'Familia',
    dataIndex: 'family' as const,
    render: (row: Category) => <p>{row?.family?.name}</p>,
  },
  {
    title: 'Acciones',

    render: (row: Category) => (
      <Link
        to={`/admin/categories/${row.id}`}
        className="text-primary text-sm hover:underline"
      >
        {t('global.edit')}
      </Link>
    ),
  },
]

export default function CategoriesIndex({ loaderData }: Route.ComponentProps) {
  const { categories } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  return (
    <>
      <div className="mb-4 text-right">
        <Link to="/admin/categories/create" className="btn btn-primary">
          {t('global.new')}
        </Link>
      </div>

      <Table<Category>
        dataSource={categories.data}
        columns={columns}
        meta={categories}
        onPageChange={handlePageChange}
      />
    </>
  )
}
