import { useRef } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

export interface CarruselImageProps {
  id: number | string
  src: string
  alt?: string
}

interface CarruselProps {
  images: CarruselImageProps[]
  className?: string
  /** Milisegundos entre slides. 0 desactiva el autoplay. */
  autoplayDelay?: number
}

export const CarruselImage = ({
  images,
  className,
  autoplayDelay = 8000,
}: CarruselProps) => {
  // useRef para que el plugin no se re-instancie en cada render
  const autoplay = useRef(
    autoplayDelay > 0
      ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]
      : [],
  )

  if (!images.length) return null

  return (
    <Carousel
      className={className}
      opts={{ loop: true }}
      plugins={autoplay.current}
    >
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.id}>
            <img
              src={image.src}
              alt={image.alt ?? ''}
              className="aspect-3/1 w-full object-cover object-center"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  )
}
