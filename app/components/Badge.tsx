import { X } from 'lucide-react'
import { cn } from '~/lib/utils'

type Props = {
  label: string
  onClick?: () => void
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger'
  labelClassName?: string
}

const variantClassNames = {
  default: 'bg-zinc-100',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  danger: 'bg-red-100 text-red-800',
}

export const Badge = ({
  label,
  onClick,
  variant = 'default',
  labelClassName,
}: Props) => {
  return (
    <span
      className={cn(
        'text-heading inline-flex w-fit max-w-full items-center rounded-full px-2 py-1.5 text-xs font-medium',
        variantClassNames[variant],
      )}
    >
      <span className={labelClassName}>{label}</span>
      {onClick && (
        <button onClick={onClick} className="ml-1" type="button">
          <X className="size-3.5 hover:cursor-pointer hover:text-red-600" />
        </button>
      )}
    </span>
  )
}
