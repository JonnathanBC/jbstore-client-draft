import { Form, Link, useNavigation } from 'react-router';
import type { Family } from '~/types/family';

interface Props {
  family?: Family;
  error?: string | null;
}

export function FamilyForm({ family, error }: Props) {
  const nav = useNavigation();
  const submitting = nav.state === 'submitting';
  const isEdit = Boolean(family);

  return (
    <Form method="post" className="space-y-4">
      {error && <p className="bg-red-50 text-red-600 py-2 px-4 rounded">{error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={family?.name ?? ''}
          placeholder="Ingrese el nombre de la familia"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <Link to="/admin/families" className="btn btn-outline-primary">
          Cancelar
        </Link>
      </div>

      {isEdit ? <input type="hidden" name="id" value={family!.id} /> : null}
    </Form>
  );
}
