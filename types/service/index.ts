// /types/service.ts

export interface ServiceItem {
  id: number | string
  title_th: string
  title_en?: string
  icon?: string            // iconify name หรือ อีโมจิ
  icon_kind?: 'iconify' | 'emoji' | 'none'
  description_th?: string
  description_en?: string
  user_created?: number
  updated_at?: string
}