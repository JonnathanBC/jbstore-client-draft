import { useEffect } from 'react'
import { data, redirect } from 'react-router'
import { toast } from 'sonner'

import { requireAuth } from '~/server/auth.server'
import { t } from '~/i18n'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.covers.create'
import { CoverForm } from '~/covers/CoverForm'
import { FormProvider } from '~/components/form/FormProvider'
import { createCover } from '~/server/covers.server'
import { commitSession, getSession } from '~/server/session.server'

export const handle: RouteHandle = {
  breadcrumb: [
    { label: t('admin.covers'), to: '/admin/covers' },
    { label: t('global.new') },
  ],
}

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.new')} ${t('admin.covers')} | JB Store` },
]

export async function action({ request }: Route.ActionArgs) {
  const [{ token }, form] = await Promise.all([
    requireAuth(request),
    request.formData(),
  ])

  form.delete('_action')

  const result = await createCover(form, token)

  if ('error' in result) {
    return data(
      { error: result.error.message, errors: result.error.errors },
      { status: result.error.status },
    )
  }

  const session = await getSession(request.headers.get('Cookie'))
  session.flash('toast', {
    kind: 'success',
    title: 'Portada creada con éxito',
  })

  return redirect('/admin/covers', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function CoversCreate({ actionData }: Route.ComponentProps) {
  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <div className="card">
      <h1 className="mb-4 text-xl font-semibold">Nueva Portada</h1>
      <FormProvider actionData={actionData}>
        <CoverForm />
      </FormProvider>
    </div>
  )
}
