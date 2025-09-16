export interface ProductItem {
    id: number | string
    categories_id: number | string
    name_th?: string
    name_en?: string
    product_name_th: string
    product_name_en?: string
    product_image_url?: string
    product_link?: string
    description_th?: string
    description_en?: string
    price?: string
    sales_price?: string
    rating?: string
    updated_at?: string
}