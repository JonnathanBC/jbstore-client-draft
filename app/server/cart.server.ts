import { apiClient, toApiError, type ApiError } from '~/lib/apiClient'
import type { GuestCartItem } from './guestCart.server'

export type CartItem = {
  rowId: string
  id: number
  name: string
  qty: number
  price: number
  options: { image: string; sku: string; features: unknown[] }
  tax: number | string
  isSaved: boolean
  subtotal: number
}

export type Cart = {
  items: CartItem[]
  count: number
  subtotal: string
}

// Sólo el carrito de Laravel trae envío y total; el de invitado no los conoce.
export type UserCart = Cart & {
  shipping: string
  total: string
}

export async function addToCart(
  payload: {
    product_id: number
    quantity: number
    selected_features: Record<string, number>
  },
  token: string,
): Promise<Cart | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Cart>(
      '/api/cart/items',
      payload,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function getCart(
  token: string,
): Promise<UserCart | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).get<UserCart>('/api/cart/items')
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function getCartCount(
  token: string,
): Promise<{ count: number } | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).get<{ count: number }>(
      '/api/cart/count',
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function mergeCart(
  items: GuestCartItem[],
  token: string,
): Promise<Cart | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).post<Cart>('/api/cart/merge', {
      items,
    })
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export type CartOperation = 'increase' | 'decrease'

export async function updateCart(
  rowId: string,
  operation: CartOperation,
  token: string,
): Promise<{ item: CartItem | null } | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).patch<{ item: CartItem | null }>(
      `/api/cart/items/${encodeURIComponent(rowId)}`,
      { operation },
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function removeFromCart(
  rowId: string,
  token: string,
): Promise<Cart | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete<Cart>(
      `/api/cart/items/${encodeURIComponent(rowId)}`,
    )
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}

export async function clearCart(
  token: string,
): Promise<Cart | { error: ApiError }> {
  try {
    const { data } = await apiClient(token).delete<Cart>('/api/cart/items')
    return data
  } catch (err) {
    return { error: toApiError(err) }
  }
}
