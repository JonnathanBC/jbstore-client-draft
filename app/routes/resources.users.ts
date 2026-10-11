import {
  requireAdminMiddleware,
  requireSessionUser,
} from '~/server/auth.context.server'
import { getUsers } from '~/server/user.server'
import { Route } from './+types/resources.users'

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token } = requireSessionUser(context)
  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? undefined

  const users = await getUsers({ token, search })

  return {
    items: users.map((u) => ({
      value: String(u.id),
      label: [u.name, u.last_name].filter(Boolean).join(' ') + ` (${u.email})`,
    })),
  }
}

// Las resource routes no cuelgan del layout admin: llevan su propio guard
export const middleware: Route.MiddlewareFunction[] = [requireAdminMiddleware]
