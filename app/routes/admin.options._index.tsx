import { data } from 'react-router'
import { Badge } from '~/components/Badge'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { createOption, getOptions } from '~/server/options.server'
import { useModalStore } from '~/store/modal.store'
import { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.options._index'

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
  const result = await createOption(payload, token)

  if ('error' in result) {
    return data(
      { error: result.error.message, errors: [] },
      { status: result.error.status },
    )
  }

  return { success: true, data: result }
}

export default function OptionsIndex({ loaderData }: Route.ComponentProps) {
  const { options } = loaderData
  const openModal = useModalStore((state) => state.open)

  return (
    <div>
      <section className="rounded-lg bg-white shadow-lg">
        <header className="border-b border-zinc-200 px-6 py-3">
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
                  <div className="flex flex-wrap items-center gap-2">
                    {option?.features?.map((feature) => {
                      if (option.type === 1) {
                        return (
                          <Badge key={feature.id} label={feature.description} />
                        )
                      }

                      return (
                        <span
                          style={{ backgroundColor: feature.value }}
                          className="inline-block size-6 rounded-full border-2 shadow-lg"
                          key={feature.id}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
