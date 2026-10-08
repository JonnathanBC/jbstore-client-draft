import type { Route } from './+types/admin.options.$id.features'
import { requireAuth } from '~/server/auth.server'
import { createFeature } from '~/server/feature.server'
import { handleMutation } from '~/server/mutation.server'

/**
 * Sin default export: sólo es destino de fetchers.
 * POST /admin/options/:id/features → agrega un valor (feature) a la opción.
 * La opción sale de la URL, no del body.
 */
export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    throw new Response('Method Not Allowed', { status: 405 })
  }

  const { token } = await requireAuth(request)
  const { value, description } = await request.json()

  const result = await createFeature(
    { value, description, option_id: Number(params.id) },
    token,
  )

  return handleMutation(request, result, { message: 'Valor agregado' })
}
