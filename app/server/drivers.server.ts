import { apiClient, ApiError, toApiError } from '~/lib/apiClient'
import { ApiResponse } from '~/types/api'
import { Driver, DriverPayload } from '~/types/driver'

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

export async function createDriver(
  payload: DriverPayload,
  token: string,
): Promise<Driver | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Driver>(
      '/api/admin/drivers',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function updateDriver(
  id: number,
  payload: DriverPayload,
  token: string,
): Promise<Driver | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<Driver>(
      `/api/admin/drivers/${id}`,
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
