import type { Route } from './+types/admin.options.$id.features.$featureId'
import { requireAuth } from '~/server/auth.server'
import { deleteFeature } from '~/server/feature.server'
import { handleMutation } from '~/server/mutation.server'

/**
 * Sin default export: sólo es destino de fetchers.
 * DELETE /admin/options/:id/features/:featureId → elimina el valor.
 */
export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== 'DELETE') {
    throw new Response('Method Not Allowed', { status: 405 })
  }

  const { token } = await requireAuth(request)
  const result = await deleteFeature(Number(params.featureId), token)

  return handleMutation(request, result, { message: 'Valor eliminado' })
}
