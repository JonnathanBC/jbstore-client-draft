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
import { ProductForm } from '~/components/admin/products/ProductForm'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.product
      ? `${data.product.name} | JB Store`
      : `${t('global.edit')} | JB Store`,
  },
]

export const handle: RouteHandle = { breadcrumb: t('glo.products') }

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
}: Route.ComponentProps) {
  const { product } = loaderData

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <div className="card">
      <ProductForm
        product={product}
        validationErrors={actionData?.errors as undefined}
      />
    </div>
  )
}
