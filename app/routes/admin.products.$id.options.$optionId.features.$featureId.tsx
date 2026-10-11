import type { Route } from './+types/admin.products.$id.options.$optionId.features.$featureId'
import { requireSessionUser } from '~/server/auth.context.server'
import { handleMutation } from '~/server/mutation.server'
import { deleteFeatureProduct } from '~/server/options-product'

// Action-only: DELETE /admin/products/:id/options/:optionId/features/:featureId
// quita el valor de la opción del producto. Sin redirect: el loader se revalida.
export async function action({ request, context, params }: Route.ActionArgs) {
  const { token } = requireSessionUser(context)

  const result = await deleteFeatureProduct(
    Number(params.optionId),
    Number(params.featureId),
    token,
  )

  return handleMutation(request, result, { message: 'Valor eliminado' })
}
