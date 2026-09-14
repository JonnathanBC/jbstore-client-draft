import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'

export type CartItem = {
  rowId: string
  id: number
  name: string
  qty: number
  price: number
  options: { image: string; sku: string; features: unknown[] }
  subtotal: number
}

export type Cart = {
  items: CartItem[]
  count: number
  subtotal: string
}

export async function addToCart(
  payload: { product_id: number; quantity: number },
  token: string,
): Promise<{ data: Cart } | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Cart>(
      '/api/cart/items',
      payload,
    )
    return { data }
  } catch (err) {
    return { error: toApiError(err) }
  }
}
