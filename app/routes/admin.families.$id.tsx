import { redirect } from 'react-router';
import type { Route } from './+types/admin.families.$id';
import { requireAuth } from '~/server/auth.server';
import { deleteFamily, getFamily, updateFamily } from '~/server/api.server';
import { commitSession, getSession } from '~/server/session.server';
import { FamilyForm } from '~/components/admin/families/FamilyForm';
import { t } from '~/i18n';
import type { RouteHandle } from '~/types/route';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.family ? `${data.family.name} | JB Store` : `${t('global.edit')} | JB Store`,
  },
];

export const handle: RouteHandle = { breadcrumb: t('admin.families') };

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
  if (!Number.isFinite(id) || id < 1) return { error: 'ID inválido' };

  const form = await request.formData();
  const intent = form.get('_action');
  const session = await getSession(request.headers.get('Cookie'));

  if (intent === 'delete') {
    const result = await deleteFamily(id, token);
    if ('error' in result) return { error: result.error.message };

    session.flash('toast', {
      kind: 'success',
      title: 'Familia eliminada',
      message: 'La familia se eliminó correctamente.',
    });

    return redirect('/admin/families', {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }

  const name = String(form.get('name') ?? '').trim();
  if (!name) return { error: 'El nombre es obligatorio' };

  const result = await updateFamily(id, { name }, token);
  
   // Ejemplo de notifiaciones para el cliente sin usar session.flash
  if ('error' in result) {
    return { toast: { kind: 'error', message: result.error.message } };
  }

  session.flash('toast', {
    kind: 'success',
    title: 'Éxito',
    message: 'Familia actualizada',
  });

  return redirect('/admin/families', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function FamilyEdit({ loaderData, actionData }: Route.ComponentProps) {
  const { family } = loaderData;

  useEffect(() => {
    if (actionData?.toast) {
      toast.error(actionData.toast.message);
    }
  }, [actionData]);

  return (
    <div className="card">
      <FamilyForm family={family} />
    </div>
  );
}
