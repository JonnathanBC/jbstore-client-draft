import { apiClient, ApiError, toApiError } from '~/lib/apiClient'
import { ApiResponse } from '~/types/api'
import { CreateOption, Option } from '~/types/option'

export interface GetOptionsParams {
  token: string
  page?: number
  per_page?: number
  order?: { updated_at?: 'asc' | 'desc' }
}

export async function getOptions({
  token,
  ...params
}: GetOptionsParams): Promise<ApiResponse<Option>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<Option>>(
      '/api/options',
      {
        params,
      },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createOption(
  payload: CreateOption,
  token: string,
): Promise<Option | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Option>(
      '/api/options',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function updateOption(
  id: number,
  payload: FormData,
  token: string,
): Promise<Option | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<Option>(
      `/api/options/${id}`,
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function deleteOption(
  id: number,
  token: string,
): Promise<void | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete(`/api/options/${id}`)
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
