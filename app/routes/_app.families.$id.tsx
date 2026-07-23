import { RouteHandle } from '~/types/route'
import type { Route } from './+types/_app.families.$id'
import { t } from '~/i18n'
import {
  getPublicFamily,
  getPublicFamilyOptions,
  getPublicFamilyProducts,
} from '~/server/families.server'
import type { Family } from '~/types/family'
import { FamilyOptionProductsFilter } from '~/families/FamilyOptionProductsFilter'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.family ? `${data.family.name} | JB Store` : 'JB Store',
  },
]

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (match as { data?: { family?: Family } }).data
    return [
      { label: t('global.family') },
      { label: data?.family?.name ?? t('global.edit') },
    ]
  },
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const id = Number(params.id)
  if (!Number.isFinite(id) || id < 1) {
    throw new Response('Familia no encontrada', { status: 404 })
  }
  const url = new URL(request.url)
  const features = url.searchParams
    .getAll('features')
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0)
  const page = Number(url.searchParams.get('page')) || 1
  const orderBy = url.searchParams.get('orderBy') ?? undefined

  try {
    const [family, options, products] = await Promise.all([
      getPublicFamily(id),
      getPublicFamilyOptions(id),
      getPublicFamilyProducts(id, { features, page, per_page: 12, orderBy }),
    ])
    return { family, options, products }
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500
    throw new Response(
      status === 404 ? 'Familia no encontrada' : 'Error del servidor',
      {
        status,
      },
    )
  }
}

export default function FamilyDetail({ loaderData }: Route.ComponentProps) {
  const { family, options, products } = loaderData
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">
        Productos de {family.name}
      </h1>
      <FamilyOptionProductsFilter options={options} products={products} />
    </div>
  )
}
