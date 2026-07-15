import { Link } from 'react-router'
import { requireAuth } from '~/server/auth.server'
import { t } from '~/i18n'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.products._index'

export const handle: RouteHandle = { breadcrumb: t('admin.covers') }

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.covers')} | JB Store` },
]

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)

  return { token }
}

export default function CoversIndex({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <div className="mb-4 text-right">
        <Link to="/admin/covers/create" className="btn btn-primary">
          {t('global.new')}
        </Link>
      </div>
    </>
  )
}
