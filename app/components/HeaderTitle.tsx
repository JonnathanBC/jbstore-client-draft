import { cn } from '~/lib/utils'

type Props = {
  title: string
  className?: string
}

export const HeaderTitle = ({ title, className }: Props) => {
  return <p className={cn('text-3xl font-semibold', className)}>{title}</p>
}
