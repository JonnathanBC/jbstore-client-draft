import { useEffect } from 'react'
import { toast } from 'sonner'

import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { handleMutation } from '~/server/mutation.server'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.products.$id'
import {
  deleteProduct,
  getProduct,
  updateProduct,
} from '~/server/products.server'
import { ProductForm } from '~/products/ProductForm'
import { OptionsFeaturesProduct } from '~/products/options/OptionsFeaturesProduct'
import { Variants } from '~/products/variants/Variants'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.product
      ? `${data.product.name} | JB Store`
      : `${t('global.edit')} | JB Store`,
  },
]

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (match as { data?: { product?: { name: string } } }).data
    return [
      { label: t('global.products'), to: '/admin/products' },
      { label: data?.product?.name ?? t('global.edit') },
    ]
  },
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const id = Number(params.id)

  try {
    const product = await getProduct(id, token)
    return { product }
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500
    throw new Response(
      status === 404 ? 'Producto no encontrada' : 'Error del servidor',
      {
        status,
      },
    )
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const id = Number(params.id)

  // La URL ya identifica al producto: el método HTTP decide qué hacer con él.
  if (request.method === 'DELETE') {
    return handleMutation(request, await deleteProduct(id, token), {
      message: 'Producto eliminado',
      redirectTo: '/admin/products',
    })
  }

  const formData = await request.formData()
  const payload = new FormData()
  payload.append('sku', String(formData.get('sku') ?? '').trim())
  payload.append('name', String(formData.get('name') ?? '').trim())
  payload.append(
    'description',
    String(formData.get('description') ?? '').trim(),
  )
  payload.append('price', String(formData.get('price') ?? ''))
  payload.append(
    'subcategory_id',
    String(formData.get('subcategory_id') ?? '').trim(),
  )

  const stock = formData.get('stock')
  if (stock !== null) {
    payload.append('stock', String(stock))
  }

  const image = formData.get('image') as File | null
  if (image && image.size > 0) {
    payload.append('image', image)
  }

  return handleMutation(request, await updateProduct(id, payload, token), {
    message: 'Producto actualizado con éxito',
    redirectTo: '/admin/products',
  })
}

export default function ProductEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { product } = loaderData

  useEffect(() => {
    if (actionData?.error) toast.error(actionData.error)
  }, [actionData])

  return (
    <div className="space-y-6">
      <ProductForm product={product} validationErrors={actionData?.errors} />

      <OptionsFeaturesProduct />
      {product?.variants?.length > 0 && <Variants />}
    </div>
  )
}
