import { Input as InputShadcn } from '@/components/ui/input'
import { t } from '~/i18n'

interface Props {
  name: string
  labelKey?: string
  label?: string
  type?: 'string' | 'password' | 'number' | 'color'
  placeholder?: string
  className?: string
}

export function Input({
  name,
  type,
  labelKey,
  label,
  placeholder,
  className,
  ...rest
}: Props) {
  return (
    <div className={className}>
      <label htmlFor={name}>{labelKey ? t(labelKey) : label}</label>
      <InputShadcn
        id={name}
        type={type}
        placeholder={placeholder}
        name={name}
        className="input mt-0.5"
        {...rest}
      />
    </div>
  )
}
