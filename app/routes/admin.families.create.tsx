import { redirect } from 'react-router'
import type { Route } from './+types/admin.families.create'
import { requireAuth } from '~/server/auth.server'
import { createFamily } from '~/server/api.server'
import { commitSession, getSession } from '~/server/session.server'
import { FamilyForm } from '~/components/admin/families/FamilyForm'
import { t } from '~/i18n'
import type { RouteHandle } from '~/types/route'

export const handle: RouteHandle = { breadcrumb: t('global.new') }

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.new')} ${t('admin.families')} | JB Store` },
]

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const form = await request.formData()
  const name = String(form.get('name') ?? '').trim()

  if (!name) {
    return { error: 'El nombre es obligatorio' }
  }

  const result = await createFamily({ name }, token)
  if ('error' in result) {
    return { error: result.error.message }
  }

  const session = await getSession(request.headers.get('Cookie'))
  session.flash('toast', {
    kind: 'success',
    title: 'Familia creada',
  })

  return redirect('/admin/families', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function FamilyCreate({ actionData }: Route.ComponentProps) {
  return (
    <div className="card">
      <h1 className="mb-4 text-xl font-semibold">Nueva familia</h1>
      <FamilyForm error={actionData?.error} />
    </div>
  )
}
