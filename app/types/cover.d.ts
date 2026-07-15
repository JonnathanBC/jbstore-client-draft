export interface Cover {
  id: number
  title: string
  /** Raw storage path — use `image` for rendering. */
  image_path: string
  /** Accessor: full public URL, appended by the model. */
  image: string
  is_active: boolean
  order: number
  start_at: string
  end_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}
