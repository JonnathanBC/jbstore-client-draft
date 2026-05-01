export interface Product {
  id: number
  sku: number
  name: string
  price: number
  subcategory_id: number
  created_at: string
  updated_at: string
  description?: string
  image_path?: string
}
