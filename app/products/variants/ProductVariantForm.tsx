import { Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { AsyncSelect } from '~/components/inputs/AsyncSelect'
import { Field } from '~/components/inputs/Field'
import { Button } from '~/components/ui/button'
import { t } from '~/i18n'

interface FormValues {
  option_id: string
  features: { id: string; value: string; description: string }[]
}

export function ProductVariantForm() {
  const { watch, control } = useFormContext<FormValues>()
  const optionId = watch('option_id')
  const { fields, append, remove } = useFieldArray<FormValues, 'features'>({
    control,
    name: 'features',
  })

  return (
    <div className="space-y-4">
      <Field
        labelKey="global.option"
        name="option_id"
        component={AsyncSelect}
        source="/resources/options"
      />

      {/*  DIVIDER */}
      <div className="flex items-center">
        <hr className="flex-1" />
        <span className="mx-4">{t('global.values')}</span>

        <hr className="flex-1" />
      </div>

      <ul className="mb-4 space-y-4">
        {fields.map((feature, index) => (
          <li
            className="relative rounded-lg border border-gray-200 p-6"
            key={`variant-feature-${index}`}
          >
            <div className="absolute -top-3 bg-white px-4">
              <button
                className="text-red-500 hover:text-red-600"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-5" />
              </button>
            </div>

            <div>
              <Field
                labelKey="global.values"
                name="feature_id"
                component={AsyncSelect}
                source={
                  '/resources/features' +
                  `${optionId && `?option_id=${optionId}`}`
                }
                disabled={!optionId}
                key={optionId}
              />
            </div>
            {feature.value}
          </li>
        ))}
      </ul>

      <div className="text-right">
        <Button
          type="button"
          variant="default"
          onClick={() => append({ id: '', value: '', description: '' })}
        >
          Agregar Valor
        </Button>
      </div>
    </div>
  )
}
