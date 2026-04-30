import { Form, useNavigation } from 'react-router'
import type { Family } from '~/types/family'
import { t } from '@/i18n'

interface Props {
  family?: Family
  error?: string | null
}

export function FamilyForm({ family }: Props) {
  const nav = useNavigation()
  const submitting = nav.state === 'submitting'
  const isEdit = Boolean(family)

  return (
    <Form method="post" className="space-y-4">
      <div>
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
          required
          defaultValue={family?.name ?? ''}
          placeholder="Ingrese el nombre de la familia"
          className="border-weak focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
        />
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

      {isEdit ? <input type="hidden" name="id" value={family!.id} /> : null}
    </Form>
  )
}
