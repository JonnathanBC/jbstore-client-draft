import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import { Feature } from '~/types/feature'

export async function createFeature(
  payload: { value: string; description: string; option_id: number },
  token: string,
): Promise<Feature | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Feature>(
      '/api/features',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
