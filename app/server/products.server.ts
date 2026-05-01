import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import type { ApiResponse } from '~/types/api'
import { Product } from '~/types/product'

export interface GetProductsParams {
  token: string
  page?: number
  per_page?: number
  order?: { updated_at?: 'asc' | 'desc' }
}

export async function getProducts({
  token,
  ...params
}: GetProductsParams): Promise<ApiResponse<Product>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<Product>>(
      '/api/products',
      {
        params,
      },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getProduct(id: number, token: string): Promise<Product> {
  try {
    const { data } = await apiClient(token).get<Product>(`/api/products/${id}`)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createProduct(
  payload: FormData,
  token: string,
): Promise<Product | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Product>(
      '/api/products',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function updateProduct(
  id: number,
  payload: { name: string },
  token: string,
): Promise<Product | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<Product>(
      `/api/products/${id}`,
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function deleteProduct(
  id: number,
  token: string,
): Promise<{ error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete(`/api/products/${id}`)
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
