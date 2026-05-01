import { Link, useSearchParams } from 'react-router'
import { requireAuth } from '~/server/auth.server'
import { Table } from '~/components/Table'
import { t } from '~/i18n'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.products._index'
import { getProducts } from '~/server/products.server'
import { Product } from '~/types/product'
import { Column } from '~/types/table'

export const handle: RouteHandle = { breadcrumb: t('global.products') }

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.products')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? 1)
  const per_page = Number(url.searchParams.get('per_page') ?? 10)

  const products = await getProducts({
    token,
    page,
    per_page,
    order: { updated_at: 'desc' },
  })

  return { products }
}

const columns: Column<Product>[] = [
  { title: 'SKU', dataIndex: 'sku' },
  { title: t('global.name'), dataIndex: 'name' },
  { title: t('global.price'), dataIndex: 'price' },
  {
    title: t('global.actions'),
    render: (row: Product) => (
      <Link
        to={`/admin/products/${row.id}`}
        className="text-primary text-sm hover:underline"
      >
        {t('global.edit')}
      </Link>
    ),
  },
]

export default function ProductsIndex({ loaderData }: Route.ComponentProps) {
  const { products } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  return (
    <>
      <div className="mb-4 text-right">
        <Link to="/admin/products/create" className="btn btn-primary">
          {t('global.new')}
        </Link>
      </div>

      <Table<Product>
        dataSource={products.data}
        columns={columns}
        meta={products}
        onPageChange={handlePageChange}
      />
    </>
  )
}
