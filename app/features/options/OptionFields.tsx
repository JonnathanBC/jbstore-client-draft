import { Trash2 } from 'lucide-react'
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form'

import { Field } from '~/components/inputs/Field'
import { FieldError } from '~/components/inputs/FieldError'
import { Select } from '~/components/inputs/Select'
import { t } from '~/i18n'

/** 1 = texto, 2 = color (así lo guarda la API). */
const TYPE_ITEMS = [
  { value: '1', label: 'Texto' },
  { value: '2', label: 'Color' },
]

const EMPTY_FEATURE = { value: '', description: '' }

export const toOptionFormValues = () => ({
  name: '',
  type: 1,
  features: [EMPTY_FEATURE],
})

const ColorValue = ({ index }: { index: number }) => {
  const { register, control } = useFormContext()
  const value = useWatch({ control, name: `features.${index}.value` })

  return (
    <div className="flex w-full flex-col">
      <label htmlFor={`color-${index}`} className="mb-0.5">
        Color
      </label>
      <div className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 px-2">
        <span className="shrink-0">{value || 'Selecciona'}</span>
        <input
          id={`color-${index}`}
          type="color"
          {...register(`features.${index}.value`)}
          className="border-none! focus:ring-0"
        />
      </div>
      <FieldError name={`features.${index}.value`} />
    </div>
  )
}

export const OptionFields = () => {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  })
  const type = useWatch({ control, name: 'type' })

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field labelKey="global.name" name="name" placeholder="Nombre" obb />

      <div>
        <label>{t('global.type')}</label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              items={TYPE_ITEMS}
              value={String(field.value)}
              onChange={(value) => field.onChange(Number(value))}
              className="mt-0.5"
            />
          )}
        />
        <FieldError name="type" />
      </div>

      <hr className="col-span-2" />

      <h2 className="col-span-2">Valores</h2>

      <ul className="col-span-2 space-y-4">
        {fields.map((item, index) => (
          <li key={item.id} className="flex items-start gap-2">
            {type === 2 ? (
              <ColorValue index={index} />
            ) : (
              <Field
                labelKey="global.value"
                name={`features.${index}.value`}
                className="w-full"
              />
            )}

            <Field
              labelKey="global.description"
              name={`features.${index}.description`}
              className="w-full"
            />

            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-8 ml-2"
            >
              <Trash2 className="size-5 cursor-pointer hover:text-red-800" />
            </button>
          </li>
        ))}
      </ul>

      <FieldError name="features" />

      <button
        type="button"
        className="btn btn-primary col-span-2 justify-self-start"
        onClick={() => append(EMPTY_FEATURE)}
      >
        Añadir
      </button>
    </div>
  )
}
