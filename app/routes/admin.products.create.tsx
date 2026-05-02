import { data } from 'react-router'
import { redirect } from 'react-router'

import { ProductForm } from '~/components/admin/products/ProductForm'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { commitSession, getSession } from '~/server/session.server'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.products.create'
import { createProduct } from '~/server/products.server'

export const handle: RouteHandle = { breadcrumb: t('global.new') }

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.new_product')} | JB Store` },
]

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
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

  const image = formData.get('image') as File | null
  if (image && image.size > 0) {
    payload.append('image', image)
  }

  const result = await createProduct(payload, token)

  // 5. Manejo de errores de validación (vienen de Laravel)
  if ('error' in result) {
    return data(
      {
        error: result.error.message,
        errors: result.error.errors, // Los errores de Laravel por campo
      },
      { status: result.error.status },
    )
  }

  // 6. Éxito y Notificación
  const session = await getSession(request.headers.get('Cookie'))
  session.flash('toast', {
    kind: 'success',
    title: 'Producto creado',
  })

  return redirect('/admin/products', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function ProductCreate({ actionData }: Route.ComponentProps) {
  return (
    <div className="card">
      <h1 className="mb-4 text-xl font-semibold">{t('admin.new_product')}</h1>
      <ProductForm validationErrors={actionData?.errors} />
    </div>
  )
}
