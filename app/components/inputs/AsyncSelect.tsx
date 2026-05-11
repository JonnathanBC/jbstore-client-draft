import { useFetcher } from 'react-router'
import { useEffect, useState } from 'react'

import { Select } from '~/components/inputs/Select'

type Props = {
  name: string
  value?: string
  onChange?: (value: string) => void
  source: string
  placeholder?: string
  disabled?: boolean
}

export const AsyncSelect = ({
  value: externalValue = '',
  onChange,
  source,
  name,
  placeholder = 'Selecciona...',
  disabled,
}: Props) => {
  const fetcher = useFetcher()
  const [internalValue, setInternalValue] = useState('')

  useEffect(() => {
    if (disabled) return
    if (fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load(source)
    }
  }, [fetcher, source, disabled])

  const items = fetcher.data?.items ?? []
  const isLoading = fetcher.state === 'loading'

  const value = externalValue || internalValue

  const handleSelect = (newValue: string) => {
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select
        items={items}
        value={value}
        onChange={handleSelect}
        disabled={isLoading || disabled}
        placeholder={isLoading ? 'Cargando...' : placeholder}
      />
    </>
  )
}
