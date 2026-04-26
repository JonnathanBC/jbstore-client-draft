export interface Category {
  id: number;
  name: string;
  family_id?: number;
  family?: {
    name: string;
  };
  created_at?: string | null;
  updated_at?: string | null;
}
