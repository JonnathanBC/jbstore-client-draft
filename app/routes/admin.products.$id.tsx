import { useEffect } from 'react'
import { data, redirect } from 'react-router'
import { toast } from 'sonner'

import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { commitSession, getSession } from '~/server/session.server'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.products.$id'
import {
  deleteProduct,
  getProduct,
  updateProduct,
} from '~/server/products.server'
import { ProductForm } from '~/products/ProductForm'
import { ProductVariants } from '~/products/variants/ProductVariants'
import {
  createOptionsProduct,
  deleteFeatureProduct,
  deleteOptionProduct,
} from '~/server/options-product'
import { OptionsProduct } from '~/types/options-product'

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
  if (!Number.isFinite(id) || id < 1)
    return { error: 'ID inválido', errors: [] }

  const formData = await request.formData()
  const intent = formData.get('_action')
  const session = await getSession(request.headers.get('Cookie'))

  // CREATE-OPTION-PRODUCT
  if (intent === 'create-option-product') {
    let features: OptionsProduct['features'] = []
    try {
      features = JSON.parse(String(formData.get('features') ?? '[]'))
    } catch {
      return { error: 'Features inválidas', errors: [] }
    }

    const result = await createOptionsProduct(
      {
        product_id: id,
        option_id: Number(formData.get('option_id')),
        features,
      },
      token,
    )
    if ('error' in result) {
      return data(
        { error: result.error.message, errors: result.error.errors ?? {} },
        { status: result.error.status },
      )
    }
    return { ok: true, errors: [] }
  }

  // DELETE-PRODUCT
  if (intent === 'delete') {
    const result = await deleteProduct(id, token)
    if ('error' in result) {
      return data(
        { error: result.error.message, errors: [] },
        { status: result.error.status },
      )
    }

    session.flash('toast', {
      kind: 'success',
      title: 'Eliminado correctamente',
    })

    return redirect('/admin/products', {
      headers: { 'Set-Cookie': await commitSession(session) },
    })
  }

  // DELETE-OPTION-PRODUCT
  if (intent === 'remove-option-product') {
    const result = await deleteOptionProduct(
      id,
      Number(formData.get('option_id')),
      token,
    )

    if ('error' in result) {
      return data(
        { error: result.error.message, errors: result.error.errors ?? [] },
        { status: result.error.status },
      )
    }

    return data({ ok: true, errors: [] })
  }

  // DELETE-FEATURE-PRODUCT
  if (intent === 'delete-feature-product') {
    const result = await deleteFeatureProduct(
      Number(formData.get('option_id')),
      Number(formData.get('feature_id')),
      token,
    )

    if ('error' in result) {
      return data(
        {
          error: result.error.message,
          errors: result.error.errors ?? {},
        },
        { status: result.error.status },
      )
    }

    return data({
      ok: true,
      message: 'Feature eliminada correctamente',
      errors: [],
    })
  }

  if (intent !== 'update' && intent !== null) {
    return data({ error: 'Intent desconocido', errors: [] }, { status: 400 })
  }

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

  const image = formData.get('image') as File | null
  if (image && image.size > 0) {
    payload.append('image', image)
  }

  const result = await updateProduct(id, payload, token)
  if ('error' in result) {
    return data(
      { error: result.error.message, errors: result.error.errors },
      { status: result.error.status },
    )
  }

  session.flash('toast', {
    kind: 'success',
    title: 'Producto actualizado con éxito',
  })

  return redirect('/admin/products', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function ProductEdit({
  loaderData,
  actionData,
  params,
}: Route.ComponentProps) {
  const { product } = loaderData
  const { id } = params

  useEffect(() => {
    if (actionData && 'error' in actionData && actionData.error) {
      toast.error(actionData.error as string)
    }
  }, [actionData])

  return (
    <div className="space-y-6">
      <ProductForm
        product={product}
        validationErrors={
          actionData && 'errors' in actionData
            ? (actionData.errors as Record<string, string[]>)
            : undefined
        }
      />

      <ProductVariants options={product?.options} productId={id} />
    </div>
  )
}
