import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import { OptionProduct } from '~/types/option-product'

export async function createOptionsProduct(
  payload: OptionProduct,
  token: string,
): Promise<OptionProduct | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<OptionProduct>(
      '/api/options-product',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
