import { useEffect } from 'react'
import { Select } from './Select'
import { useFetcher } from 'react-router'
import {
  ControllerRenderProps,
  FieldError,
  UseFormReturn,
} from 'react-hook-form'

interface AsyncSelectProps {
  field: ControllerRenderProps
  form: UseFormReturn
  source: string
  error?: FieldError
  disabled?: boolean
}

export const AsyncSelect = ({
  field,
  form,
  source,
  disabled = false,
  ...props
}: AsyncSelectProps) => {
  const fetcher = useFetcher()
  const { onChange: _onChange, ...restField } = field

  useEffect(() => {
    if (fetcher.state === 'idle' && !fetcher.data && !disabled) {
      fetcher.load(source)
    }
  }, [source])

  const items = fetcher.data?.items ?? []

  return (
    <Select
      onChange={(value) => form.setValue(field.name, value)}
      items={items}
      disabled={fetcher.state === 'loading'}
      {...restField}
      {...props}
    />
  )
}
