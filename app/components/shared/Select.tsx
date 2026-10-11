import { Select as BaseSelect } from '~/components/inputs/Select'

interface Props {
  name: string
  label: string
  items: { value: string; label: string }[]
  defaultValue?: string
  error?: string
  className?: string
}

// Para forms nativos (sin react-hook-form): label + error alrededor del Select único
export function Select({
  name,
  label,
  items,
  defaultValue,
  error,
  className,
}: Props) {
  return (
    <div className="text-sm font-medium text-zinc-900">
      <label htmlFor={name} className="mb-1 block">
        {label}
      </label>
      <BaseSelect
        id={name}
        name={name}
        items={items}
        // El <select> nativo arrancaba en la primera opción: mantenemos ese comportamiento
        defaultValue={defaultValue ?? items[0]?.value}
        className={className}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
