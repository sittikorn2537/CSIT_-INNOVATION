export type Category = {
  id: string
  name_th: string
  name_en: string
  description?: string        // ✅ ทำให้เป็น optional
  created_at?: string
  updated_at?: string
}