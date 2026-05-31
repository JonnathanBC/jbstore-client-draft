import {
  Select as SelectUI,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '~/components/ui/select'
import { cn } from '~/lib/utils'

type SelectItem = Record<string, string> & { value: string }

const EMPTY_ITEMS: SelectItem[] = []

type Props = {
  items?: SelectItem[]
  onChange?: (value: string) => void
  onItemSelect?: (item: SelectItem) => void
  className?: string
  value?: string
  disabled?: boolean
  placeholder?: string
}

export const Select = ({
  items = EMPTY_ITEMS,
  onChange,
  onItemSelect,
  value,
  disabled,
  placeholder,
  className,
}: Props) => {

  const handleValueChange = (val: string) => {
    onChange?.(val)
    const selected = items.find((item) => item.value === val)
    if (selected) onItemSelect?.(selected)
  }

  return (
    <SelectUI
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
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
