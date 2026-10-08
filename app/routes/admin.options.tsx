import { Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Outlet, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { Route } from './+types/admin.options'

import { Badge } from '~/components/Badge'
import { showDeleteConfirm } from '~/components/confirm/showDeleteConfirm'
import { FeatureForm } from '~/features/FeatureForm'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import type { MutationResult } from '~/server/mutation.server'
import { getOptions } from '~/server/options.server'
import { Feature } from '~/types/feature'
import { Option } from '~/types/option'
import { RouteHandle } from '~/types/route'

export const handle: RouteHandle = { breadcrumb: t('admin.options') }

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.options')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? 1)
  const per_page = Number(url.searchParams.get('per_page') ?? 10)

  const options = await getOptions({
    token,
    page,
    per_page,
    order: { updated_at: 'desc' },
  })

  return { options }
}

/** DELETE a `action` con confirmación; el toast de éxito llega por flash. */
const useDeleteFetcher = (action: string) => {
  const fetcher = useFetcher<MutationResult>()

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.state, fetcher.data])

  const remove = async () => {
    if (!(await showDeleteConfirm())) return
    fetcher.submit(null, { method: 'DELETE', action })
  }

  return { remove, isDeleting: fetcher.state !== 'idle' }
}

const DeleteOptionButton = ({ option }: { option: Option }) => {
  // DELETE /admin/options/:id → admin.options.$id
  const { remove, isDeleting } = useDeleteFetcher(String(option.id))

  return (
    <button
      type="button"
      className="mr-1 text-red-500 hover:text-red-600 disabled:opacity-50"
      disabled={isDeleting}
      onClick={remove}
    >
      <Trash2 className="size-5" />
    </button>
  )
}

const FeatureItem = ({
  option,
  feature,
}: {
  option: Option
  feature: Feature
}) => {
  // DELETE /admin/options/:id/features/:featureId → admin.options.$id.features.$featureId
  const { remove, isDeleting } = useDeleteFetcher(
    `${option.id}/features/${feature.id}`,
  )

  if (option.type === 1) {
    return <Badge label={feature.value} onClick={remove} />
  }

  return (
    <div className="relative">
      <span
        style={{ backgroundColor: feature.value }}
        className="inline-block size-6 rounded-full border-2 shadow-lg"
      />

      <button
        type="button"
        className="absolute -top-1 left-4 z-10 flex size-3 items-center justify-center rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-50"
        disabled={isDeleting}
        onClick={remove}
      >
        <X className="size-3 text-white" />
      </button>
    </div>
  )
}

export default function OptionsPage({ loaderData }: Route.ComponentProps) {
  const { options } = loaderData

  return (
    <div>
      <section className="rounded-lg bg-white shadow-lg">
        <header className="px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{t('admin.options')}</h1>
            <Link to="create" className="btn btn-primary">
              {t('global.new')}
            </Link>
          </div>
        </header>
        <div className="p-6">
          <div className="space-y-4">
            {options?.data?.map((option) => (
              <div
                key={option.id}
                className="relative rounded-lg border border-zinc-200 bg-white p-6"
              >
                <div className="absolute -top-3 flex items-center bg-white px-4">
                  <DeleteOptionButton option={option} />
                  <span>{option.name}</span>
                </div>

                {/* Valores */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  {option?.features?.map((feature) => (
                    <FeatureItem
                      key={feature.id}
                      option={option}
                      feature={feature}
                    />
                  ))}
                </div>

                <FeatureForm option={option} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de la ruta hija: /create */}
      <Outlet />
    </div>
  )
}
