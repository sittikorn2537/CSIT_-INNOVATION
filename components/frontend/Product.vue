<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Grid } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/grid'

type ApiProduct = {
  id: number | string
  categories_id?: number | string
  name_th?: string
  name_en?: string
  product_name_th?: string
  product_name_en?: string
  product_image_url?: string
  product_link?: string
  price?: string
  sales_price?: string
  rating?: string
  updated_at?: string
}

type UiProduct = {
  id: number | string
  name: string
  image: string
  price: number
  unit?: string
  href?: string
}

const { locale } = useI18n()
const { $api } = useNuxtApp()

const loading = ref(false)
const errorMsg = ref<string | null>(null)
const raw = ref<ApiProduct[]>([])

// ดึงข้อมูลจาก API
const fetchProducts = async () => {
  loading.value = true
  errorMsg.value = null
  try {
    const res = await $api<{ status: boolean; data?: ApiProduct[]; message?: string }>('/settings/products')
    raw.value = Array.isArray(res?.data) ? res.data : []
  } catch (e: any) {
    errorMsg.value = e?.message || 'Fetch failed'
    raw.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducts)

// map → UI ตามภาษา
const mapped = computed<UiProduct[]>(() => {
  const isTH = (locale.value || '').toLowerCase().startsWith('th')
  return raw.value.map((p) => {
    const name =
      (isTH ? p.product_name_th : p.product_name_en) ||
      (isTH ? p.name_th : p.name_en) ||
      p.product_name_th ||
      p.product_name_en ||
      '—'
    const priceStr = (p.sales_price && p.sales_price !== '0.00' ? p.sales_price : p.price) || '0'
    const price = Number.parseFloat(String(priceStr)) || 0
    return {
      id: p.id,
      name,
      image: p.product_image_url || '',
      price,
      href: p.product_link || '#',
    }
  })
})

// ให้เปลี่ยนภาษาแล้วรายการอัปเดตทันที
watch(locale, () => {
  /* mapped เป็น computed อยู่แล้ว ไม่ต้องทำอะไรเพิ่ม */
})

const fmtTHB = (n: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2,
  }).format(n)
</script>

<template>
  <main class="py-12 md:py-16">
    <div class="max-w-6xl mx-auto px-4 lg:px-6">
      <!-- Heading -->
      <header class="text-center">
        <h2 class="text-3xl md:text-5xl font-extrabold text-slate-800">{{ $t('nav.products') }}</h2>
        <p class="mt-2 text-slate-500">{{ $t('product.description') }}</p>
      </header>

      <!-- Loading / Error / Empty -->
      <div class="mt-8 md:mt-10" v-if="loading">
        <div class="flex justify-center py-10">
          <v-progress-circular indeterminate color="primary" />
        </div>
      </div>
      <div class="mt-8 md:mt-10 text-center text-rose-600" v-else-if="errorMsg">
        {{ errorMsg }}
      </div>
      <div class="mt-8 md:mt-10 text-center text-slate-500" v-else-if="mapped.length === 0">
        {{ $t('common.empty') }}
      </div>

      <!-- Carousel -->
      <div class="relative mt-8 md:mt-10" v-else>
        <!-- arrows -->
        <button
          class="nav-prev absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:shadow-md"
          aria-label="Prev"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#0f2c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button
          class="nav-next absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:shadow-md"
          aria-label="Next"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#0f2c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <!-- ใช้ Grid: rows = 2 -->
        <Swiper
          :modules="[Navigation, Grid]"
          :navigation="{ prevEl: '.nav-prev', nextEl: '.nav-next' }"
          :space-between="24"
          :slides-per-view="2"
          :grid="{ rows: 2, fill: 'row' }"
          :breakpoints="{
            640:  { slidesPerView: 2, grid: { rows: 2 } },
            1024: { slidesPerView: 4, grid: { rows: 2 } }
          }"
          class="pb-6"
        >
          <SwiperSlide v-for="p in mapped" :key="p.id" class="pb-4">
            <NuxtLink
              :to="'product/'+p.id || '#'"
              class="group flex flex-col bg-white rounded-xl shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-sky-200 transition overflow-hidden h-full"
            >
              <!-- รูป -->
              <div class="aspect-[4/3] bg-slate-50 grid place-items-center">
                <img
                  :src="p.image"
                  :alt="p.name"
                  class="max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>

              <!-- เนื้อหา -->
              <div class="flex flex-col flex-1 card-pad justify-between">
                <h3 class="text-slate-800 font-semibold leading-snug line-clamp-2 min-h-[3.5rem]">
                  {{ p.name }} 
                </h3>
                <div v-if="p.price!=0.00" class="mt-4">
                  <span class="text-orange-500 font-extrabold text-lg">{{ fmtTHB(p.price) }}</span>
                </div>
              </div>
            </NuxtLink>
          </SwiperSlide>
        </Swiper>
      </div>

      <!-- CTA -->
      <div class="mt-8 text-center" v-if="mapped.length">
        <NuxtLink
          to="/product"
          class="inline-flex items-center gap-2 rounded-full px-6 py-2.5 border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 transition"
        >
          {{ $t('product.all') }}
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
:deep(.swiper-slide:first-child .group) {
  box-shadow: 0 8px 22px rgba(2, 132, 199, .10);
  outline: 2px solid rgba(2, 132, 199, .15);
  outline-offset: -2px;
}
.card-pad { padding: 1.25rem !important; }
:deep(.swiper-slide) { box-sizing: border-box; }
</style>