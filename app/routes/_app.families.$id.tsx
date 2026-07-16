import { RouteHandle } from '~/types/route'
import type { Route } from './+types/_app.families.$id'
import { t } from '~/i18n'

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: data?.family ? `${data.family.title} | JB Store` : 'JB Store',
  },
]

export const handle: RouteHandle = {
  breadcrumb: ({ match }) => {
    const data = (match as { data?: { family?: { title: string } } }).data
    return [
      { label: t('global.family') },
      { label: data?.family?.title ?? t('global.edit') },
    ]
  },
}

export default function FamilyDetail({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Productos de esta familia</h1>
    </div>
  )
}
