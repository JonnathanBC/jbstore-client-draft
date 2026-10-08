import { useEffect } from 'react'
import { data } from 'react-router'
import { toast } from 'sonner'

import type { Route } from './+types/admin.subcategories.$id'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { handleMutation, type MutationResult } from '~/server/mutation.server'
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

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (match as { data?: { subcategory?: { name: string } } }).data
    return [
      { label: t('admin.subcategories'), to: '/admin/subcategories' },
      { label: data?.subcategory?.name ?? t('global.edit') },
    ]
  },
}

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
  if (!Number.isFinite(id) || id < 1) {
    return data<MutationResult>(
      { ok: false, error: 'ID inválido' },
      { status: 400 },
    )
  }

  const isDelete = request.method === 'DELETE'

  if (isDelete) {
    return handleMutation(request, await deleteSubCategory(id, token), {
      message: 'Eliminado correctamente',
      redirectTo: '/admin/subcategories',
    })
  }

  const form = await request.formData()
  const name = String(form.get('name') ?? '').trim()
  const categoryId = Number(form.get('category_id'))

  return handleMutation(
    request,
    await updateSubCategory(id, { name, category_id: categoryId }, token),
    {
      message: 'Subcategoría actualizada con éxito',
      redirectTo: '/admin/subcategories',
    },
  )
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
        validationErrors={actionData?.errors}
      />
    </div>
  )
}
