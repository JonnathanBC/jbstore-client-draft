import type { ComponentType, InputHTMLAttributes, SVGProps } from 'react'
import { cn } from '~/lib/utils'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string
  append: string
  error?: string
}

export function Checkbox({ name, error, className, append, ...rest }: Props) {
  return (
    <label htmlFor={name} className="flex items-center gap-2">
      <input
        id={name}
        name={name}
        type="checkbox"
        className={cn(className)}
        {...rest}
      />

      <span className="flex items-center gap-1">
        <p>{append}</p>
        {rest.required && <span className="text-red-800">*</span>}
      </span>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </label>
  )
}
