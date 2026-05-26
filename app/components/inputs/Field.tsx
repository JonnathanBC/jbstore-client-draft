import { ElementType } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Input as InputShadcn } from '@/components/ui/input'
import { t } from '~/i18n'
import { FieldError } from './FieldError'

interface FieldProps {
  name: string
  labelKey?: string
  label?: string
  component?: ElementType
  source?: string
}

export const Field = ({
  label,
  labelKey,
  name,
  component: Component = InputShadcn,
  ...rest
}: FieldProps) => {
  const form = useFormContext()

  return (
    <>
      <label htmlFor={name}>{labelKey ? t(labelKey) : label}</label>
      <Controller
        name={name}
        control={form.control}
        defaultValue=""
        render={({ field, fieldState }) => (
          <Component
            field={field}
            form={form}
            error={fieldState.error}
            {...field}
            {...rest}
          />
        )}
      />
      <FieldError name={name} />
    </>
  )
}
