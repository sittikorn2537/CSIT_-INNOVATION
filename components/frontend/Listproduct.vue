<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type ApiProduct = {
  id: number | string
  categories_id?: number | string
  name_th?: string        // ชื่อหมวดหมู่ (TH)
  name_en?: string        // ชื่อหมวดหมู่ (EN)
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
  compareAt?: number
  href?: string
  category: string       // มาจาก name_th/name_en ตามภาษา
}

const { $api } = useNuxtApp()
const { locale } = useI18n()

/* ---------- state ---------- */
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const raw = ref<ApiProduct[]>([])

/* ---------- fetch ---------- */
const fetchAll = async () => {
  loading.value = true
  errorMsg.value = null
  try {
    const res = await $api<{ status: boolean; message?: string; data?: ApiProduct[] }>('/settings/products')
    raw.value = Array.isArray(res?.data) ? res.data! : []
  } catch (e: any) {
    errorMsg.value = e?.message || 'Fetch failed'
    raw.value = []
  } finally {
    loading.value = false
  }
}
onMounted(fetchAll)

/* ---------- map → UI ---------- */
const mapped = computed<UiProduct[]>(() => {
  const isTH = (locale.value || '').toLowerCase().startsWith('th')
  return raw.value.map((p) => {
    const name =
      (isTH ? p.product_name_th : p.product_name_en) ||
      p.product_name_th || p.product_name_en || '—'

    const cat =
      (isTH ? p.name_th : p.name_en) ||
      p.name_th || p.name_en || '—'

    const sale = p.sales_price && p.sales_price !== '0.00' ? p.sales_price : p.price
    const price = Number.parseFloat(String(sale ?? '0')) || 0
    const compareAt = p.sales_price && p.sales_price !== '0.00'
      ? Number.parseFloat(String(p.price ?? '0')) || undefined
      : undefined

    return {
      id: p.id,
      name,
      image: p.product_image_url || '',
      price,
      compareAt,
      href: p.product_link || ('/product/' + p.id),
      category: cat,
    }
  })
})

/* ---------- categories (ตาม name_th/name_en) ---------- */
const categories = computed(() => {
  const set = new Set<string>()
  set.add('ทั้งหมด')
  for (const p of mapped.value) set.add(p.category || '—')
  return Array.from(set)
})
const activeCat = ref('ทั้งหมด')
watch(locale, () => { activeCat.value = 'ทั้งหมด' }) // เปลี่ยนภาษาให้รีเซ็ตหมวด

/* ---------- filter by category ---------- */
const filtered = computed(() => {
  if (activeCat.value === 'ทั้งหมด') return mapped.value
  return mapped.value.filter(p => p.category === activeCat.value)
})

/* ---------- pagination ---------- */
const pageSize = 8
const page = ref(1)
const total = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const products = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})
watch([filtered], () => { page.value = 1 }) // เปลี่ยนหมวดรีเซ็ตหน้า

const next = () => (page.value = Math.min(page.value + 1, total.value))
const prev = () => (page.value = Math.max(page.value - 1, 1))

/* ---------- util ---------- */
const thb = (n: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2
  }).format(n)
</script>

<template>
  <div class="text-center why-section w-full bg-gradient-to-r from-sky-500 via-slate-900 to-red-900 text-white py-10">
    <h1 class="text-3xl md:text-4xl font-extrabold">{{ $t('nav.products') }}</h1>
    <!-- <p class="mt-1 max-w-4xl ma-auto">{{ $t('product.description') }}</p> -->
  </div>

  <div class="container mx-auto max-w-6xl px-4 py-10">
    <!-- Filters -->
    <div class="mb-6 flex flex-wrap justify-center gap-3">
      <button
        v-for="c in categories"
        :key="c"
        class="px-4 py-2 rounded-full text-sm font-semibold transition ring-1"
        :class="activeCat === c
          ? 'bg-white text-slate-900 ring-slate-300 shadow-sm'
          : 'bg-slate-100/70 text-slate-500 ring-slate-200 hover:text-slate-800 hover:bg-white'"
        @click="activeCat = c"
      >
        {{ c }}
      </button>
    </div>

    <!-- Loading / Error / Empty -->
    <div v-if="loading" class="py-16 text-center">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <div v-else-if="errorMsg" class="py-10 text-center text-rose-600">
      {{ errorMsg }}
    </div>
    <div v-else-if="mapped.length === 0" class="py-10 text-center text-slate-500">
      {{ $t('common.empty') }}
    </div>

    <!-- Grid -->
    <div v-else class="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
      <article
        v-for="p in products"
        :key="p.id"
        class="group card rounded-xl ring-1 ring-slate-200 hover:ring-sky-200 shadow-sm hover:shadow-md transition overflow-hidden h-full"
      >
        <NuxtLink :to="('/product/' + p.id)" class="block h-full">
          <div class="flex flex-col h-full">
            <!-- รูป -->
            <div class="relative bg-slate-50">
              <div class="aspect-[4/3] grid place-items-center">
                <img
                  :src="p.image"
                  :alt="p.name"
                  class="max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
            </div>

            <!-- เนื้อหา -->
            <div class="flex flex-col flex-1 pa-5">
              <h3 class="text-slate-800 font-semibold leading-snug min-h-[3.5rem]">
                {{ p.name }}
              </h3>

              <div class="mt-3">
                <div v-if="p.price!=0.00" class="flex items-baseline gap-2">
                  <span class="text-red-500 font-extrabold text-lg">{{ thb(p.price) }}</span>
                </div>
                <div v-if="p.compareAt && p.compareAt > p.price" class="text-slate-400 text-sm line-through">
                  {{ thb(p.compareAt) }}
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </article>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && products.length" class="mt-8 flex items-center justify-center gap-3">
      <button
        class="px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        :disabled="page <= 1"
        @click="prev"
      >
        {{ $t('common.prev') }}
      </button>
      <span class="text-slate-600 text-sm">
        {{ page }} / {{ total }}
      </span>
      <button
        class="px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        :disabled="page >= total"
        @click="next"
      >
        {{ $t('common.next') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.card { background-color: #fff; }
</style>