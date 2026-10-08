import { useEffect } from 'react'
import { data } from 'react-router'
import { toast } from 'sonner'

import type { Route } from './+types/admin.categories.$id'
import { CategoryForm } from '~/components/admin/categories/CategoryForm'
import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import { handleMutation, type MutationResult } from '~/server/mutation.server'
import type { RouteHandle } from '~/types/route'
import {
  deleteCategory,
  getCategory,
  updateCategory,
} from '~/server/categories.server'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.category
      ? `${data.category.name} | JB Store`
      : `${t('global.edit')} | JB Store`,
  },
]

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (match as { data?: { category?: { name: string } } }).data
    return [
      { label: t('admin.categories'), to: '/admin/categories' },
      { label: data?.category?.name ?? t('global.edit') },
    ]
  },
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const id = Number(params.id)
  if (!Number.isFinite(id) || id < 1) {
    throw new Response('Categoria no encontrada', { status: 404 })
  }
  try {
    const category = await getCategory(id, token)
    return { category }
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500
    throw new Response(
      status === 404 ? 'Categoria no encontrada' : 'Error del servidor',
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
    return handleMutation(request, await deleteCategory(id, token), {
      message: 'Eliminado correctamente',
      redirectTo: '/admin/categories',
    })
  }

  const form = await request.formData()
  const name = String(form.get('name') ?? '').trim()
  const familyId = Number(form.get('family_id'))

  return handleMutation(
    request,
    await updateCategory(id, { name, family_id: familyId }, token),
    {
      message: 'Categoría actualizada con éxito',
      redirectTo: '/admin/categories',
    },
  )
}

export default function CategoryEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { category } = loaderData

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error)
    }
  }, [actionData])

  return (
    <div className="card">
      <CategoryForm category={category} validationErrors={actionData?.errors} />
    </div>
  )
}
