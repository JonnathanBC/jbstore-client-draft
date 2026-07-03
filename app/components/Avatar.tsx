import {
  AvatarFallback,
  AvatarImage,
  Avatar as ShadcnAvatar,
} from '@/components/ui/avatar'
import { User2 } from 'lucide-react'
import { cn } from '~/lib/utils'

interface Props {
  src: string
  alt?: string
  className?: string
}

export function Avatar({
  alt,
  className,
  src = 'https://github.com/shadcn.png',
}: Props) {
  return (
    <ShadcnAvatar>
      <AvatarImage src={src} alt={alt} className={cn(className)} />
      <AvatarFallback className="bg-gray-100">
        <User2 className="size-5 md:size-6" />
      </AvatarFallback>
    </ShadcnAvatar>
  )
}
