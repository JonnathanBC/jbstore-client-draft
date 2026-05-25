import { data, useFetcher } from 'react-router'
import { Badge } from '~/components/Badge'
import { FeatureForm } from '~/features/FeatureForm'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { createOption, getOptions } from '~/server/options.server'
import { useModalStore } from '~/store/modal.store'
import { createFeature, deleteFeature } from '~/server/feature.server'
import { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.options._index'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

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

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const payload = await request.json()

  const { intent, ...cleanPayload } = payload

  let result

  if (intent === 'create-feature') {
    result = await createFeature(cleanPayload, token)
  } else if (intent === 'delete-feature') {
    result = await deleteFeature(cleanPayload.id, token)
  } else {
    result = await createOption(cleanPayload, token)
  }

  if (result && 'error' in result) {
    return data(
      {
        success: false,
        error: result.error.message,
        errors: result.error.errors,
      },
      { status: result.error.status },
    )
  }

  return {
    success: true,
    result,
  }
}

export default function OptionsIndex({ loaderData }: Route.ComponentProps) {
  const { options } = loaderData
  const openModal = useModalStore((state) => state.open)
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return

    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    } else if (fetcher.data?.success) {
      toast.success('Eliminado con éxito')
    }
  }, [fetcher.data, fetcher.state])

  const handleDelete = (id: string | number) => {
    if (!confirm('¿Estás seguro de eliminar esto?')) return
    fetcher.submit(
      { intent: 'delete-feature', id },
      { method: 'DELETE', encType: 'application/json' },
    )
  }

  return (
    <div>
      <section className="rounded-lg bg-white shadow-lg">
        <header className="px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{t('admin.options')}</h1>
            <button
              onClick={() => openModal('option')}
              className="btn btn-primary"
            >
              Nuevo
            </button>
          </div>
        </header>
        <div className="p-6">
          <div className="space-y-4">
            {options?.data?.map((option) => {
              return (
                <div
                  key={option.id}
                  className="relative rounded-lg border border-zinc-200 bg-white p-6"
                >
                  <div className="absolute -top-3 bg-white px-4">
                    <span>{option.name}</span>
                  </div>

                  {/* Valores */}
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    {option?.features?.map((feature) => {
                      if (option.type === 1) {
                        return (
                          <Badge
                            key={feature.id}
                            label={feature.value}
                            onClick={() => handleDelete(feature.id)}
                          />
                        )
                      }

                      return (
                        <div key={feature.id} className="relative">
                          <span
                            style={{ backgroundColor: feature.value }}
                            className="inline-block size-6 rounded-full border-2 shadow-lg"
                          />

                          <button
                            className="absolute -top-1 left-4 z-10 flex size-3 items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
                            onClick={() => handleDelete(feature.id)}
                          >
                            <X className="size-3 text-white hover:cursor-pointer" />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <FeatureForm option={option} />
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
