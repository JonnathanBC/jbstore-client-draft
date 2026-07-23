import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import type { ApiResponse } from '~/types/api'
import type { SubCategory } from '~/types/subcategory'
import type { Product } from '~/types/product'

export interface GetPublicSubcategoryProductsParams {
  page?: number
  per_page?: number
  orderBy?: 'relevant' | 'major_to_minor' | 'minor_to_major'
  search?: string
}

export interface PublicSubcategoryProducts {
  subcategory: SubCategory
  products: ApiResponse<Product>
}

export async function getPublicSubcategoryProducts(
  id: number,
  params: GetPublicSubcategoryProductsParams = {},
): Promise<PublicSubcategoryProducts> {
  try {
    const { data } = await apiClient().get<PublicSubcategoryProducts>(
      `/api/public/subcategories/${id}`,
      { params },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export interface GetSubCategoriesParams {
  token: string
  page?: number
  per_page?: number
  name?: string
  order?: { updated_at?: 'asc' | 'desc' }
  category_id?: string
}

export async function getSubCategories({
  token,
  ...params
}: GetSubCategoriesParams): Promise<ApiResponse<SubCategory>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<SubCategory>>(
      '/api/admin/subcategories',
      {
        params,
      },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getSubCategory(
  id: number,
  token: string,
): Promise<SubCategory> {
  try {
    const { data } = await apiClient(token).get<SubCategory>(
      `/api/admin/subcategories/${id}`,
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createSubCategory(
  payload: { name: string; category_id: number },
  token: string,
): Promise<SubCategory | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<SubCategory>(
      '/api/admin/subcategories',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function updateSubCategory(
  id: number,
  payload: { name: string; category_id: number },
  token: string,
): Promise<SubCategory | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<SubCategory>(
      `/api/admin/subcategories/${id}`,
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function deleteSubCategory(
  id: number,
  token: string,
): Promise<{ error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete(`/api/admin/subcategories/${id}`)
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
