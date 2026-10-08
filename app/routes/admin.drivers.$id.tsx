import { data, redirect } from 'react-router'

import type { Route } from './+types/admin.drivers.$id'
import { RouteModalForm } from '~/components/modals/RouteModalForm'
import { DriverFields, toDriverFormValues } from '~/drivers/DriverFields'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { getDriver, updateDriver } from '~/server/drivers.server'
import { commitSession, getSession } from '~/server/session.server'

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.edit')} | ${t('admin.drivers')} | JB Store` },
]

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const driver = await getDriver(params.id, token)

  return { driver }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const payload = await request.json()

  const result = await updateDriver(params.id, payload, token)

  if ('error' in result) {
    return data(
      { error: result.error.message, errors: result.error.errors },
      { status: result.error.status },
    )
  }

  const session = await getSession(request.headers.get('Cookie'))
  session.flash('toast', { kind: 'success', title: 'Conductor actualizado' })

  return redirect('/admin/drivers', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function DriverEdit({ loaderData }: Route.ComponentProps) {
  const { driver } = loaderData

  return (
    <RouteModalForm
      key={driver.id}
      title="Editar conductor"
      method="PATCH"
      defaultValues={toDriverFormValues(driver)}
    >
      <DriverFields />
    </RouteModalForm>
  )
}
