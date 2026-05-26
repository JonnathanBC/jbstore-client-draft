import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import type { ProductVariant } from '~/types/variant'

export async function createVariant(
  payload: { product_id: number; option_id: number; value: string },
  token: string,
): Promise<ProductVariant | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<ProductVariant>(
      '/api/variants',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
