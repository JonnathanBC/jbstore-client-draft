import { getFamilies } from '~/server/api.server'
import {
  requireAdminMiddleware,
  requireSessionUser,
} from '~/server/auth.context.server'
import { Route } from './+types/resources.families'

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token } = requireSessionUser(context)
  const families = await getFamilies({
    token,
    page: 1,
    pagination: false,
  })

  return {
    items: families?.data?.map((f) => ({
      value: String(f.id),
      label: f.name,
    })),
  }
}

// Las resource routes no cuelgan del layout admin: llevan su propio guard
export const middleware: Route.MiddlewareFunction[] = [requireAdminMiddleware]
