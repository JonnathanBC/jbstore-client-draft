export type OrderStatusEnum =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'refunded'

/** Foto del item del carrito al momento de comprar (Cart::content() de Laravel). */
export interface OrderItem {
  rowId: string
  id: number
  name: string
  qty: number
  price: number
  subtotal: string
  options: { image?: string; sku?: string }
}

export interface Order {
  id: string
  created_at: string
  status: OrderStatusEnum
  // Objeto indexado por rowId, NO un array
  content: Record<string, OrderItem>
  total: number
  pdf_path?: string
}
