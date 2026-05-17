import { Feature } from './feature'

export interface Option {
  id: number
  name: string
  type: number
  features: Feature[]

  created_at: string
  updated_at: string
}

export interface CreateOption {
  name: string
  type: number
  features: { value: string; description: string }[]
}
