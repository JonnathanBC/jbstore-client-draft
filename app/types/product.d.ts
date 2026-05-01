export interface Product {
  id: number
  sku: number
  name: string
  price: number
  subcategory_id: number
  subcategory: {
    id: number
    name: string
    category: {
      id: number
      name: string
      family_id: number
      family: {
        id: number
        name: string
      }
    }
  }
  created_at: string
  updated_at: string
  description?: string
  image_path?: string
}
