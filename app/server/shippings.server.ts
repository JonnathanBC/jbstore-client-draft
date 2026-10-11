import { apiClient, ApiError, toApiError } from '~/lib/apiClient'
import { ApiResponse } from '~/types/api'
import { Shipping, ShippingStatusEnum } from '~/types/shippings'

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

export async function updateShippingStatus({
  token,
  shippingId,
  status,
}: {
  token: string
  shippingId: number
  status: ShippingStatusEnum
}): Promise<Shipping | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<Shipping>(
      `/api/admin/shippings/${shippingId}/status`,
      { status },
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
