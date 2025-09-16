export interface ContactInfo {
  logo_url?: string
  company_th?: string
  company_en?: string
  address_th?: string
  address_en?: string
  email?: string
  phone_main?: string
  phone_alt?: string
  contact_person?: string
  line_id?: string
  wechat?: string
  facebook?: string
  facebook_name?: string
  website_url?: string
}

export type ApiResponse<T> = { status: boolean; message?: string; data?: T }