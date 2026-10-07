import { apiClient, ApiError, toApiError } from '~/lib/apiClient'
import { ApiResponse } from '~/types/api'
import { Order, OrderStatusEnum } from '~/types/orders'

export interface GetOrdersParams {
  token: string
  page?: number
  per_page?: number
  order?: { created_at?: 'asc' | 'desc' }
}

export async function getOrders({
  token,
  ...params
}: GetOrdersParams): Promise<ApiResponse<Order>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<Order>>(
      '/api/admin/orders',
      {
        params,
      },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function downloadOrderTicket({
  token,
  orderId,
}: {
  token: string
  orderId: string
}) {
  try {
    const { data } = await apiClient(token).get<ArrayBuffer>(
      `/api/admin/orders/${orderId}/ticket/download`,
      { responseType: 'arraybuffer', headers: { Accept: 'application/pdf' } },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updateOrderStatus({
  token,
  orderId,
  status,
}: {
  token: string
  orderId: string
  status: OrderStatusEnum
}): Promise<Order | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<Order>(
      `/api/admin/orders/${orderId}/status`,
      { status },
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
