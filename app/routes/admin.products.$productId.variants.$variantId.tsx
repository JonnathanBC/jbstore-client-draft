import { useEffect, useState } from 'react'
import { data, useFetcher } from 'react-router'
import { toast } from 'sonner'

import { t } from '~/i18n'
import { requireAuth } from '~/server/auth.server'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.products.$productId.variants.$variantId'
import { getVariant, updateVariant } from '~/server/variants'
import { Upload } from 'lucide-react'

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

  if (!image || image.size === 0) {
    return data({ error: 'No se seleccionó ninguna imagen' }, { status: 400 })
  }

  const payload = new FormData()
  payload.append('image', image)
  payload.append('_method', 'PATCH')

  const result = await updateVariant(productId, variantId, payload, token)

  if ('error' in result) {
    return data(
      { error: result.error.message, errors: result.error.errors ?? {} },
      { status: result.error.status },
    )
  }

  return { success: true }
}

export default function VariantEdit({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { variant } = loaderData
  const fetcher = useFetcher()
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    const data = fetcher.data as any
    if (data?.error) {
      toast.error(data.error)
    } else if (data?.success) {
      toast.success('Imagen actualizada')
      setPreview(null) // Limpiamos la previa local para usar la del servidor que viene en el loader
    }
  }, [fetcher.data])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('image', file)
    fetcher.submit(formData, {
      method: 'POST',
      encType: 'multipart/form-data',
    })
  }

  return (
    <fetcher.Form method="post" encType="multipart/form-data">
      <div className="relative">
        <figure className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
          <img
            className="aspect-video w-full object-cover object-center"
            src={preview ?? variant.image}
            alt={variant.id.toString()}
          />
        </figure>

        <div className="absolute top-4 right-4 sm:top-8 sm:right-9">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2">
            <Upload />
            Actualizar imagen
            <input
              type="file"
              accept="image/*"
              name="image"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>
    </fetcher.Form>
  )
}
