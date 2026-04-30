import { useEffect } from 'react'
import { data, redirect } from 'react-router'
import { toast } from 'sonner'

import type { Route } from './+types/admin.categories.create'
import { CategoryForm } from '~/components/admin/categories/CategoryForm'
import { t } from '~/i18n'
import type { RouteHandle } from '~/types/route'
import { requireAuth } from '~/server/auth.server'
import { createCategory } from '~/server/categories.server'
import { commitSession, getSession } from '~/server/session.server'

export const handle: RouteHandle = { breadcrumb: t('global.new') }

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.new')} ${t('admin.category')} | JB Store` },
]

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const form = await request.formData()
  const familyId = Number(form.get('family_id'))
  const name = String(form.get('name') ?? '').trim()

  const result = await createCategory({ name, family_id: familyId }, token)

  if ('error' in result) {
    return data(
      { error: result.error.message, errors: result.error.errors },
      { status: result.error.status },
    )
  }

  const session = await getSession(request.headers.get('Cookie'))
  session.flash('toast', {
    kind: 'success',
    title: 'Categoría creada con exitó',
  })

  return redirect('/admin/categories', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function CategoryCreate({ actionData }: Route.ComponentProps) {
  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <div className="card">
      <h1 className="mb-4 text-xl font-semibold">Nueva Categoria</h1>
      <CategoryForm validationErrors={actionData?.errors} />
    </div>
  )
}
