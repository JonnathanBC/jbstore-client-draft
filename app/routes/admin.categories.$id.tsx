import { redirect } from 'react-router';
import type { Route } from './+types/admin.categories.$id';
import { requireAuth } from '~/server/auth.server';
import { t } from '~/i18n';
import { commitSession, getSession } from '~/server/session.server';
import type { RouteHandle } from '~/types/route';
import { useEffect } from 'react';
import { deleteCategory, getCategory, updateCategory } from '~/server/categories.server';
import { CategoryForm } from '~/components/admin/categories/CategoryForm';

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.category ? `${data.category.name} | JB Store` : `${t('global.edit')} | JB Store`,
  },
];

export const handle: RouteHandle = { breadcrumb: t('admin.categories') };

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAuth(request);
  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) {
    throw new Response('Categoria no encontrada', { status: 404 });
  }
  try {
    const category = await getCategory(id, token);
    return { category };
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500;
    throw new Response(status === 404 ? 'Categoria no encontrada' : 'Error del servidor', {
      status,
    });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { token } = await requireAuth(request);
  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) return { error: 'ID inválido' };

  const form = await request.formData();
  const intent = form.get('_action');
  const session = await getSession(request.headers.get('Cookie'));

  if (intent === 'delete') {
    const result = await deleteCategory(id, token);
    if ('error' in result) return { error: result.error.message };

    session.flash('toast', {
      kind: 'success',
      title: 'Categoría eliminada',
      message: 'La categoría se eliminó correctamente.',
    });

    return redirect('/admin/categories', {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }

  const name = String(form.get('name') ?? '').trim();
  if (!name) return { error: 'El nombre es obligatorio' };

  const result = await updateCategory(id, { name }, token);
  if ('error' in result) return { error: result.error.message };

  session.flash('toast', {
    kind: 'success',
    title: 'Categoría actualizada',
    message: `"${result.name}" se actualizó correctamente.`,
  });

  return redirect('/admin/categories', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function CategoryEdit({ loaderData, actionData }: Route.ComponentProps) {
  const { category } = loaderData;

  useEffect(() => {
    if (actionData?.error) {
      alert(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="card">
      <CategoryForm
        key={category.id + category.name}
        category={category}
        error={actionData?.error}
      />
    </div>
  );
}
