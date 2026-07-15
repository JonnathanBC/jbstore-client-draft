import { ComponentProps, ElementType } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Input as InputShadcn } from '@/components/ui/input'
import { t } from '~/i18n'
import { FieldError } from './FieldError'

type FieldOwnProps = {
  name: string
  labelKey?: string
  placeholderKey?: string
  label?: string
  placeholder?: string
  obb?: boolean
  disabled?: boolean
}

/** Props the Controller injects on render — callers never pass these. */
type InjectedProps = 'field' | 'form' | 'error' | 'value' | 'onChange' | 'onBlur'

type FieldProps<C extends ElementType> = FieldOwnProps & {
  component?: C
} & Omit<ComponentProps<C>, keyof FieldOwnProps | 'component' | InjectedProps>

export const Field = <C extends ElementType = typeof InputShadcn>({
  label,
  labelKey,
  name,
  component,
  disabled,
  placeholderKey,
  placeholder,
  obb,
  ...rest
}: FieldProps<C>) => {
  const form = useFormContext()
  const Component = (component ?? InputShadcn) as ElementType

  return (
    <>
      <label htmlFor={name}>
        {labelKey ? t(labelKey) : label}
        {obb && <span className="text-red-600">*</span>}
      </label>
      <Controller
        name={name}
        control={form.control}
        defaultValue=""
        disabled={disabled}
        render={({ field, fieldState }) => (
          <Component
            field={field}
            placeholder={placeholderKey ? t(placeholderKey) : placeholder}
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
