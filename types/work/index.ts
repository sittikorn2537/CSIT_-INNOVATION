// ~/types/work.ts
export interface WorkItem {
  id: number | string
  title_th: string
  title_en?: string
  image_url?: string
  image?: File | null | undefined
  description?: string
  categories_id?: string
  categories_th?: string
  categories_en?: string
  updated_at?: string
}