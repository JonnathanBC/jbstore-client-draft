import { Upload } from 'lucide-react'
import { useState } from 'react'
import { Form, useNavigation } from 'react-router'

import { AsyncSelect } from '~/components/inputs/AsyncSelect'
import { t } from '~/i18n'
import { createImagePreview } from '~/lib/helper'
import type { Product } from '~/types/product'

interface Props {
  product?: Product
  validationErrors?: Record<string, string[]> | null
}

export function ProductForm({ product, validationErrors }: Props) {
  const nav = useNavigation()
  const submitting = nav.state === 'submitting'
  const isEdit = Boolean(product)

  const [preview, setPreview] = useState<string>()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0] : null
    if (!file) return
    const img = createImagePreview(file)
    setPreview(img?.url)
  }

  const [familyId, setFamilyId] = useState(
    product?.subcategory?.category?.family_id?.toString() ?? undefined,
  )

  const [categoryId, setCategoryId] = useState(
    product?.subcategory?.category?.id?.toString() ?? undefined,
  )

  return (
    <Form method="post" className="space-y-4" encType="multipart/form-data">
      <figure className="">
        <img
          className="aspect-video object-cover object-center"
          src={
            preview ??
            product?.image_path ??
            '/assets/no_image_placeholder.webp'
          }
          alt=""
        />
      </figure>

      <div className="mb-4">
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
          onChange={handleChange}
        />
        {validationErrors?.image?.[0] && (
          <p className="mt-1 text-sm text-red-500">
            {validationErrors.image[0]}
          </p>
        )}
      </div>

      <label
        htmlFor="sku"
        className="text-strong-weak mb-1 block text-sm font-medium"
      >
        {t('global.code')}
      </label>
      <input
        id="sku"
        name="sku"
        type="text"
        defaultValue={product?.sku ?? ''}
        placeholder="Ingrese el código del producto"
        className="border-weak focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
      />
      {validationErrors?.sku?.[0] && (
        <p className="mt-1 text-sm text-red-500">{validationErrors.sku[0]}</p>
      )}

      <label
        htmlFor="name"
        className="text-strong-weak mb-1 block text-sm font-medium"
      >
        {t('global.name')}
      </label>
      <input
        id="name"
        name="name"
        type="text"
        defaultValue={product?.name ?? ''}
        placeholder="Ingrese el nombre del producto"
        className="border-weak focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
      />
      {validationErrors?.name?.[0] && (
        <p className="mt-1 text-sm text-red-500">{validationErrors.name[0]}</p>
      )}

      <label
        htmlFor="price"
        className="text-strong-weak mb-1 block text-sm font-medium"
      >
        {t('global.price')}
      </label>
      <input
        id="price"
        name="price"
        type="number"
        step={0.01}
        defaultValue={product?.price ?? ''}
        placeholder="Ingrese el precio del producto"
        className="border-weak focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
      />
      {validationErrors?.price?.[0] && (
        <p className="mt-1 text-sm text-red-500">{validationErrors.price[0]}</p>
      )}

      <label
        htmlFor="description"
        className="text-strong-weak mb-1 block text-sm font-medium"
      >
        Descripción
      </label>
      <textarea
        id="description"
        name="description"
        defaultValue={product?.description ?? ''}
        placeholder="Ingrese la description del producto"
        className="border-weak focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
      />
      {validationErrors?.description?.[0] && (
        <p className="mt-1 text-sm text-red-500">
          {validationErrors.description[0]}
        </p>
      )}

      <label
        htmlFor="family_id"
        className="text-strong-weak mb-1 block text-sm font-medium"
      >
        {t('admin.family')}
      </label>
      <AsyncSelect
        name="family_id"
        value={familyId}
        onChange={(value) => {
          setFamilyId(value)
        }}
        source="/resources/families"
        placeholder="Selecciona una familia"
      />

      <label
        htmlFor="category_id"
        className="text-strong-weak mb-1 block text-sm font-medium"
      >
        {t('admin.category')}
      </label>
      <AsyncSelect
        key={familyId}
        name="category_id"
        value={categoryId}
        onChange={(value) => {
          setCategoryId(value)
        }}
        source={`/resources/categories?family_id=${familyId}`}
        placeholder="Selecciona una categoría"
        disabled={!familyId}
      />

      <label
        htmlFor="subcategory_id"
        className="text-strong-weak mb-1 block text-sm font-medium"
      >
        {t('admin.subcategory')}
      </label>
      <AsyncSelect
        key={categoryId}
        name="subcategory_id"
        value={product?.subcategory_id?.toString() ?? ''}
        source={`/resources/subcategories?category_id=${categoryId}`}
        placeholder="Selecciona una subcategoría"
        disabled={!categoryId}
      />
      {validationErrors?.subcategory_id?.[0] && (
        <p className="mt-1 text-sm text-red-500">
          {validationErrors.subcategory_id[0]}
        </p>
      )}

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

      {isEdit ? <input type="hidden" name="id" value={product!.id} /> : null}
    </Form>
  )
}
