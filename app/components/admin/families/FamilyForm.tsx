import { useEffect } from 'react'
import { Form, useFetcher, useNavigation } from 'react-router'
import { toast } from 'sonner'

import { showDeleteConfirm } from '~/components/confirm/showDeleteConfirm'
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

  const fetcher = useFetcher<{ error?: string }>()

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
  }, [fetcher.state, fetcher.data])

  async function remove() {
    if (!family || !(await showDeleteConfirm())) return

    fetcher.submit(null, {
      method: 'DELETE',
      action: `/admin/families/${family.id}`,
    })
  }

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
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        {isEdit ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={remove}
            disabled={fetcher.state !== 'idle'}
          >
            {t('global.delete')}
          </button>
        ) : null}
      </div>

      {isEdit ? <input type="hidden" name="id" value={family!.id} /> : null}
    </Form>
  )
}
