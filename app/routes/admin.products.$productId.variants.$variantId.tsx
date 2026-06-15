import { useEffect, useState } from 'react'
import { data, useFetcher } from 'react-router'
import { toast } from 'sonner'

import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.products.$productId.variants.$variantId'
import { getVariant, updateVariant } from '~/server/variants'
import { Upload } from 'lucide-react'
import { createImagePreview } from '~/lib/helper'
import { Field } from '~/components/inputs/Field'
import { Input } from '~/components/shared/Input'
import { Button } from '~/components/ui/button'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.variant
      ? `${data.variant.features.map((f: any) => f.description).join(' | ')} | JB Store`
      : `${t('global.edit')} | JB Store`,
  },
]

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (
      match as {
        data?: {
          variant?: {
            name: string
            product: { id: number; name: string }
            features: { description: string }[]
          }
        }
      }
    ).data

    return [
      { label: t('global.products'), to: `/admin/products` },
      {
        label: data?.variant?.product.name ?? '',
        to: `/admin/products/${data?.variant?.product?.id}`,
      },
      {
        label:
          data?.variant?.features.map((f) => f.description).join(' | ') ??
          t('global.edit'),
      },
    ]
  },
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const productId = Number(params.productId)
  const variantId = Number(params.variantId)

  try {
    const variant = await getVariant(productId, variantId, token)
    return { variant }
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status: number }).status
        : 500
    throw new Response(
      status === 404
        ? 'Variante no encontrada o no pertenece a este producto'
        : 'Error del servidor',
      {
        status,
      },
    )
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const productId = Number(params.productId)
  const variantId = Number(params.variantId)

  const formData = await request.formData()
  const image = formData.get('image') as File | null
  const sku = formData.get('sku') as string
  const stock = formData.get('stock') as string

  const payload = new FormData()
  payload.append('_method', 'PUT')
  payload.append('sku', sku)
  payload.append('stock', stock)
  if (image && image.size > 0) {
    payload.append('image', image)
  }

  const result = await updateVariant(productId, variantId, payload, token)

  if ('error' in result) {
    return data(
      { error: result.error.message, errors: result.error.errors ?? {} },
      { status: result.error.status },
    )
  }

  return { success: true }
}

export default function VariantEdit({ loaderData }: Route.ComponentProps) {
  const { variant } = loaderData
  const fetcher = useFetcher()
  const [preview, setPreview] = useState<string>()

  useEffect(() => {
    const data = fetcher.data as any
    if (data?.error) {
      toast.error(data.error)
    } else if (data?.success) {
      toast.success('Variante actualizada')
      setPreview(undefined) // Limpiamos la previa local para usar la del servidor que viene en el loader
    }
  }, [fetcher.data])

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0] : null
    if (!file) return
    const img = createImagePreview(file)
    setPreview(img?.url)
  }

  return (
    <fetcher.Form method="post" encType="multipart/form-data">
      <div>
        <figure>
          <img
            className="aspect-video w-full object-cover object-center"
            src={preview ?? variant.image}
            alt={variant.id.toString()}
          />
        </figure>
        <div className="my-4">
          <label
            htmlFor="image-upload"
            className="btn btn-primary inline-flex cursor-pointer gap-2"
          >
            <Upload />
            Actualizar imagen
          </label>
          <input
            id="image-upload"
            type="file"
            className="hidden"
            accept="image/*"
            name="image"
            onChange={handleImageUpload}
          />
          {/* {validationErrors?.image?.[0] && (
            <p className="mt-1 text-sm text-red-500">
              {validationErrors.image[0]}
            </p>
          )} */}
        </div>
      </div>

      <div className="card">
        <div className="space-y-4">
          <Input name="sku" label="Ingrese el código (SKU)" defaultValue={variant.sku} />
          <Input name="stock" label="Ingrese el stock" type='number' defaultValue={variant.stock} />
        </div>

        <div className='mt-4 text-right'>
          <Button>
            Actualizar
          </Button>
        </div>
      </div>
    </fetcher.Form>
  )
}
