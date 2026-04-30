import type { ComponentType, InputHTMLAttributes, SVGProps } from 'react'
import { cn } from '~/lib/utils'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string
  label: string
  type?: 'text' | 'email' | 'password'
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

export function Input({
  label,
  name,
  type = 'text',
  icon: Icon,
  className,
  ...rest
}: Props) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-900"
      >
        <p className="mb-1">{label}</p>
        <div className="relative flex items-center">
          <input
            id={name}
            name={name}
            type={type}
            className={cn(
              'w-full rounded border border-slate-300 py-3 pr-10 pl-4 text-sm text-slate-900 outline-purple-600',
              className,
            )}
            {...rest}
          />
          {Icon ? (
            <Icon className="absolute right-4 h-5 w-5 text-slate-400" />
          ) : null}
        </div>
      </label>
    </div>
  )
}
