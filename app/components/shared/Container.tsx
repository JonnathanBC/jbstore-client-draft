import { ReactNode } from 'react'
import { cn } from '~/lib/utils'

interface Props {
  children: ReactNode
  className?: string
}

export const Container = ({ children, className }: Props) => {
  return (
    <div className={cn('mx-auto max-w-7xl sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}
