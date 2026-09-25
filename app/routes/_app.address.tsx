import { useEffect } from 'react'
import { useActionData, useLoaderData, useNavigation } from 'react-router'
import { toast } from 'sonner'
import type { Route } from './+types/_app.address'
import { requireAuth } from '~/server/auth.server'
import { createAddress, getAddresses } from '~/server/addresses.server'
import { ShippingAddress } from '~/addresses/components/ShippingAddress'
import type { AddressInput } from '~/types/addresses'

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
    is_default: Boolean(form.get('is_default')),
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

  useEffect(() => {
    if (actionData?.error) toast.error(actionData.error)
    if (actionData?.success) toast.success(actionData.success)
  }, [actionData])

  return (
    <section className="">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <ShippingAddress
            addresses={addresses}
            fieldErrors={fieldErrors}
            submitting={submitting}
          />
        </div>
        <div className="col-span-1"></div>
      </div>

      {/* {addresses.length > 0 && (
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
      )} */}
    </section>
  )
}
