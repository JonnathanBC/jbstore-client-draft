import { Family } from './family'

export interface SubCategory {
  id: number
  name: string
  category_id: number
  created_at: string
  updated_at: string
  category: {
    id: number
    name: string
    family_id: number
    created_at: string
    updated_at: string
  }
}
