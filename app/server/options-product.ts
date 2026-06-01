import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import { ApiResponse } from '~/types/api'
import { OptionsProduct } from '~/types/options-product'

export interface GetProductsParams {
  token: string
  page?: number
  per_page?: number
  order?: { updated_at?: 'asc' | 'desc' }
  product_id?: number | null
}

export async function getOptionsProduct({
  token,
  ...params
}: GetProductsParams): Promise<ApiResponse<OptionsProduct>> {
  try {
    const { data } = await apiClient(token).get<ApiResponse<OptionsProduct>>(
      '/api/options-product',
      {
        params,
      },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createOptionsProduct(
  payload: OptionsProduct,
  token: string,
): Promise<OptionsProduct | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<OptionsProduct>(
      '/api/options-product',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function deleteFeatureProduct(
  optionId: number,
  featureId: number,
  token: string,
): Promise<{ error: ApiError }> {
  try {
    const { data } = await apiClient(token).post(
      `/api/option-products/remove-features`,
      {
        option_id: optionId,
        feature_id: featureId,
      },
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
