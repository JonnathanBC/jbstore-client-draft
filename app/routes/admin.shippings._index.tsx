import { data } from 'react-router'
import { Route } from './+types/admin.shippings._index'

import { t } from '~/i18n'
import { requireAdmin } from '~/server/auth.server'
import { handleMutation, type MutationResult } from '~/server/mutation.server'
import { getShippings, updateShippingStatus } from '~/server/shippings.server'
import { ShippingsPage } from '~/shippings/ShippingsPage'
import {
  isShippingIntent,
  isShippingStatus,
  SHIPPING_INTENTS,
} from '~/shippings/status'

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.shippings')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAdmin(request)
  const searchParams = new URL(request.url).searchParams
  const status = searchParams.get('status')

  const shippings = await getShippings({
    token,
    search: searchParams.get('search') || undefined,
    // Un status que no existe se ignora, si no el backend responde 422
    status: isShippingStatus(status) ? status : undefined,
    page: Number(searchParams.get('page')) || undefined,
    order: { updated_at: 'desc' },
  })

  return { shippings }
}

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAdmin(request)
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (!isShippingIntent(intent)) {
    return data<MutationResult>(
      { ok: false, error: 'Acción inválida' },
      { status: 400 },
    )
  }

  const result = await updateShippingStatus({
    token,
    shippingId: Number(formData.get('shippingId')),
    status: SHIPPING_INTENTS[intent],
  })

  return handleMutation(request, result, {
    message: t('global.successfully_updated'),
  })
}

export default function AdminShippingsRoute({
  loaderData,
}: Route.ComponentProps) {
  return <ShippingsPage shippings={loaderData.shippings} />
}
