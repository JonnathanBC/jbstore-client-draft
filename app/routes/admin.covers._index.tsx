import { Link } from 'react-router'
import { requireAuth } from '~/server/auth.server'
import { t } from '~/i18n'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.covers._index'
import { getCovers } from '~/server/covers.server'
import { renderDate } from '~/components/table/renders'

export const handle: RouteHandle = { breadcrumb: t('admin.covers') }

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.covers')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? 1)
  const per_page = Number(url.searchParams.get('per_page') ?? 10)

  const covers = await getCovers({
    token,
    page,
    per_page,
    order: { updated_at: 'desc' },
  })

  return { covers }
}

export default function CoversIndex({ loaderData }: Route.ComponentProps) {
  const { covers } = loaderData
  return (
    <>
      <div className="mb-4 text-right">
        <Link to="/admin/covers/create" className="btn btn-primary">
          {t('global.new')}
        </Link>
      </div>

      <ul className="space-y-4">
        {covers.data.map((cover) => (
          <li
            key={cover.id}
            className="overflow-hidden rounded-lg bg-white shadow-lg lg:flex"
          >
            <img
              src={cover.image}
              alt=""
              className="aspect-3/1 w-full object-cover object-center lg:w-64"
            />
            <div className="space-y-3 p-4 lg:flex lg:flex-1 lg:items-center lg:justify-between lg:space-y-0">
              <div>
                <h1 className="font-semibold">{cover.title}</h1>
                <p>
                  {cover.is_active ? (
                    <span className="rounded border border-green-100 bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
                      Success
                    </span>
                  ) : (
                    <span className="rounded border border-red-100 bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800">
                      Inactivo
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold">Fecha de inicio</p>
                <p>{renderDate(cover.start_at)}</p>
              </div>
              <div>
                <p className="text-sm font-bold">Fecha de finalización</p>
                <p>{renderDate(cover.end_at) ?? '--'}</p>
              </div>
              <div>
                <Link
                  to={`/admin/covers/${cover.id}`}
                  className="btn btn-sm btn-primary"
                >
                  Editar
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
