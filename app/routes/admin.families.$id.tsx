import { redirect } from 'react-router';
import type { Route } from './+types/admin.families.$id';
import { requireAuth } from '~/server/auth.server';
import { getFamily, updateFamily } from '~/server/api.server';
import { commitSession, getSession } from '~/server/session.server';
import { FamilyForm } from '~/components/admin/families/FamilyForm';
import { t } from '~/i18n';
import type { RouteHandle } from '~/types/route';

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.family ? `${data.family.name} | JB Store` : `${t('global.edit')} | JB Store`,
  },
];

export const handle: RouteHandle = { breadcrumb: t('global.edit') };

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAuth(request);
  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) {
    throw new Response('Familia no encontrada', { status: 404 });
  }
  try {
    const family = await getFamily(id, token);
    return { family };
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500;
    throw new Response(status === 404 ? 'Familia no encontrada' : 'Error del servidor', {
      status,
    });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { token } = await requireAuth(request);
  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) {
    return { error: 'ID inválido' };
  }

  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  if (!name) {
    return { error: 'El nombre es obligatorio' };
  }

  const result = await updateFamily(id, { name }, token);
  if ('error' in result) {
    return { error: result.error.message };
  }

  const session = await getSession(request.headers.get('Cookie'));
  session.flash('toast', {
    kind: 'success',
    title: 'Familia actualizada',
    message: `"${result.name}" se guardó correctamente.`,
  });

  return redirect('/admin/families', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function FamilyEdit({ loaderData, actionData }: Route.ComponentProps) {
  const { family } = loaderData;
  return (
    <div className="card">
      <h1 className="text-xl font-semibold mb-4">Editar familia</h1>
      <FamilyForm family={family} error={actionData?.error} />
    </div>
  );
}
