import type { Route } from './+types/admin.drivers.$id'
import { RouteModalForm } from '~/components/modals/RouteModalForm'
import { DriverFields, toDriverFormValues } from '~/drivers/DriverFields'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { deleteDriver, getDriver, updateDriver } from '~/server/drivers.server'
import { handleMutation } from '~/server/mutation.server'

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
  const isDelete = request.method === 'DELETE'

  // La URL ya identifica al driver: el método HTTP decide qué hacer con él.
  const result = isDelete
    ? await deleteDriver(params.id, token)
    : await updateDriver(params.id, await request.json(), token)

  return handleMutation(request, result, {
    message: isDelete ? 'Conductor eliminado' : 'Conductor actualizado',
    redirectTo: '/admin/drivers',
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
