import { useEffect } from 'react'
import { data, redirect } from 'react-router'
import { toast } from 'sonner'

import { requireAuth } from '~/server/auth.server'
import { t } from '~/i18n'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.covers.$id'
import { CoverForm } from '~/covers/CoverForm'
import { FormProvider } from '~/components/form/FormProvider'
import { deleteCover, getCover, updateCover } from '~/server/covers.server'
import { commitSession, getSession } from '~/server/session.server'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.cover
      ? `${data.cover.title} | JB Store`
      : `${t('global.edit')} | JB Store`,
  },
]

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (match as { data?: { cover?: { title: string } } }).data
    return [
      { label: t('admin.covers'), to: '/admin/covers' },
      { label: data?.cover?.title ?? t('global.edit') },
    ]
  },
}

/**
 * Laravel serializes datetimes as UTC ISO ("2026-07-15T00:00:00.000000Z").
 * Handing that to the Datepicker shifts it a day back in UTC-3, so keep only
 * the date part — vigencia is day-granular by design.
 */
const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '')

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const id = Number(params.id)
  if (!Number.isFinite(id) || id < 1) {
    throw new Response('Portada no encontrada', { status: 404 })
  }

  try {
    const cover = await getCover(id, token)
    return { cover }
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500
    throw new Response(
      status === 404 ? 'Portada no encontrada' : 'Error del servidor',
      { status },
    )
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const id = Number(params.id)
  if (!Number.isFinite(id) || id < 1) {
    return data({ error: 'ID inválido', errors: undefined }, { status: 400 })
  }

  const form = await request.formData()
  const intent = form.get('_action')
  const session = await getSession(request.headers.get('Cookie'))

  if (intent === 'delete') {
    const result = await deleteCover(id, token)
    if (result && 'error' in result) {
      return data(
        { error: result.error.message, errors: undefined },
        { status: result.error.status },
      )
    }

    session.flash('toast', {
      kind: 'success',
      title: 'Portada eliminada correctamente',
    })

    return redirect('/admin/covers', {
      headers: { 'Set-Cookie': await commitSession(session) },
    })
  }

  form.delete('_action')
  form.delete('id')

  const result = await updateCover(id, form, token)

  if ('error' in result) {
    return data(
      { error: result.error.message, errors: result.error.errors },
      { status: result.error.status },
    )
  }

  session.flash('toast', {
    kind: 'success',
    title: 'Portada actualizada con éxito',
  })

  return redirect('/admin/covers', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function CoversEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { cover } = loaderData

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <div className="card">
      <h1 className="mb-4 text-xl font-semibold">{cover.title}</h1>
      <FormProvider
        actionData={actionData}
        options={{
          defaultValues: {
            title: cover.title,
            start_at: toDateInput(cover.start_at),
            end_at: toDateInput(cover.end_at),
            is_active: cover.is_active ? '1' : '0',
          },
        }}
      >
        <CoverForm cover={cover} />
      </FormProvider>
    </div>
  )
}
