<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { Swiper, SwiperSlide } from "swiper/vue"
import { Navigation, Pagination, A11y } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

type ApiWork = {
  id: number | string
  categories_id?: number | string
  categories_th?: string
  categories_en?: string
  title_th?: string
  title_en?: string
  image_url?: string
  description?: string
  updated_at?: string
}

type Item = {
  id: number
  src: string
  category: string
}

const { $api } = useNuxtApp()
const { locale } = useI18n()

const raw = ref<ApiWork[]>([])
const activeCat = ref("ทั้งหมด") // ค่าเริ่มต้นภาษาไทย

const normalizeUrl = (u?: string) => (u ? (u.startsWith("//") ? "https:" + u : u) : "")

const items = computed<Item[]>(() =>
  raw.value.map(w => ({
    id: Number(w.id),
    src: normalizeUrl(w.image_url),
    category: locale.value === "th"
      ? (w.categories_th || "ทั้งหมด")
      : (w.categories_en || "All")
  }))
)

const categories = computed(() => {
  const set = new Set<string>()
  // label "ทั้งหมด/All" ตาม locale
  set.add(locale.value === "th" ? "ทั้งหมด" : "All")
  items.value.forEach(i => set.add(i.category || (locale.value === "th" ? "ทั้งหมด" : "All")))
  return Array.from(set)
})

const filtered = computed(() => {
  const allLabel = locale.value === "th" ? "ทั้งหมด" : "All"
  return activeCat.value === allLabel ? items.value : items.value.filter(i => i.category === activeCat.value)
})

const loadWorks = async () => {
  try {
    const res = await $api<any>('/settings/works')
    raw.value = Array.isArray(res) ? res : (res?.data || [])
    // ถ้า activeCat เดิมไม่ตรงกับ locale ให้รีเซ็ตเป็น All/ทั้งหมด
    const allLabel = locale.value === "th" ? "ทั้งหมด" : "All"
    if (!categories.value.includes(activeCat.value)) activeCat.value = allLabel
  } catch (e) {
    console.error('load /settings/works failed', e)
    raw.value = []
  }
}

onMounted(loadWorks)
watch(locale, loadWorks)
</script>

<template>
  <section class="py-12 md:py-16 bg-slate-50">
    <div class="max-w-6xl mx-auto px-4 lg:px-6 text-center">
      <!-- หัวข้อ -->
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800">
        {{ $t("nav.works") }}
      </h2>
      <!-- <p class="text-base text-slate-600 mt-3 mb-6 max-w-3xl mx-auto">
        {{ $t("work.description") }}
      </p> -->

      <!-- ปุ่มเลือกหมวด -->
      <div class="mb-8 flex flex-wrap justify-center gap-3 mt-5">
        <button
          v-for="c in categories"
          :key="c"
          class="px-4 py-2 rounded-full text-sm font-semibold transition ring-1"
          :class="
            activeCat === c
              ? 'bg-white text-slate-900 ring-slate-300 shadow-sm'
              : 'bg-slate-100/70 text-slate-500 ring-slate-200 hover:text-slate-800 hover:bg-white'
          "
          @click="activeCat = c"
        >
          {{ c }}
        </button>
      </div>

      <!-- Swiper แถวเดียว (คงดีไซน์เดิม) -->
      <Swiper
        :modules="[Navigation, Pagination, A11y]"
        :slides-per-view="1.2"
        :space-between="16"
        
        :pagination="{ clickable: true }"
        :breakpoints="{
          640: { slidesPerView: 2.2, spaceBetween: 20 },
          1024: { slidesPerView: 3.2, spaceBetween: 24 }
        }"
        class="!pb-10"
      >
        <SwiperSlide
          v-for="it in filtered"
          :key="it.id"
          class="rounded-lg overflow-hidden shadow-sm bg-white"
        >
          <img :src="it.src" :alt="it.category" class="w-full h-64 object-cover" />
        </SwiperSlide>
      </Swiper>

      <!-- ปุ่มดูทั้งหมด -->
      <NuxtLink
        to="/our-work"
        class="mt-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 transition"
      >
        {{ $t("work.all") }}
      </NuxtLink>
    </div>
  </section>
</template>