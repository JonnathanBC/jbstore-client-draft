import type { Dispatch, SetStateAction } from 'react'
import { cn } from '~/lib/utils'

type Props = {
  quantity: number
  setQuantity: Dispatch<SetStateAction<number>>
  className?: string
}

export const QuantityButton = ({ quantity, setQuantity, className }: Props) => {
  return (
    <div className={cn('flex items-center space-x-6', className)}>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        disabled={quantity <= 1}
      >
        -
      </button>

      <span>{quantity}</span>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setQuantity((q) => q + 1)}
      >
        +
      </button>
    </div>
  )
}
