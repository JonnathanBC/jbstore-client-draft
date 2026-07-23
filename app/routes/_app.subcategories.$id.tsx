import { RouteHandle } from '~/types/route'
import type { Route } from './+types/_app.subcategories.$id'
import { t } from '~/i18n'
import {
  getPublicSubcategoryProducts,
  type GetPublicSubcategoryProductsParams,
} from '~/server/subcategories.server'
import type { SubCategory } from '~/types/subcategory'
import { SubcategoryProducts } from '~/subcategories/SubcategoryProducts'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.subcategory
      ? `${data.subcategory.name} | JB Store`
      : 'JB Store',
  },
]

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (match as { data?: { subcategory?: SubCategory } }).data
    return [
      { label: t('global.subcategory') },
      { label: data?.subcategory?.name ?? t('global.edit') },
    ]
  },
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const id = Number(params.id)
  if (!Number.isFinite(id) || id < 1) {
    throw new Response('Subcategoría no encontrada', { status: 404 })
  }
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page')) || 1
  const orderBy =
    (url.searchParams.get(
      'orderBy',
    ) as GetPublicSubcategoryProductsParams['orderBy']) ?? undefined
  const search = url.searchParams.get('search') ?? undefined

  try {
    const { subcategory, products } = await getPublicSubcategoryProducts(id, {
      page,
      per_page: 12,
      orderBy,
      search,
    })
    return { subcategory, products }
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500
    throw new Response(
      status === 404 ? 'Subcategoría no encontrada' : 'Error del servidor',
      {
        status,
      },
    )
  }
}

export default function SubcategoryDetail({
  loaderData,
}: Route.ComponentProps) {
  const { subcategory, products } = loaderData
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">
        Resultados de {subcategory.name}
      </h1>
      <SubcategoryProducts products={products} />
    </div>
  )
}
