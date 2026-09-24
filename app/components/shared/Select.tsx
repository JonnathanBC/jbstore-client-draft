import type { ComponentType, InputHTMLAttributes, SVGProps } from 'react'
import { cn } from '~/lib/utils'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  items: { value: string; label: string }[]
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

export function Select({ label, name, icon: Icon, className, items }: Props) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-900">
        <p className="mb-1">{label}</p>
        <div className="relative flex items-center">
          <select
            id={name}
            name={name}
            className={cn(
              'w-full rounded border border-zinc-300 py-3 pr-10 pl-4 text-sm text-slate-900 outline-purple-600',
              className,
            )}
          >
            {items.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {Icon ? (
            <Icon className="absolute right-4 size-5 text-zinc-400" />
          ) : null}
        </div>
      </label>
    </div>
  )
}
