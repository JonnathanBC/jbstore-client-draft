import { apiClient, ApiError, toApiError } from '~/lib/apiClient'
import { ApiResponse } from '~/types/api'
import { Order, OrderStatusEnum } from '~/types/orders'
import { Shipping } from '~/types/shippings'

export interface GetShippingsParams {
  token: string
  page?: number
  per_page?: number
  order?: { updated_at?: 'asc' | 'desc' }
}

export async function getShippings({
  token,
  ...params
}: GetShippingsParams): Promise<ApiResponse<Shipping>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<Shipping>>(
      '/api/admin/shippings',
      {
        params,
      },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
