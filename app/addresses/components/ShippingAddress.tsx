import { Form } from 'react-router'
import type { Address } from '~/types/addresses'
import { Input } from '~/components/shared/Input'
import { Select } from '~/components/shared/Select'
import { useState } from 'react'
import { Checkbox } from '~/components/shared/Checkbox'
import { Edit, Edit2, House, Star, Trash2 } from 'lucide-react'

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

  return (
    <div>
      {!!showForm ? (
        <Form
          method="post"
          className="grid gap-4 rounded-lg bg-white p-6 shadow-sm md:grid-cols-2"
        >
          <Select
            name="type"
            label="Tipo de dirección"
            items={[
              { value: 'shipping', label: 'Envío' },
              { value: 'billing', label: 'Facturación' },
            ]}
            error={fieldErrors.type?.[0]}
          />
          <Input
            label="Teléfono"
            name="phone"
            type="text"
            autoComplete="tel"
            required
            error={fieldErrors.phone?.[0]}
          />
          <Input
            label="Dirección principal"
            name="address_line_1"
            placeholder="Calle principal y número"
            required
            error={fieldErrors.address_line_1?.[0]}
          />
          <Input
            label="Complemento"
            name="address_line_2"
            placeholder="Edificio, departamento o piso"
            error={fieldErrors.address_line_2?.[0]}
          />
          <Input
            label="Ciudad"
            name="city"
            required
            error={fieldErrors.city?.[0]}
          />
          <Input
            label="Provincia"
            name="province"
            required
            error={fieldErrors.province?.[0]}
          />
          <Input
            label="Código postal"
            name="postal_code"
            error={fieldErrors.postal_code?.[0]}
          />
          <Input
            label="País"
            name="country"
            defaultValue="EC"
            maxLength={2}
            required
            error={fieldErrors.country?.[0]}
          />
          <Input
            label="Referencia"
            name="reference"
            placeholder="Cerca de..."
            error={fieldErrors.reference?.[0]}
          />
          <Checkbox
            append="Marcar como dirección preferida"
            name="is_default"
            error={fieldErrors.is_public?.[0]}
          />

          <div className="md:col-span-2 md:flex md:justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {submitting ? 'Procesando...' : 'Continuar'}
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
                  <li key={address.id} className="rounded-lg bg-white shadow">
                    <div className="flex p-4">
                      <div>
                        <House className="size-5 text-purple-600" />
                      </div>
                      <div className="mx-4 flex-1 text-sm">
                        <p className="text-purple-600">
                          {address.type === 'billing' ? 'Facturación' : 'Envío'}
                        </p>
                        <p className="font-semibold text-gray-700">
                          {address.province}
                        </p>
                        <p className="font-semibold text-gray-700">
                          {address.address_line_1}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button>
                          <Star className="size-4 text-gray-800" />
                        </button>
                        <button>
                          <Edit2 className="size-4 text-gray-800" />
                        </button>
                        <button>
                          <Trash2 className="size-4 text-gray-800" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="btn btn-primary mt-2 block w-full"
              onClick={() => setShowForm(true)}
            >
              Añadir dirección
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
