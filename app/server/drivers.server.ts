import { apiClient, toApiError } from '~/lib/apiClient'
import { ApiResponse } from '~/types/api'
import { Driver } from '~/types/driver'

export interface GetDriversParams {
  token: string
  page?: number
  per_page?: number
  order?: { updated_at?: 'asc' | 'desc' }
}

export async function getDrivers({
  token,
  ...params
}: GetDriversParams): Promise<ApiResponse<Driver>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<Driver>>(
      '/api/admin/drivers',
      {
        params,
      },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
