import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import { ApiResponse } from '~/types/api'
import { Feature } from '~/types/feature'

export interface GetFeaturesParams {
  token: string
  page?: number
  per_page?: number
  option_id?: string | null
  order?: { updated_at?: 'asc' | 'desc' }
}

export async function getFeatures({
  token,
  ...params
}: GetFeaturesParams): Promise<ApiResponse<Feature>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<Feature>>(
      '/api/admin/features',
      {
        params,
      },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createFeature(
  payload: { value: string; description: string; option_id: number },
  token: string,
): Promise<Feature | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Feature>(
      '/api/admin/features',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function deleteFeature(
  id: number,
  token: string,
): Promise<void | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete(`/api/admin/features/${id}`)
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
