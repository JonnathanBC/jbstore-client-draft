export interface OptionsProduct {
  product_id: number
  option_id: number
  features: { id: string; value: string; description: string }[]
}
