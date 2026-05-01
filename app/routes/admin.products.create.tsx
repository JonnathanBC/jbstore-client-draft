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

  // 2. Preparar el FormData que enviaremos a la API de Laravel
  // No usamos un objeto plano {sku, name...} porque JSON no soporta archivos.
  const apiFormData = new FormData()

  apiFormData.append('sku', String(formData.get('sku') ?? '').trim())
  apiFormData.append('name', String(formData.get('name') ?? '').trim())
  apiFormData.append(
    'description',
    String(formData.get('description') ?? '').trim(),
  )
  apiFormData.append('price', String(formData.get('price')))

  // 3. Capturar el archivo de imagen correctamente
  const imageFile = formData.get('image')

  // Validamos que sea un archivo real y no esté vacío
  if (imageFile instanceof File && imageFile.size > 0) {
    apiFormData.append('image', imageFile)
  }

  // 4. Enviar a la función createProduct (ahora recibe FormData)
  const result = await createProduct(apiFormData, token)

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
