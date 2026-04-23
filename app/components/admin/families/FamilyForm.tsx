import { Form, useNavigation } from 'react-router';
import type { Family } from '~/types/family';
import { t } from '@/i18n'

interface Props {
  family?: Family;
  error?: string | null;
}

export function FamilyForm({ family }: Props) {
  const nav = useNavigation();
  const submitting = nav.state === 'submitting';
  const isEdit = Boolean(family);

  return (
    <Form method="post" className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-strong-weak mb-1">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={family?.name ?? ''}
          placeholder="Ingrese el nombre de la familia"
          className="w-full px-3 py-2 border border-weak rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          name="_action"
          value="update"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type='submit' className="btn btn-danger" name="_action" value="delete">
          {t('global.delete')}
        </button>
      </div>

      {isEdit ? <input type="hidden" name="id" value={family!.id} /> : null}
    </Form>
  );
}
