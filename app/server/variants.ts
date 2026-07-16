import { apiClient, ApiError, toApiError } from '~/lib/apiClient'

export async function getVariant(
  productId: number,
  variantId: number,
  token: string,
): Promise<Variant> {
  try {
    const { data } = await apiClient(token).get<Variant>(
      `/api/admin/products/${productId}/variants/${variantId}`,
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updateVariant(
  productId: number,
  variantId: number,
  payload: FormData,
  token: string,
): Promise<Variant | { error: ApiError }> {
  try {
    // PHP only parses multipart bodies on POST, so a real PUT would arrive
    // empty. The caller appends _method=PUT and Laravel routes it to Route::put.
    const { data } = await apiClient(token).post<Variant>(
      `/api/admin/products/${productId}/variants/${variantId}`,
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
