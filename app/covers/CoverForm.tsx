import { Form, useNavigation } from 'react-router'
import { t } from '@/i18n'
import { Field } from '~/components/inputs/Field'
import { Upload } from 'lucide-react'
import { createImagePreview } from '~/lib/helper'
import { useState } from 'react'

interface Props {
  cover?: any // TODO: Define the type for cover
  error?: string | null
}

export function CoverForm({ cover }: Props) {
  const nav = useNavigation()
  const submitting = nav.state === 'submitting'
  const isEdit = Boolean(cover)
  const [preview, setPreview] = useState<string>()

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0] : null
    if (!file) return
    const img = createImagePreview(file)
    setPreview(img?.url)
  }

  return (
    <Form method="post" className="space-y-4">
      <figure className="">
        <img
          className="aspect-video object-cover object-center"
          src={
            preview ?? cover?.image_path ?? '/assets/no_image_placeholder.webp'
          }
          alt=""
        />
      </figure>
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
      <div>
        <Field
          labelKey="global.option"
          name="option_id"
          source="/resources/options"
        />
      </div>

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

      {/* {isEdit ? <input type="hidden" name="id" value={family!.id} /> : null} */}
    </Form>
  )
}
