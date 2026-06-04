interface Variant {
  id: number
  sku: string
  image: string
  product_id: number
  features: {
    id: number
    description: string
  }[]
}
