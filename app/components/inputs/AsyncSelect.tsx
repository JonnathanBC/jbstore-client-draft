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
  valueLabel?: string
  onItemSelect?: (item: Record<string, string> & { value: string }) => void
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
    if (disabled) return
    fetcher.load(source)
  }, [source, disabled])

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
