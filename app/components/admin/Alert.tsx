import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'
import { cn } from '~/lib/utils'

const alertVariants = cva(
  'rounded-sm flex items-start p-4 text-sm sm:items-center',
  {
    variants: {
      variant: {
        default: 'text-strong bg-primary/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const Alert = ({
  className,
  variant = 'default',
  message,
}: { className?: string; variant?: string; message: string } & VariantProps<
  typeof alertVariants
> & {
    asChild?: boolean
  }) => {
  return (
    <div className={cn(alertVariants({ variant, className }))} role="alert">
      <svg
        className="me-2 mt-0.5 h-4 w-4 shrink-0 sm:mt-0"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <p>{message}</p>
    </div>
  )
}

export default Alert
