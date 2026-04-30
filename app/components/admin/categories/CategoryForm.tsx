import { Form, useNavigation } from 'react-router';
import { AsyncSelect } from '~/components/inputs/AsyncSelect';
import { t } from '~/i18n'
import type { Category } from '~/types/category';


interface Props {
  category?: Category;
  validationErrors?: any | null;
}

export function CategoryForm({ category, validationErrors }: Props) {
  const nav = useNavigation();
  const submitting = nav.state === 'submitting';
  const isEdit = Boolean(category);

  return (
    <Form method="post" className="space-y-4">
      <div className='space-y-4'>
        <label htmlFor="family_id" className="block text-sm font-medium text-strong-weak mb-1">
          Familia
        </label>

        <AsyncSelect
          name='family_id'
          value={category?.family_id?.toString() ?? ''}
          source='/resources/families'
        />
        
        {/* <input
          id="family_id"
          name="family_id"
          type="number"
          defaultValue={category?.name ?? ''}
          placeholder="Selecciona una familia"
          className=""
        /> */}
        {validationErrors?.family_id?.[0] && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.family_id[0]}</p>
        )}

        <label htmlFor="name" className="block text-sm font-medium text-strong-weak mb-1">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={category?.name ?? ''}
          placeholder="Ingrese el nombre de la categoria"
          className="w-full px-3 py-2 border border-weak rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {validationErrors?.name?.[0] && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.name[0]}</p>
        )}
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

      {isEdit ? <input type="hidden" name="id" value={category!.id} /> : null}
    </Form>
  );
}
