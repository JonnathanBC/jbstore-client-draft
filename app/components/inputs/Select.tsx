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
  // Sin value/onChange (form nativo): Radix renderiza un <select> oculto con este name y viaja en el formData
  defaultValue?: string
  name?: string
  id?: string
  disabled?: boolean
  placeholder?: string
}

export const Select = ({
  items = EMPTY_ITEMS,
  onChange,
  onItemSelect,
  value,
  defaultValue,
  name,
  id,
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
      defaultValue={defaultValue}
      name={name}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      {/* Alto, borde y radio vienen del SelectTrigger de ui: acá solo el ancho */}
      <SelectTrigger id={id} className={cn('w-full', className)}>
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
