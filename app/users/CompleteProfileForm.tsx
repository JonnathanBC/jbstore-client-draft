import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'

import { Select } from '~/components/inputs/Select'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import type { User } from '~/types/user'

export const COMPLETE_PROFILE_INTENT = 'complete-profile'

const DOCUMENT_TYPES = [
  { value: 'CI', label: 'Cédula de Identidad' },
  { value: 'RUC', label: 'RUC' },
  { value: 'PP', label: 'Pasaporte' },
]

type ProfileActionData =
  | { success: true }
  | { error: string; errors?: Record<string, string[]> }

const FieldErrorText = ({ messages }: { messages?: string[] }) =>
  messages?.[0] ? (
    <p className="mt-1 text-sm text-red-600">{messages[0]}</p>
  ) : null

/**
 * Usuarios que entraron con Google no tienen documento ni teléfono:
 * la orden y el ticket los necesitan, así que se piden antes de pagar.
 */
export const CompleteProfileForm = ({ user }: { user: User }) => {
  const fetcher = useFetcher<ProfileActionData>()
  const errors =
    fetcher.data && 'errors' in fetcher.data ? fetcher.data.errors : undefined

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if ('error' in fetcher.data) toast.error(fetcher.data.error)
    else toast.success('Datos guardados')
  }, [fetcher.state, fetcher.data])

  return (
    <fetcher.Form
      method="post"
      className="mb-6 space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4"
    >
      <input type="hidden" name="intent" value={COMPLETE_PROFILE_INTENT} />

      <div>
        <h2 className="font-semibold">Completá tus datos</h2>
        <p className="text-sm text-gray-600">
          Los necesitamos para emitir tu comprobante y entregar el pedido.
        </p>
      </div>

      <div>
        <label htmlFor="last_name" className="mb-1 block text-sm font-medium">
          Apellido
        </label>
        <Input
          id="last_name"
          name="last_name"
          defaultValue={user.last_name ?? ''}
          required
        />
        <FieldErrorText messages={errors?.last_name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="document_type"
            className="mb-1 block text-sm font-medium"
          >
            Tipo de documento
          </label>
          <Select
            id="document_type"
            name="document_type"
            items={DOCUMENT_TYPES}
            defaultValue={user.document_type ?? 'CI'}
          />
          <FieldErrorText messages={errors?.document_type} />
        </div>

        <div>
          <label
            htmlFor="document_number"
            className="mb-1 block text-sm font-medium"
          >
            Número de documento
          </label>
          <Input
            id="document_number"
            name="document_number"
            defaultValue={user.document_number ?? ''}
            required
          />
          <FieldErrorText messages={errors?.document_number} />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">
          Teléfono
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          defaultValue={user.phone ?? ''}
          required
        />
        <FieldErrorText messages={errors?.phone} />
      </div>

      <Button type="submit" disabled={fetcher.state !== 'idle'}>
        {fetcher.state !== 'idle' ? 'Guardando...' : 'Guardar datos'}
      </Button>
    </fetcher.Form>
  )
}
