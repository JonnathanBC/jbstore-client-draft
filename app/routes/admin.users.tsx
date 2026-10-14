import type { ColumnDef } from '@tanstack/react-table'
import { renderDateTime } from '~/components/table/renders'
import { t } from '~/i18n'
import { requireSessionUser } from '~/server/auth.context.server'
import { getUsers } from '~/server/user.server'
import type { User } from '~/types/user'
import type { RouteHandle } from '~/types/route'
import type { Route } from './+types/admin.users'
import { DataTable } from '~/components/DataTable'

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
    search: searchParams.get('search') ?? undefined,
    order: { created_at: 'desc' },
  })

  return { users }
}

export async function action() {
  return null
}

const columns: ColumnDef<User>[] = [
  { header: 'ID', accessorKey: 'id' },
  { header: 'Nombre', accessorKey: 'name' },
  { header: 'Apellido', accessorKey: 'last_name' },
  { header: 'Correo', accessorKey: 'email' },
  {
    header: 'Rol',
    accessorKey: 'role',
    cell: ({ row }) =>
      row.original.role === 'ROLE_ADMIN' ? 'Administrador' : 'Usuario',
  },
  {
    header: 'Fecha de creación',
    accessorKey: 'created_at',
    cell: ({ row }) => renderDateTime(row.original.created_at),
  },
]

export default function AdminUsersRoute({ loaderData }: Route.ComponentProps) {
  const { users } = loaderData

  return (
    <DataTable
      data={users.data}
      columns={columns}
      meta={users}
      searchPlaceholder="Buscar por id, nombre, apellido, email"
    />
  )
}
