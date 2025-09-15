// ~/types/work.ts
export interface WorkItem {
  id: number | string
  title_th: string
  title_en?: string
  image_url?: string
  image_file?: File | null | undefined
    description?: string
  categories?: string
  updated_at?: string
}