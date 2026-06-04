import { apiClient, toApiError } from '~/lib/apiClient'

export async function getVariant(
  productId: number,
  variantId: number,
  token: string,
): Promise<Variant> {
  try {
    const { data } = await apiClient(token).get<Variant>(
      `/api/products/${productId}/variants/${variantId}`,
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
