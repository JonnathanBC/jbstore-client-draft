import { createCookie } from 'react-router'
import { mergeCart } from './cart.server'

// Carrito de invitado: sólo IDs y cantidades. Precios y stock los valida
// Laravel en el merge al hacer login, nunca confiamos en lo que venga de acá.
export type GuestCartItem = {
  product_id: number
  quantity: number
  selected_features: Record<string, number>
}

const MAX_ITEMS = 50

const guestCartCookie = createCookie('guest_cart', {
  httpOnly: true,
  sameSite: 'lax',
  secrets: [process.env.SESSION_SECRET as string],
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
})

function isGuestCartItem(value: unknown): value is GuestCartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    Number.isInteger(item.product_id) &&
    Number.isInteger(item.quantity) &&
    typeof item.selected_features === 'object' &&
    item.selected_features !== null
  )
}

export async function getGuestCart(request: Request): Promise<GuestCartItem[]> {
  const value: unknown = await guestCartCookie.parse(
    request.headers.get('Cookie'),
  )
  return Array.isArray(value) ? value.filter(isGuestCartItem) : []
}

function sameVariant(a: GuestCartItem, b: GuestCartItem) {
  const keysA = Object.keys(a.selected_features)
  return (
    a.product_id === b.product_id &&
    keysA.length === Object.keys(b.selected_features).length &&
    keysA.every((k) => a.selected_features[k] === b.selected_features[k])
  )
}

export function addGuestItem(
  items: GuestCartItem[],
  item: GuestCartItem,
): GuestCartItem[] {
  const existing = items.find((it) => sameVariant(it, item))
  if (existing) {
    return items.map((it) =>
      it === existing ? { ...it, quantity: it.quantity + item.quantity } : it,
    )
  }
  return [...items, item].slice(-MAX_ITEMS)
}

export function guestCartCount(items: GuestCartItem[]) {
  return items.reduce((acc, it) => acc + it.quantity, 0)
}

export function commitGuestCart(items: GuestCartItem[]) {
  return guestCartCookie.serialize(items)
}

export function clearGuestCart() {
  return guestCartCookie.serialize([], { maxAge: 0 })
}

/**
 * Fusiona el carrito de invitado con el del usuario recién autenticado.
 * Devuelve el Set-Cookie que borra el guest cart, o null si no había nada
 * o el merge falló (en ese caso la cookie se conserva para reintentar).
 */
export async function mergeGuestCartOnLogin(
  request: Request,
  token: string,
): Promise<string | null> {
  const items = await getGuestCart(request)
  if (items.length === 0) return null

  const result = await mergeCart(items, token)
  if ('error' in result) return null

  return clearGuestCart()
}
