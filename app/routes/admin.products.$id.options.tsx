import type { Route } from './+types/admin.products.$id.options'
import { requireSessionUser } from '~/server/auth.context.server'
import { handleMutation } from '~/server/mutation.server'
import { createOptionsProduct } from '~/server/options-product'
import type { OptionsProduct } from '~/types/options-product'

// Action-only: POST /admin/products/:id/options asigna una opción (con sus
// features) al producto. Sin redirect: el loader del producto se revalida.
export async function action({ request, context, params }: Route.ActionArgs) {
  const { token } = requireSessionUser(context)
  const body = (await request.json()) as {
    option_id: number | string
    features: OptionsProduct['features']
  }

  const result = await createOptionsProduct(
    {
      product_id: Number(params.id),
      option_id: Number(body.option_id),
      features: body.features ?? [],
    },
    token,
  )

  return handleMutation(request, result, { message: 'Opción agregada' })
}
