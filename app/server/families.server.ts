import { apiClient, toApiError } from '~/lib/apiClient'
import { ApiResource, ApiResponse } from '~/types/api'
import { Family } from '~/types/family'
import { Option } from '~/types/option'
import { Product } from '~/types/product'

export async function getPublicFamily(id: number): Promise<Family> {
  try {
    const { data } = await apiClient().get<ApiResource<Family>>(
      `/api/public/families/${id}`,
    )
    return data.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getPublicFamilyOptions(id: number): Promise<Option[]> {
  try {
    const { data } = await apiClient().get<ApiResource<Option[]>>(
      `/api/public/families/${id}/options`,
    )
    return data.data
  } catch (err) {
    throw toApiError(err)
  }
}

export interface GetPublicFamilyProductsParams {
  features?: number[]
  page?: number
  per_page?: number
  orderBy?: 'relevant' | 'major_to_minor' | 'minor_to_major'
}

export async function getPublicFamilyProducts(
  id: number,
  params: GetPublicFamilyProductsParams = {},
): Promise<ApiResponse<Product>> {
  try {
    const { data } = await apiClient().get<ApiResponse<Product>>(
      `/api/public/families/${id}/products`,
      { params },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
