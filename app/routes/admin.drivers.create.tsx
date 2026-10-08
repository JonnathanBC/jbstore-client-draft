import { data, redirect } from 'react-router'

import type { Route } from './+types/admin.drivers.create'
import { RouteModalForm } from '~/components/modals/RouteModalForm'
import { DriverFields, toDriverFormValues } from '~/drivers/DriverFields'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { createDriver } from '~/server/drivers.server'
import { commitSession, getSession } from '~/server/session.server'

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.new')} | ${t('admin.drivers')} | JB Store` },
]

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const payload = await request.json()

  const result = await createDriver(payload, token)

  if ('error' in result) {
    return data(
      { error: result.error.message, errors: result.error.errors },
      { status: result.error.status },
    )
  }

  const session = await getSession(request.headers.get('Cookie'))
  session.flash('toast', { kind: 'success', title: 'Conductor creado' })

  return redirect('/admin/drivers', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function DriverCreate() {
  return (
    <RouteModalForm
      title="Nuevo conductor"
      method="POST"
      defaultValues={toDriverFormValues()}
    >
      <DriverFields />
    </RouteModalForm>
  )
}
