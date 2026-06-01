import { data, redirect } from 'react-router'
import type { Route } from './+types/admin.families.$id'
import { requireAuth } from '~/server/auth.server'
import { deleteFamily, getFamily, updateFamily } from '~/server/api.server'
import { commitSession, getSession } from '~/server/session.server'
import { FamilyForm } from '~/components/admin/families/FamilyForm'
import { t } from '~/i18n'
import type { RouteHandle } from '~/types/route'
import { useEffect } from 'react'
import { toast } from 'sonner'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.family
      ? `${data.family.name} | JB Store`
      : `${t('global.edit')} | JB Store`,
  },
]

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (match as { data?: { family?: { name: string } } }).data
    return [
      { label: t('admin.families'), to: '/admin/families' },
      { label: data?.family?.name ?? t('global.edit') },
    ]
  },
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const id = Number(params.id)
  if (!Number.isFinite(id) || id < 1) {
    throw new Response('Familia no encontrada', { status: 404 })
  }
  try {
    const family = await getFamily(id, token)
    return { family }
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

export async function action({ request, params }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const id = Number(params.id)
  if (!Number.isFinite(id) || id < 1) return { error: 'ID inválido' }

  const form = await request.formData()
  const intent = form.get('_action')
  const session = await getSession(request.headers.get('Cookie'))

  if (intent === 'delete') {
    const result = await deleteFamily(id, token)
    if ('error' in result) {
      return data(
        { error: result.error.message, errors: [] },
        { status: result.error.status },
      )
    }

    session.flash('toast', {
      kind: 'success',
      title: 'Familia eliminada',
    })

    return redirect('/admin/families', {
      headers: { 'Set-Cookie': await commitSession(session) },
    })
  }

  if (intent !== 'update' && intent !== null) {
    return data({ error: 'Intent desconocido', errors: [] }, { status: 400 })
  }

  const name = String(form.get('name') ?? '').trim()

  const result = await updateFamily(id, { name }, token)

  if ('error' in result) {
    return data(
      { error: result.error.message, errors: [] },
      { status: result.error.status },
    )
  }

  session.flash('toast', {
    kind: 'success',
    title: 'Éxito',
  })

  return redirect('/admin/families', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function FamilyEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { family } = loaderData

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <div className="card">
      <FamilyForm family={family} />
    </div>
  )
}
