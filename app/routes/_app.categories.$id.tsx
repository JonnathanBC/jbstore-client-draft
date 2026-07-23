import { RouteHandle } from '~/types/route'
import type { Route } from './+types/_app.categories.$id'
import { t } from '~/i18n'
import {
  getPublicCategoryProducts,
  type GetPublicCategoryProductsParams,
} from '~/server/categories.server'
import type { Category } from '~/types/category'
import { CategoryProducts } from '~/categories/CategoryProducts'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.category ? `${data.category.name} | JB Store` : 'JB Store',
  },
]

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (match as { data?: { category?: Category } }).data
    return [
      { label: t('global.category') },
      { label: data?.category?.name ?? t('global.edit') },
    ]
  },
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const id = Number(params.id)
  if (!Number.isFinite(id) || id < 1) {
    throw new Response('Categoría no encontrada', { status: 404 })
  }
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page')) || 1
  const orderBy =
    (url.searchParams.get(
      'orderBy',
    ) as GetPublicCategoryProductsParams['orderBy']) ?? undefined
  const search = url.searchParams.get('search') ?? undefined

  try {
    const { category, products } = await getPublicCategoryProducts(id, {
      page,
      per_page: 12,
      orderBy,
      search,
    })
    return { category, products }
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500
    throw new Response(
      status === 404 ? 'Categoría no encontrada' : 'Error del servidor',
      {
        status,
      },
    )
  }
}

export default function CategoryDetail({ loaderData }: Route.ComponentProps) {
  const { category, products } = loaderData
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">
        Resultados de {category.name}
      </h1>
      <CategoryProducts products={products} />
    </div>
  )
}
