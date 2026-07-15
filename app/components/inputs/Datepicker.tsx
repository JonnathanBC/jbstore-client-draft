import { useState } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/lib/utils'

const VALUE_FORMAT = 'yyyy-MM-dd'
const DISPLAY_FORMAT = 'dd/MM/yyyy'

type Props = {
  value?: string | Date
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

function toDate(value?: string | Date) {
  if (!value) return undefined
  const date = value instanceof Date ? value : parseISO(value)
  return isValid(date) ? date : undefined
}

export const Datepicker = ({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder,
  className,
}: Props) => {
  const [open, setOpen] = useState(false)
  const selected = toDate(value)

  const handleSelect = (date?: Date) => {
    onChange?.(date ? format(date, VALUE_FORMAT) : '')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            'border-weak focus:ring-primary h-10! w-full justify-between rounded-lg border px-3 py-2 font-normal focus:ring-2 focus:outline-none',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          {selected ? format(selected, DISPLAY_FORMAT) : placeholder}
          <CalendarIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
