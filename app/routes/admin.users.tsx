import { useSearchParams } from 'react-router'
import { Table } from '~/components/Table'
import { renderDateTime } from '~/components/table/renders'
import { t } from '~/i18n'
import { requireSessionUser } from '~/server/auth.context.server'
import { getUsers } from '~/server/user.server'
import type { User } from '~/types/user'
import type { RouteHandle } from '~/types/route'
import type { Route } from './+types/admin.users'

export const handle: RouteHandle = { breadcrumb: t('admin.users') }

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.users')} | JB Store` },
]

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token } = requireSessionUser(context)
  const searchParams = new URL(request.url).searchParams

  const users = await getUsers({
    token,
    page: Number(searchParams.get('page') ?? 1),
    per_page: Number(searchParams.get('per_page') ?? 10),
    order: { created_at: 'desc' },
  })

  return { users }
}

export async function action() {
  return null
}

const columns = [
  { title: 'ID', dataIndex: 'id' as const },
  { title: 'Nombre', dataIndex: 'name' as const },
  { title: 'Apellido', dataIndex: 'last_name' as const },
  { title: 'Correo', dataIndex: 'email' as const },
  {
    title: 'Rol',
    render: (user: User) =>
      user.role === 'ROLE_ADMIN' ? 'Administrador' : 'Usuario',
  },
  {
    title: 'Fecha de creación',
    render: (user: User) => renderDateTime(user.created_at),
  },
]

export default function AdminUsersRoute({ loaderData }: Route.ComponentProps) {
  const { users } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  return (
    <Table<User>
      dataSource={users.data}
      columns={columns}
      meta={users}
      onPageChange={handlePageChange}
    />
  )
}
