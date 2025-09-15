
export interface SlideItem {
  id: number | string
  eyebrow?: string
  title_th: string
  title_en?: string
  subtitle_th?: string
  subtitle_en?: string
  src: string
  ctaText_th?: string
  ctaText_en?: string
  ctaTo?: string
  updated_at?: string
}

export interface CU_SlideItem {
  id: number | string
  eyebrow?: string
  title_th: string
  title_en?: string
  subtitle_th?: string
  subtitle_en?: string
  src: File
  ctaText_th?: string
  ctaText_en?: string
  ctaTo?: string
  updated_at?: string
}