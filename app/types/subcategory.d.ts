import { Family } from "./family";

export interface SubCategory {
  id: number;
  name: string;
  category_id?: number;
  category?: {
    id: number;
    name: string;
    family: Family
  };
  created_at?: string | null;
  updated_at?: string | null;
}
