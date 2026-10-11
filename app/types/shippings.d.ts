export type ShippingStatusEnum = 'pending' | 'completed' | 'failed'

export interface Shipping {
  id: number
  driver_id: number
  order_id: number
  driver: {
    user: {
      id: number
      first_name: string
      last_name: string
    }
    license_plate: string
  }
  status: ShippingStatusEnum
  refunded_at: string
  delivered_at: string
  updated_at: string
  _actions: unknown
}
