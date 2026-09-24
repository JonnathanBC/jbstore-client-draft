import { Form, useActionData, useLoaderData, useNavigation } from 'react-router'
import type { Route } from './+types/_app.address'
import { requireAuth } from '~/server/auth.server'
import {
  createAddress,
  getAddresses,
  type AddressInput,
} from '~/server/addresses.server'
import { Input } from '~/components/shared/Input'
import { Select } from '~/components/shared/Select'

export const meta: Route.MetaFunction = () => [
  { title: 'Dirección | JB Store' },
]

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuth(request)
  const result = await getAddresses(auth.token)

  if ('error' in result) {
    throw new Response(result.error.message, {
      status: result.error.status,
    })
  }

  return { addresses: result }
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuth(request)
  const form = await request.formData()

  const input: AddressInput = {
    type: form.get('type') === 'billing' ? 'billing' : 'shipping',
    address_line_1: String(form.get('address_line_1') ?? '').trim(),
    address_line_2: String(form.get('address_line_2') ?? '').trim(),
    city: String(form.get('city') ?? '').trim(),
    province: String(form.get('province') ?? '').trim(),
    postal_code: String(form.get('postal_code') ?? '').trim(),
    country: String(form.get('country') ?? 'EC')
      .trim()
      .toUpperCase(),
    reference: String(form.get('reference') ?? '').trim(),
    phone: String(form.get('phone') ?? '').trim(),
  }

  const result = await createAddress(input, auth.token)
  if ('error' in result) {
    const fieldErrors = result.error.errors ?? {}

    return {
      error:
        Object.keys(fieldErrors).length === 0
          ? result.error.message || 'No se pudo guardar la dirección'
          : undefined,
      fieldErrors,
    }
  }

  return { success: 'Dirección guardada. Continuemos con el pedido.' }
}

export default function AddressPage() {
  const { addresses } = useLoaderData<typeof loader>()
  const actionData = useActionData<Route.ComponentProps['actionData']>()
  const navigation = useNavigation()
  const submitting = navigation.state === 'submitting'
  const fieldErrors = actionData?.fieldErrors ?? {}

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900">Dirección</h1>
      <p className="mb-6 text-sm text-zinc-600">
        Completá los datos de entrega para continuar.
      </p>

      {actionData?.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {actionData.error}
        </div>
      )}
      {actionData?.success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {actionData.success}
        </div>
      )}

      {addresses.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">
            Tus direcciones
          </h2>
          {addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700"
            >
              <p className="font-medium text-zinc-900">
                {address.type === 'shipping' ? 'Envío' : 'Facturación'}
              </p>
              <p>{address.address_line_1}</p>
              {address.address_line_2 && <p>{address.address_line_2}</p>}
              <p>
                {address.city}, {address.province}
              </p>
              <p>{address.phone}</p>
            </article>
          ))}
        </div>
      )}

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
        <div className="md:col-span-2">
          <Input
            label="Referencia"
            name="reference"
            placeholder="Cerca de..."
            error={fieldErrors.reference?.[0]}
          />
        </div>

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
    </section>
  )
}
