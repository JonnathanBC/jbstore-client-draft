import {
  requireAdminMiddleware,
  requireSessionUser,
} from '~/server/auth.context.server'
import { getDrivers } from '~/server/drivers.server'
import { Route } from './+types/resources.drivers'

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token } = requireSessionUser(context)

  const drivers = await getDrivers({
    token,
    page: 1,
    per_page: 100,
  })

  return {
    items: drivers.data.map((d) => ({
      value: String(d.id),
      label: `${d.user.first_name} ${d.user.last_name} (${d.license_plate})`,
    })),
  }
}

// Las resource routes no cuelgan del layout admin: llevan su propio guard
export const middleware: Route.MiddlewareFunction[] = [requireAdminMiddleware]
