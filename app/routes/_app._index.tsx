import { CarruselImage } from '~/components/shared/CarruselImage'
import { getPublicCovers } from '~/server/covers.server'
import type { Route } from './+types/_app._index'

export const meta: Route.MetaFunction = () => [{ title: 'JB Store' }]

export async function loader() {
  const [covers] = await Promise.all([getPublicCovers()])
  return { covers }
}

export default function HomeIndex({ loaderData }: Route.ComponentProps) {
  const { covers } = loaderData

  return (
    <div>
      <CarruselImage
        images={covers.map((cover) => ({
          id: cover.id,
          src: cover.image,
          alt: cover.title,
        }))}
      />
    </div>
  )
}
