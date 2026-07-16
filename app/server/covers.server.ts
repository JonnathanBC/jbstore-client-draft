import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import { ApiResponse } from '~/types/api'
import type { Cover } from '~/types/cover'

export interface GetCoversParams {
  token: string
  page?: number
  per_page?: number
  order?: { updated_at?: 'asc' | 'desc'; order?: 'asc' | 'desc' }
}

export async function getCovers({
  token,
  ...params
}: GetCoversParams): Promise<ApiResponse<Cover>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<Cover>>(
      '/api/admin/covers',
      {
        params,
      },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getCover(id: number, token: string): Promise<Cover> {
  try {
    const { data } = await apiClient(token).get<Cover>(
      `/api/admin/covers/${id}`,
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

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

export async function deleteCover(
  id: number,
  token: string,
): Promise<void | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete(`/api/admin/covers/${id}`)
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function reorderCovers(
  ids: number[],
  token: string,
): Promise<void | { error: ApiError }> {
  try {
    await apiClient(token).post('/api/admin/covers/reorder', { ids })
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function updateCover(
  id: number,
  payload: FormData,
  token: string,
): Promise<Cover | { error: ApiError }> {
  // PHP only parses multipart bodies on POST, so a real PUT would arrive empty.
  payload.append('_method', 'PUT')

  try {
    const { data } = await apiClient(token).post<Cover>(
      `/api/admin/covers/${id}`,
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
