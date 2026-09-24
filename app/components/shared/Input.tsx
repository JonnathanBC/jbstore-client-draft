import type { ComponentType, InputHTMLAttributes, SVGProps } from 'react'
import { cn } from '~/lib/utils'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number'
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  error?: string
}

export function Input({
  label,
  name,
  type = 'text',
  icon: Icon,
  error,
  className,
  ...rest
}: Props) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-900">
        <span className="flex items-center gap-1">
          <p className="mb-1">{label}</p>
          {rest.required && <span className="text-red-800">*</span>}
        </span>
        <div className="relative flex items-center">
          <input
            id={name}
            name={name}
            type={type}
            className={cn(
              'w-full rounded border border-zinc-300 py-3 pr-10 pl-4 text-sm text-slate-900 outline-purple-600',
              className,
            )}
            {...rest}
          />
          {Icon ? (
            <Icon className="absolute right-4 size-5 text-zinc-400" />
          ) : null}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </label>
    </div>
  )
}
