import { Form, useNavigation } from 'react-router'
import { AsyncSelect } from '~/components/inputs/AsyncSelect'
import { t } from '~/i18n'
import type { Category } from '~/types/category'

interface Props {
  category?: Category
  validationErrors?: { [key: string]: string[] } | null
}

export function CategoryForm({ category, validationErrors }: Props) {
  const nav = useNavigation()
  const submitting = nav.state === 'submitting'
  const isEdit = Boolean(category)

  return (
    <Form method="post" className="space-y-4">
      <div className="space-y-4">
        <label
          htmlFor="family_id"
          className="text-strong-weak mb-1 block text-sm font-medium"
        >
          Familia
        </label>
        <AsyncSelect
          name="family_id"
          value={category?.family_id?.toString() ?? ''}
          source="/resources/families"
          placeholder="Selecciona una familia"
        />
        {validationErrors?.family_id?.[0] && (
          <p className="mt-1 text-sm text-red-500">
            {validationErrors.family_id[0]}
          </p>
        )}

        <label
          htmlFor="name"
          className="text-strong-weak mb-1 block text-sm font-medium"
        >
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={category?.name ?? ''}
          placeholder="Ingrese el nombre de la categoria"
          className="border-weak focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
        />
        {validationErrors?.name?.[0] && (
          <p className="mt-1 text-sm text-red-500">
            {validationErrors.name[0]}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          name="_action"
          value="update"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="submit"
          className="btn btn-danger"
          name="_action"
          value="delete"
        >
          {t('global.delete')}
        </button>
      </div>

      {isEdit ? <input type="hidden" name="id" value={category!.id} /> : null}
    </Form>
  )
}
