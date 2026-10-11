import type { Route } from './+types/resources.orders.$orderId.ticket'

import { requireAdmin } from '~/server/auth.server'
import { downloadOrderTicket } from '~/server/orders.server'

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAdmin(request)

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
