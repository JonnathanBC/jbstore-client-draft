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
    plate_number: string
  }
  status: ShippingStatusEnum
  updated_at: string
}
