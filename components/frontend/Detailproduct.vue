<!-- pages/product/[id].vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { ProductItem } from '~/types/product'



type ApiProduct = ProductItem

const route = useRoute()
const { locale } = useI18n()
const { $api } = useNuxtApp()



const showZoom = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const p = ref<ApiProduct | null>(null)

// เงิน THB
const fmtTHB = (v?: string) => {
    const n = v ? Number.parseFloat(v) : NaN
    if (!Number.isFinite(n)) return '-'
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 }).format(n)
}

// ดึงสินค้าตาม id จากพารามิเตอร์
const fetchProduct = async () => {
    loading.value = true
    error.value = null
    try {
        const id = route.params.id
        if (!id) throw new Error('missing id')

        const res = await $api<{ status: boolean; data: ApiProduct }>(`/settings/products/${id}`)
        p.value = res?.data ?? null
    } catch (e: any) {
        error.value = e?.message || 'failed'
    } finally {
        loading.value = false
    }
}
await fetchProduct()

// ชื่อสินค้าตามภาษา
const productName = computed(() => {
    if (!p.value) return ''
    return locale.value === 'en'
        ? (p.value.product_name_en || p.value.product_name_th || '')
        : (p.value.product_name_th || p.value.product_name_en || '')
})

// ชื่อหมวดหมู่ตามภาษา
const categoryName = computed(() => {
    if (!p.value) return ''
    return locale.value === 'en'
        ? (p.value.name_en || p.value.name_th || '')
        : (p.value.name_th || p.value.name_en || '')
})

const description = computed(() => {
    if (!p.value) return ''
    return locale.value === 'en'
        ? (p.value.description_en || p.value.description_th || '')
        : (p.value.description_th || p.value.description_en || '')
})

// ราคา (รองรับราคาพิเศษ)
const displayPrice = computed(() => {
    if (p.value?.price == '0.00') {
        return '';
    }
    fmtTHB(p.value?.sales_price || p.value?.price)
})
const displayCompare = computed(() => {
    const price = Number.parseFloat(p.value?.price || '')
    const sale = Number.parseFloat(p.value?.sales_price || '')
    if (Number.isFinite(price) && Number.isFinite(sale) && sale < price) {
        return fmtTHB(p.value?.price)
    }
    return ''
})

// ภาพ
const imageMain = computed(() => p.value?.product_image_url || '')
</script>

<template>
    <div>
        <!-- Hero title -->
        <div
            class="text-center why-section w-full bg-gradient-to-r from-sky-500 via-slate-900 to-red-900 text-white py-10">
            <h1 class="text-3xl md:text-4xl font-extrabold">
                {{ productName || '-' }}
            </h1>
        </div>

        <main class="bg-slate-50">
            <div class="container mx-auto max-w-6xl px-4 py-10">
                <div v-if="loading" class="py-10 text-center text-slate-500">
                    {{ $t('common.loading') || 'Loading...' }}
                </div>
                <div v-else-if="error" class="py-10 text-center text-red-600">
                    {{ error }}
                </div>

                <div v-else-if="p" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <!-- ซ้าย: รูปสินค้า -->
                    <div class="lg:col-span-2 sm:col-span-2">
                        <div class="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden relative">
                            <img :src="imageMain" :alt="productName" class="w-full aspect-[4/3] object-contain" />
                            <!-- <button
                                class="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full bg-white/90 text-slate-700 shadow-md"
                                @click="showZoom = true" aria-label="Zoom" title="Zoom">
                                🔍
                            </button> -->
                        </div>
                    </div>

                    <!-- ขวา: รายละเอียด -->
                    <div class="lg:col-span-2 sm:col-span-2 flex flex-col justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-slate-900">
                                {{ $t('product.detail') }}
                            </h2>

                            <div class="mt-4 space-y-2 text-slate-700 leading-7">
                                <p>
                                    {{description}}
                                </p>
                                <p v-if="categoryName">
                                    <b> {{ $t('product.category') }}</b> {{ categoryName }}
                                </p>

                                <p v-if="p.rating && p.rating != '0.00'"><b> {{ $t('product.rating') }}</b> {{ p.rating }}</p>
                                <p v-if="p.updated_at" class="text-slate-500 text-sm">
                                    {{ new Date(p.updated_at).toLocaleString() }}
                                </p>
                            </div>

                            <div class="mt-6">
                                <div class="flex items-baseline gap-3">
                                    <div v-if="displayPrice "  class="text-3xl font-extrabold text-orange-500">
                                        {{ displayPrice }}
                                    </div>
                                    <div v-if="displayCompare" class="text-slate-400 line-through">
                                        {{ displayCompare }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ปุ่มอื่น ๆ (ถ้าต้องการ) -->
                        <!-- <div class="mt-6 flex flex-wrap gap-3"> ... </div> -->
                    </div>
                </div>
            </div>
        </main>

        <!-- Lightbox Modal -->
        <dialog v-if="showZoom" class="modal" open>
            <div class="modal-box relative max-w-5xl p-0 bg-transparent shadow-none">
                <button
                    class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 text-slate-700 shadow-md hover:bg-white transition"
                    @click="showZoom = false" aria-label="Close" title="Close">
                    ✕
                </button>

                <img :src="imageMain" :alt="productName"
                    class="max-h-screen w-auto mx-auto object-contain rounded-lg" />
            </div>

            <form method="dialog" class="modal-backdrop">
                <button @click="showZoom = false">close</button>
            </form>
        </dialog>
    </div>
</template>
