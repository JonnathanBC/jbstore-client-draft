import type { Route } from './+types/resources.orders.$orderId.ticket'

import {
  requireAdminMiddleware,
  requireSessionUser,
} from '~/server/auth.context.server'
import { downloadOrderTicket } from '~/server/orders.server'

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { token } = requireSessionUser(context)

  const pdf = await downloadOrderTicket({
    token,
    orderId: params.orderId,
  })

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${params.orderId}.pdf"`,
    },
  })
}

// Las resource routes no cuelgan del layout admin: llevan su propio guard
export const middleware: Route.MiddlewareFunction[] = [requireAdminMiddleware]
