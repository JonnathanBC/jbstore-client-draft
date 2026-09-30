import { useEffect } from 'react'
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router'
import { toast } from 'sonner'
import type { Route } from './+types/_app.address'
import { requireAuth } from '~/server/auth.server'
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from '~/server/addresses.server'
import { ShippingAddress } from '~/addresses/components/ShippingAddress'
import type { AddressInput } from '~/types/addresses'
import { commitSession, getSession } from '~/server/session.server'
import { loadCart } from '~/server/loadCart.server'
import { CartSummary } from '~/addresses/components/CartSummary'

export const meta: Route.MetaFunction = () => [
  { title: 'Dirección | JB Store' },
]

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuth(request)
  // En paralelo: direcciones y carrito no dependen uno del otro
  const [result, cart] = await Promise.all([
    getAddresses(auth.token),
    loadCart(request, auth.token),
  ])

  if ('error' in result) {
    throw new Response(result.error.message, {
      status: result.error.status,
    })
  }

  return { addresses: result, cart }
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuth(request)
  const form = await request.formData()
  const intent = form.get('intent')

  switch (intent) {
    case 'set-default': {
      const id = Number(form.get('id'))
      if (!Number.isInteger(id) || id <= 0) {
        return { error: 'Dirección inválida' }
      }

      form.delete('intent')
      const result = await setDefaultAddress(id, auth.token)
      if ('error' in result) {
        return {
          error:
            result.error.message ||
            'No se pudo marcar la dirección como predeterminada',
        }
      }

      return { success: 'Dirección marcada como predeterminada' }
    }

    case 'delete': {
      const id = Number(form.get('id'))
      const session = await getSession(request.headers.get('Cookie'))

      if (!Number.isInteger(id) || id <= 0) {
        return { error: 'Dirección inválida' }
      }

      form.delete('intent')
      const result = await deleteAddress(id, auth.token)

      if ('error' in result) {
        return {
          error: result.error.message || 'Error al eliminar la dirección',
        }
      }

      session.flash('toast', {
        kind: 'success',
        title: 'Dirección eliminada correctamente',
      })

      return redirect('/address', {
        headers: { 'Set-Cookie': await commitSession(session) },
      })
    }

    default: {
      const input: AddressInput = {
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

      const id = Number(form.get('id'))
      const isEdit = Number.isInteger(id) && id > 0

      form.delete('intent')

      const result = isEdit
        ? await updateAddress(id, input, auth.token)
        : await createAddress(input, auth.token)
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

      return {
        success: isEdit
          ? 'Dirección actualizada'
          : 'Dirección guardada. Continuemos con el pedido.',
      }
    }
  }
}

export default function AddressPage() {
  const { addresses, cart } = useLoaderData<typeof loader>()
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
        <div className="col-span-1">
          <CartSummary cart={cart} />
        </div>
      </div>
    </section>
  )
}
