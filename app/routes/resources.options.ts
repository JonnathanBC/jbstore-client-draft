import {
  requireAdminMiddleware,
  requireSessionUser,
} from '~/server/auth.context.server'
import { getOptions } from '~/server/options.server'
import { Route } from './+types/resources.categories'

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token } = requireSessionUser(context)

  const options = await getOptions({
    token,
    page: 1,
    per_page: 10,
  })

  return {
    items: options.data.map((f) => ({
      value: String(f.id),
      label: f.name,
    })),
  }
}

// Las resource routes no cuelgan del layout admin: llevan su propio guard
export const middleware: Route.MiddlewareFunction[] = [requireAdminMiddleware]
