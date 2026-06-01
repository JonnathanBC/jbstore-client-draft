import { X } from 'lucide-react'

type Props = {
  label: string
  onClick?: () => void
}

export const Badge = ({ label, onClick }: Props) => {
  return (
    <span className="text-heading flex items-center rounded-full bg-zinc-100 py-1 pr-1.5 pl-2 text-xs">
      {label}
      {onClick && (
        <button onClick={onClick} className="ml-1" type="button">
          <X className="size-3.5 hover:cursor-pointer hover:text-red-600" />
        </button>
      )}
    </span>
  )
}
