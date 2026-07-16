import { useEffect, useState } from 'react'
import { data, Link, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { requireAuth } from '~/server/auth.server'
import { t } from '~/i18n'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.covers._index'
import { getCovers, reorderCovers } from '~/server/covers.server'
import { renderDate } from '~/components/table/renders'
import DndSortable from '~/components/shared/DndSortable'
import type { Cover } from '~/types/cover'

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
    order: { order: 'asc' },
  })

  return { covers }
}

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const form = await request.formData()

  if (form.get('_action') === 'reorder') {
    const ids = String(form.get('ids') ?? '')
      .split(',')
      .map(Number)
      .filter((id) => Number.isFinite(id) && id > 0)

    if (!ids.length) {
      return data({ error: 'Orden inválido' }, { status: 400 })
    }

    const result = await reorderCovers(ids, token)
    if (result && 'error' in result) {
      return data({ error: result.error.message }, { status: result.error.status })
    }
  }

  return data({ error: undefined })
}

export default function CoversIndex({ loaderData }: Route.ComponentProps) {
  const { covers } = loaderData
  const fetcher = useFetcher<typeof action>()
  const [items, setItems] = useState(covers.data)

  // Re-sincroniza cuando el loader revalida (paginación, reorder confirmado, etc.)
  useEffect(() => {
    setItems(covers.data)
  }, [covers.data])

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.data])

  function handleReorder(newItems: Cover[]) {
    setItems(newItems)
    fetcher.submit(
      { _action: 'reorder', ids: newItems.map((item) => item.id).join(',') },
      { method: 'post' },
    )
  }

  return (
    <>
      <div className="mb-4 text-right">
        <Link to="/admin/covers/create" className="btn btn-primary">
          {t('global.new')}
        </Link>
      </div>

      <DndSortable
        items={items}
        onReorder={handleReorder}
        className="space-y-4"
        renderItem={(cover) => (
          <div className="overflow-hidden rounded-lg bg-white shadow-lg lg:flex">
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
                <p>{renderDate(cover.end_at ?? '--')}</p>
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
          </div>
        )}
      />
    </>
  )
}
