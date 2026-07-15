import { Link } from 'react-router'
import { requireAuth } from '~/server/auth.server'
import { t } from '~/i18n'
import type { RouteHandle } from '~/types/route'
import { Route } from './+types/admin.products._index'
import { CoverForm } from '~/covers/CoverForm'
import { FormProvider } from '~/components/form/FormProvider'

export const handle: RouteHandle = {
  breadcrumb: [
    { label: t('admin.covers'), to: '/admin/covers' },
    { label: t('global.new') },
  ],
}

export const meta: Route.MetaFunction = () => [
  { title: `${t('global.new')} ${t('admin.covers')} | JB Store` },
]

export async function action({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)

  return { token }
}

export default function CoversCreate({ actionData }: Route.ComponentProps) {
  return (
    <FormProvider>
      <CoverForm />
    </FormProvider>
  )
}
