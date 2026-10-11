import type { Dispatch, SetStateAction } from 'react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'

type Props = {
  quantity: number
  setQuantity: Dispatch<SetStateAction<number>>
  className?: string
}

export const QuantityButton = ({ quantity, setQuantity, className }: Props) => {
  return (
    <div className={cn('flex items-center space-x-6', className)}>
      <Button
        type="button"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        disabled={quantity <= 1}
      >
        -
      </Button>

      <span>{quantity}</span>

      <Button type="button" onClick={() => setQuantity((q) => q + 1)}>
        +
      </Button>
    </div>
  )
}
