import { useState } from 'react';
import { Form, useNavigation } from 'react-router';

import { AsyncSelect } from '~/components/inputs/AsyncSelect';
import { t } from '~/i18n'
import { SubCategory } from '~/types/subcategory';


interface Props {
  subcategory?: SubCategory;
  validationErrors?: any | null;
}

export function SubCategoryForm({ subcategory, validationErrors }: Props) {
  const nav = useNavigation();
  const submitting = nav.state === 'submitting';
  const isEdit = Boolean(subcategory);

  const [familyId, setFamilyId] = useState(subcategory?.category?.family?.id.toString() ?? '');

  return (
    <Form method="post" className="space-y-4">
      <div className='space-y-4'>
        <label htmlFor="family_id" className="block text-sm font-medium text-strong-weak mb-1">
          {t('admin.family')}
        </label>

        <AsyncSelect
          name='family_id'
          value={familyId}
          onChange={(value) => {
            setFamilyId(value);
          }}
          source='/resources/families'
          placeholder='Selecciona una familia'
        />

        <label htmlFor="category_id" className="block text-sm font-medium text-strong-weak mb-1">
          {t('admin.category')}
        </label>

        <AsyncSelect
          key={familyId}
          name='category_id'
          value={subcategory?.category_id?.toString() ?? ''}
          source={`/resources/categories?family_id=${familyId}`}
          placeholder='Selecciona categoria'
          disabled={!familyId}
        />
        
        {validationErrors?.category_id?.[0] && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.category_id[0]}</p>
        )}

        <label htmlFor="name" className="block text-sm font-medium text-strong-weak mb-1">
          {t('global.name')}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={subcategory?.name ?? ''}
          placeholder="Ingrese el nombre de la subcategoria"
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

      {isEdit ? <input type="hidden" name="id" value={subcategory!.id} /> : null}
    </Form>
  );
}
