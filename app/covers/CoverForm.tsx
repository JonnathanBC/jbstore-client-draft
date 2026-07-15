import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigation, useSubmit } from 'react-router'
import { Upload } from 'lucide-react'

import { Datepicker } from '~/components/inputs/Datepicker'
import { Field } from '~/components/inputs/Field'
import { Radio } from '~/components/inputs/Radio'
import { t } from '~/i18n'
import { createImagePreview } from '~/lib/helper'

interface CoverFormValues {
  title: string
  start_at: string
  end_at: string
  is_active: string
  image?: File
}

interface Props {
  cover?: any // TODO: Define the type for cover
}

/** Laravel's `boolean` rule only casts 1/0/"1"/"0" — "true"/"false" fail it. */
const IS_ACTIVE_ITEMS = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
]

export function CoverForm({ cover }: Props) {
  const nav = useNavigation()
  const submit = useSubmit()
  const { handleSubmit, setValue } = useFormContext<CoverFormValues>()
  const submitting = nav.state === 'submitting'
  const isEdit = Boolean(cover)
  const [preview, setPreview] = useState<string>()

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0] : null
    if (!file) return
    const img = createImagePreview(file)
    setValue('image', file, { shouldDirty: true })
    setPreview(img?.url)
  }

  function save(values: CoverFormValues) {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      formData.append(key, value)
    })
    if (cover) formData.append('id', String(cover.id))
    formData.append('_action', 'update')

    submit(formData, { method: 'post', encType: 'multipart/form-data' })
  }

  function remove() {
    const formData = new FormData()
    formData.append('id', String(cover.id))
    formData.append('_action', 'delete')

    submit(formData, { method: 'post' })
  }

  return (
    <form onSubmit={handleSubmit(save)} className="space-y-4">
      <figure className="mb-4">
        <img
          className="aspect-video object-cover object-center"
          src={preview ?? cover?.image ?? '/assets/no_image_placeholder.webp'}
          alt=""
        />
      </figure>
      <label
        htmlFor="image-upload"
        className="btn btn-primary inline-flex cursor-pointer gap-2"
      >
        <Upload />
        {t('global.update_image')}
      </label>
      <input
        id="image-upload"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="space-y-4">
        <Field
          labelKey="global.title"
          name="title"
          placeholder="Ingrese el título de la portada"
          obb
        />
        <Field
          labelKey="global.start_date"
          name="start_at"
          component={Datepicker}
          placeholder="Seleccione la fecha de inicio"
          obb
        />
        <Field
          labelKey="global.end_date"
          name="end_at"
          component={Datepicker}
          placeholder="Seleccione la fecha de fin"
        />
        <Field
          labelKey="global.status"
          name="is_active"
          component={Radio}
          items={IS_ACTIVE_ITEMS}
          orientation="horizontal"
          obb
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t('global.saving') : t('global.save')}
        </button>
        {isEdit ? (
          <button type="button" className="btn btn-danger" onClick={remove}>
            {t('global.delete')}
          </button>
        ) : null}
      </div>
    </form>
  )
}
