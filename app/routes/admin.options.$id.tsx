import type { Route } from './+types/admin.options.$id'
import { requireAuth } from '~/server/auth.server'
import { handleMutation } from '~/server/mutation.server'
import { deleteOption } from '~/server/options.server'

/**
 * Sin default export: sólo es destino de fetchers.
 * DELETE /admin/options/:id → elimina la opción.
 */
export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== 'DELETE') {
    throw new Response('Method Not Allowed', { status: 405 })
  }

  const { token } = await requireAuth(request)
  const result = await deleteOption(Number(params.id), token)

  return handleMutation(request, result, { message: 'Opción eliminada' })
}
