import { Option } from './option'

export interface Product {
  id: number
  sku: number
  name: string
  price: number
  stock: number
  subcategory_id: number
  options?: Option[]

  category: {
    id: number
    name: string
    family: {
      id: number
      name: string
    }
  }

  variants: {
    id: number
    sku: string
    image: string
    features: {
      id: number
      description: string
    }[]
  }[]
  created_at: string
  updated_at: string
  description?: string
  /** Raw storage path — use `image` for rendering. */
  image_path?: string
  /** Accessor: full public URL, appended by the model. */
  image?: string
}
