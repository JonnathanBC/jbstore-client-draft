import { Feature } from './feature'

export interface Option {
  id: number
  name: string
  type: number
  features: Feature[]

  created_at: string
  updated_at: string
}
