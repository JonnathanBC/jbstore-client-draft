import { Select as SelectUI, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '~/components/ui/select';

type Props = {
  items: {
    value: string;
    label: string;
  }[];
  onChange?: (value: string) => void;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const Select = ({ items = [], onChange, value, disabled, placeholder }: Props) => {
  return (
    <SelectUI value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full px-3 py-2 border border-weak rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {
            items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))
          }
        </SelectGroup>
      </SelectContent>
    </SelectUI>
  )
}