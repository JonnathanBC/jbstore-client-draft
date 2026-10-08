export interface Driver {
  id: number
  user_id: number
  type: 'car' | 'motorcycle'
  license_plate: string
  created_at: string
  updated_at: string
}

export type DriverPayload = Pick<Driver, 'type' | 'license_plate'> & {
  user_id: number | string
}
