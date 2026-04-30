import { useEffect } from 'react'
import { data, redirect } from 'react-router'
import { toast } from 'sonner'

import type { Route } from './+types/admin.subcategories.$id'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { commitSession, getSession } from '~/server/session.server'
import type { RouteHandle } from '~/types/route'
import {
  deleteSubCategory,
  getSubCategory,
  updateSubCategory,
} from '~/server/subcategories.server'
import { SubCategoryForm } from '~/components/admin/subcategories/SubCategoryForm'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.subcategory
      ? `${data.subcategory.name} | JB Store`
      : `${t('global.edit')} | JB Store`,
  },
]

export const handle: RouteHandle = { breadcrumb: t('admin.subcategories') }

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const id = Number(params.id)
  if (!Number.isFinite(id) || id < 1) {
    throw new Response('Subcategoria no encontrada', { status: 404 })
  }
  try {
    const subcategory = await getSubCategory(id, token)
    return { subcategory }
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500
    throw new Response(
      status === 404 ? 'Subcategoria no encontrada' : 'Error del servidor',
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

  const form = await request.formData()
  const intent = form.get('_action')
  const session = await getSession(request.headers.get('Cookie'))

  if (intent === 'delete') {
    const result = await deleteSubCategory(id, token)
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

    return redirect('/admin/subcategories', {
      headers: { 'Set-Cookie': await commitSession(session) },
    })
  }

  const name = String(form.get('name') ?? '').trim()
  const categoryId = Number(form.get('category_id'))

  const result = await updateSubCategory(
    id,
    { name, category_id: categoryId },
    token,
  )
  if ('error' in result) {
    return data(
      { error: result.error.message, errors: result.error.errors },
      { status: result.error.status },
    )
  }

  session.flash('toast', {
    kind: 'success',
    title: 'Subcategoría actualizada con éxito',
  })

  return redirect('/admin/subcategories', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function SubCategoryEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { subcategory } = loaderData

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <div className="card">
      <SubCategoryForm
        subcategory={subcategory}
        validationErrors={actionData?.errors as undefined}
      />
    </div>
  )
}
