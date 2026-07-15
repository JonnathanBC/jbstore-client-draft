import {
  RadioGroup as RadioGroupUI,
  RadioGroupItem,
} from '~/components/ui/radio-group'
import { cn } from '~/lib/utils'

type RadioItem = Record<string, string> & { value: string; label: string }

const EMPTY_ITEMS: RadioItem[] = []

type Props = {
  items?: RadioItem[]
  value?: string
  onChange?: (value: string) => void
  onItemSelect?: (item: RadioItem) => void
  onBlur?: () => void
  name?: string
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export const Radio = ({
  items = EMPTY_ITEMS,
  value,
  onChange,
  onItemSelect,
  onBlur,
  name,
  disabled,
  orientation = 'vertical',
  className,
}: Props) => {
  const handleValueChange = (val: string) => {
    onChange?.(val)
    const selected = items.find((item) => item.value === val)
    if (selected) onItemSelect?.(selected)
  }

  return (
    <RadioGroupUI
      name={name}
      value={value}
      onValueChange={handleValueChange}
      onBlur={onBlur}
      disabled={disabled}
      className={cn(
        orientation === 'horizontal'
          ? 'flex flex-wrap items-center gap-4'
          : 'grid gap-2',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.value} className="flex items-center gap-2">
          <RadioGroupItem value={item.value} id={`${name}-${item.value}`} />
          <label
            htmlFor={`${name}-${item.value}`}
            className="cursor-pointer text-sm"
          >
            {item.label}
          </label>
        </div>
      ))}
    </RadioGroupUI>
  )
}
