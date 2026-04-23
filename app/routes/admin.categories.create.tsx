import { redirect } from 'react-router';
import type { Route } from './+types/admin.categories.create';
import { requireAuth } from '~/server/auth.server';
import { t } from '~/i18n';
import { commitSession, getSession } from '~/server/session.server';
import type { RouteHandle } from '~/types/route';
import { createCategory } from '~/server/categories.server';
import { CategoryForm } from '~/components/admin/categories/CategoryForm';

export const handle: RouteHandle = { breadcrumb: t('global.new') };

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.new')} ${t('admin.category')} | JB Store` },
];

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request);
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();

  if (!name) {
    return { error: 'El nombre es obligatorio' };
  }

  const result = await createCategory({ name }, token);
  if ('error' in result) {
    return { error: result.error.message };
  }

  const session = await getSession(request.headers.get('Cookie'));
  session.flash('toast', {
    kind: 'success',
    title: 'Categoría creada',
    message: `"${result.name}" se creó correctamente.`,
  });

  return redirect('/admin/categories', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function CategoryCreate({ actionData }: Route.ComponentProps) {
  return (
    <div className="card">
      <h1 className="text-xl font-semibold mb-4">Nueva Categoria</h1>
      <CategoryForm error={actionData?.error} />
    </div>
  );
}
