import type { Route } from './+types/admin.products.$id.options.$optionId'
import { requireSessionUser } from '~/server/auth.context.server'
import { handleMutation } from '~/server/mutation.server'
import { deleteOptionProduct } from '~/server/options-product'

// Action-only: DELETE /admin/products/:id/options/:optionId quita la opción
// del producto. Sin redirect: el loader del producto se revalida.
export async function action({ request, context, params }: Route.ActionArgs) {
  const { token } = requireSessionUser(context)

  const result = await deleteOptionProduct(
    Number(params.id),
    Number(params.optionId),
    token,
  )

  return handleMutation(request, result, { message: 'Opción eliminada' })
}
