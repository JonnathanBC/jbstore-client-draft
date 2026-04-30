import { useEffect } from 'react';
import { data, redirect } from 'react-router';
import { toast } from 'sonner';

import { SubCategoryForm } from '~/components/admin/subcategories/SubCategoryForm';
import { t } from '~/i18n';
import { requireAuth } from '~/server/auth.server';
import { commitSession, getSession } from '~/server/session.server';
import { createSubCategory } from '~/server/subcategories.server';
import type { Route } from './+types/admin.subcategories.create';
import type { RouteHandle } from '~/types/route';

export const handle: RouteHandle = { breadcrumb: t('global.new') };

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.new')} ${t('admin.subcategory')} | JB Store` },
];

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireAuth(request);
  const form = await request.formData();
  const categoryId = Number(form.get('category_id'));
  const name = String(form.get('name') ?? '').trim();

  const result = await createSubCategory({ name, category_id: categoryId }, token);

  if ('error' in result) {
    return data(
      { error: result.error.message, errors: result.error.errors },
      { status: result.error.status }
    );
  }

  const session = await getSession(request.headers.get('Cookie'));
  session.flash('toast', {
    kind: 'success',
    title: 'Subcategoría creada con exitó',
  });

  return redirect('/admin/subcategories', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function SubCategoryCreate({ actionData }: Route.ComponentProps) {

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="card">
      <h1 className="text-xl font-semibold mb-4">{t('admin.new_subcategory')}</h1>
      <SubCategoryForm validationErrors={actionData?.errors} />
    </div>
  );
}
