import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import type { ApiResponse } from '~/types/api'
import type { Family } from '~/types/family'

export interface GetFamiliesParams {
  token: string
  page?: number
  per_page?: number
  name?: string
  order?: { updated_at?: 'asc' | 'desc' }
  pagination?: boolean
}

export async function getFamilies({
  token,
  ...params
}: GetFamiliesParams): Promise<ApiResponse<Family>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<Family>>(
      '/api/admin/families',
      {
        params,
      },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

/** Familias para el storefront — endpoint público, sin auth. */
export async function getPublicFamilies(params?: {
  page?: number
  per_page?: number
  pagination?: boolean
}): Promise<ApiResponse<Family>> {
  try {
    const { data } = await apiClient().get<ApiResponse<Family>>(
      '/api/public/families',
      { params },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getFamily(id: number, token: string): Promise<Family> {
  try {
    const { data } = await apiClient(token).get<Family>(
      `/api/admin/families/${id}`,
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createFamily(
  payload: { name: string },
  token: string,
): Promise<Family | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Family>(
      '/api/admin/families',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function updateFamily(
  id: number,
  payload: { name: string },
  token: string,
): Promise<Family | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<Family>(
      `/api/admin/families/${id}`,
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function deleteFamily(
  id: number,
  token: string,
): Promise<void | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete(`/api/admin/families/${id}`)
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
