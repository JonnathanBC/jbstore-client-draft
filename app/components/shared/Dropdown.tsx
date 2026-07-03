import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  children: React.ReactNode
  className?: string
  items: {
    headerLabel?: string
    label: string | ReactNode
    divider?: boolean
    onClick: () => void
  }[]
}

export const Dropdown = ({ children, items }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        {items.map((item) => (
          <DropdownMenuGroup>
            {item.headerLabel && (
              <DropdownMenuLabel>{item.headerLabel}</DropdownMenuLabel>
            )}
            <DropdownMenuItem onClick={item.onClick}>
              {item.label}
            </DropdownMenuItem>
            {item.divider && <DropdownMenuSeparator />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
