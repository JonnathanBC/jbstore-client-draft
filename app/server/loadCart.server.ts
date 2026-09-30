import { getCart, type Cart } from './cart.server'
import { getGuestCart } from './guestCart.server'
import { getPublicProductsByIds } from './products.server'

/**
 * Carrito unificado: con token lo trae de Laravel; sin token lo arma desde la
 * cookie guest + los productos públicos. Siempre devuelve la misma forma (Cart).
 * Vive en su propio módulo para no crear un import circular cart ↔ guestCart.
 */
export async function loadCart(
  request: Request,
  token?: string,
): Promise<Cart> {
  if (!token) return loadGuestCart(request)

  const cart = await getCart(token)
  if ('error' in cart) {
    throw new Response(cart.error.message, { status: cart.error.status })
  }

  return cart
}

async function loadGuestCart(request: Request): Promise<Cart> {
  const guestItems = await getGuestCart(request)
  const products = await getPublicProductsByIds([
    ...new Set(guestItems.map((item) => item.product_id)),
  ]).catch(() => [])
  const productsById = new Map(products.map((product) => [product.id, product]))

  const items = guestItems.flatMap((item, index) => {
    const product = productsById.get(item.product_id)
    if (!product) return []

    return [
      {
        rowId: String(index),
        id: product.id,
        name: product.name,
        qty: item.quantity,
        price: product.price,
        options: { image: product.image, sku: '', features: [] },
        tax: 0,
        isSaved: false,
        subtotal: product.price * item.quantity,
      },
    ]
  })

  return {
    items,
    count: items.reduce((total, item) => total + item.qty, 0),
    subtotal: items
      .reduce((total, item) => total + item.subtotal, 0)
      .toFixed(2),
  }
}
