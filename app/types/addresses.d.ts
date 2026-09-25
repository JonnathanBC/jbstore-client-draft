export type AddressInput = {
  type: 'shipping' | 'billing'
  address_line_1: string
  address_line_2: string
  city: string
  province: string
  postal_code: string
  country: string
  reference: string
  phone: string
  is_default: boolean | null
}

export type Address = AddressInput & {
  id: number
  created_at: string
  updated_at: string
}
