export type OrderStatusEnum =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'refunded'

export interface OrderTable {
  id: number
  created_at: string
  status: OrderStatusEnum
  content: unknown[]
  total: number
  pdf_path?: string
}

export interface Order {
  id: number
  created_at: string
  status: OrderStatusEnum
  content: unknown[]
  total: number
  pdf_path?: string
}
