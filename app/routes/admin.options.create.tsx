import type { Route } from './+types/admin.options.create'
import { RouteModalForm } from '~/components/modals/RouteModalForm'
import {
  OptionFields,
  toOptionFormValues,
} from '~/features/options/OptionFields'
import { t } from '~/i18n'
import { requireSessionUser } from '~/server/auth.context.server'
import { handleMutation } from '~/server/mutation.server'
import { createOption } from '~/server/options.server'

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.new')} | ${t('admin.options')} | JB Store` },
]

export async function action({ request, context }: Route.ActionArgs) {
  const { token } = requireSessionUser(context)
  const payload = await request.json()

  const result = await createOption(payload, token)

  return handleMutation(request, result, {
    message: 'Opción creada',
    redirectTo: '/admin/options',
  })
}

export default function OptionCreate() {
  return (
    <RouteModalForm
      title="Nueva opción"
      method="POST"
      defaultValues={toOptionFormValues()}
    >
      <OptionFields />
    </RouteModalForm>
  )
}
