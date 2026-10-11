import type { Route } from './+types/admin.drivers.create'
import { RouteModalForm } from '~/components/modals/RouteModalForm'
import { DriverFields, toDriverFormValues } from '~/drivers/DriverFields'
import { t } from '~/i18n'
import { requireAdmin } from '~/server/auth.server'
import { createDriver } from '~/server/drivers.server'
import { handleMutation } from '~/server/mutation.server'

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.new')} | ${t('admin.drivers')} | JB Store` },
]

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAdmin(request)
  const payload = await request.json()

  const result = await createDriver(payload, token)

  return handleMutation(request, result, {
    message: 'Conductor creado',
    redirectTo: '/admin/drivers',
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
