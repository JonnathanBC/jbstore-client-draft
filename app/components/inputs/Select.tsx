import {
  Select as SelectUI,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '~/components/ui/select'
import { cn } from '~/lib/utils'

const EMPTY_ITEMS: { value: string; label: string }[] = []

type Props = {
  items?: typeof EMPTY_ITEMS
  onChange?: (value: string) => void
  className?: string
  value?: string
  disabled?: boolean
  placeholder?: string
}

export const Select = ({
  items = EMPTY_ITEMS,
  onChange,
  value,
  disabled,
  placeholder,
  className,
}: Props) => {
  return (
    <SelectUI value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'border-weak focus:ring-primary h-10! w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none',
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectUI>
  )
}
