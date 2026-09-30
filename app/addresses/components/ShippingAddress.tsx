import { Form, useActionData, useFetcher } from 'react-router'
import type { Address } from '~/types/addresses'
import { Input } from '~/components/shared/Input'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Checkbox } from '~/components/shared/Checkbox'
import { Edit2, House, Star, Trash2 } from 'lucide-react'
import { cn } from '~/lib/utils'
import { showDeleteConfirm } from '~/components/confirm/showDeleteConfirm'

type Props = {
  addresses: Address[]
  fieldErrors: Record<string, string[]>
  submitting: boolean
}

export const ShippingAddress = ({
  addresses,
  fieldErrors,
  submitting,
}: Props) => {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const fetcher = useFetcher<{ success?: string; error?: string }>()

  // Las respuestas del fetcher llegan en fetcher.data, no en useActionData
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data.error) toast.error(fetcher.data.error)
    if (fetcher.data.success) toast.success(fetcher.data.success)
  }, [fetcher.state, fetcher.data])

  const actionData = useActionData<{ success?: string }>()
  useEffect(() => {
    if (actionData?.success) closeForm()
  }, [actionData])

  const openForm = (address: Address | null) => {
    setEditing(address)
    setShowForm(true)
  }

  const closeForm = () => {
    setEditing(null)
    setShowForm(false)
  }

  return (
    <div>
      {!!showForm ? (
        <Form
          key={editing?.id ?? 'new'}
          method="post"
          className="grid gap-4 rounded-lg bg-white p-6 shadow-sm md:grid-cols-2"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Input
            label="Teléfono"
            name="phone"
            type="text"
            autoComplete="tel"
            defaultValue={editing?.phone ?? ''}
            required
            error={fieldErrors.phone?.[0]}
          />
          <Input
            label="Dirección principal"
            name="address_line_1"
            placeholder="Calle principal y número"
            defaultValue={editing?.address_line_1 ?? ''}
            required
            error={fieldErrors.address_line_1?.[0]}
          />
          <Input
            label="Complemento"
            name="address_line_2"
            placeholder="Edificio, departamento o piso"
            defaultValue={editing?.address_line_2 ?? ''}
            error={fieldErrors.address_line_2?.[0]}
          />
          <Input
            label="Ciudad"
            name="city"
            defaultValue={editing?.city ?? ''}
            required
            error={fieldErrors.city?.[0]}
          />
          <Input
            label="Provincia"
            name="province"
            defaultValue={editing?.province ?? ''}
            required
            error={fieldErrors.province?.[0]}
          />
          <Input
            label="Código postal"
            name="postal_code"
            defaultValue={editing?.postal_code ?? ''}
            error={fieldErrors.postal_code?.[0]}
          />
          <Input
            label="País"
            name="country"
            defaultValue={editing?.country ?? 'EC'}
            maxLength={2}
            required
            error={fieldErrors.country?.[0]}
          />
          <Input
            label="Referencia"
            name="reference"
            placeholder="Cerca de..."
            defaultValue={editing?.reference ?? ''}
            error={fieldErrors.reference?.[0]}
          />
          <Checkbox
            append="Marcar como dirección preferida"
            name="is_default"
            defaultChecked={!!editing?.is_default}
            error={fieldErrors.is_default?.[0]}
          />

          <div className="gap-2 md:col-span-2 md:flex md:justify-end">
            <button
              type="button"
              onClick={closeForm}
              className="w-full cursor-pointer rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 md:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {submitting
                ? 'Procesando...'
                : editing
                  ? 'Actualizar'
                  : 'Continuar'}
            </button>
          </div>
        </Form>
      ) : (
        <section className="overflow-hidden rounded-lg bg-white shadow">
          <header className="bg-gray-900 px-4 py-2">
            <h2 className="text-lg text-white">
              Direcciones de envío guardadas
            </h2>
          </header>

          <div className="p-4">
            {addresses.length === 0 && (
              <span>No se han encontrado direcciones</span>
            )}
            {addresses.length > 0 && (
              <ul className="grid grid-cols-3 gap-4">
                {addresses.map((address) => (
                  <li
                    key={address.id}
                    className={cn('rounded-lg bg-white shadow', {
                      'bg-purple-200': address.is_default,
                    })}
                  >
                    <div className="flex p-4">
                      <div>
                        <House className="size-5 text-purple-600" />
                      </div>
                      <div className="mx-4 flex-1 text-sm">
                        <p className="font-semibold text-gray-700">
                          {address.province}
                        </p>
                        <p className="font-semibold text-gray-700">
                          {address.address_line_1}
                        </p>
                      </div>
                      <fetcher.Form method="post">
                        <div className="flex flex-col gap-2">
                          <input type="hidden" name="id" value={address.id} />
                          <button
                            type="submit"
                            name="intent"
                            value="set-default"
                          >
                            <Star
                              className={cn('size-4 text-gray-800', {
                                'fill-purple-400 text-purple-400':
                                  !!address.is_default,
                              })}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => openForm(address)}
                          >
                            <Edit2 className="size-4 text-gray-800" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const confirmed = await showDeleteConfirm({
                                description: 'Esta dirección se eliminará',
                              })
                              if (!confirmed) return
                              fetcher.submit(
                                { id: String(address.id), intent: 'delete' },
                                { method: 'post' },
                              )
                            }}
                          >
                            <Trash2 className="size-4 text-gray-800" />
                          </button>
                        </div>
                      </fetcher.Form>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="btn btn-primary mt-2 block w-full"
              onClick={() => openForm(null)}
            >
              Añadir dirección
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
