import { apiClient, toApiError } from '~/lib/apiClient'
import { ApiResponse } from '~/types/api'
import { Option } from '~/types/option'

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
