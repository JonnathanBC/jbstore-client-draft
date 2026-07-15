import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import type { Cover } from '~/types/cover'

export async function createCover(
  payload: FormData,
  token: string,
): Promise<Cover | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Cover>(
      '/api/admin/covers',
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
