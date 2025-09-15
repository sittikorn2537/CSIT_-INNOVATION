<script setup lang="ts">
import { ref, computed } from "vue"
import { Swiper, SwiperSlide } from "swiper/vue"
import { Navigation, Pagination, A11y } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

type Item = {
  id: number
  src: string
  category: "ทั้งหมด" | "บ้าน" | "ธุรกิจ" | "สำนักงาน" | "โรงงาน" | "ฟาร์มเลี้ยงสัตว์"
}

const data: Item[] = [
  { id: 1, src: "https://picsum.photos/800/600?random=21", category: "บ้าน" },
  { id: 2, src: "https://picsum.photos/800/600?random=22", category: "บ้าน" },
  { id: 3, src: "https://picsum.photos/800/600?random=23", category: "สำนักงาน" },
  { id: 4, src: "https://picsum.photos/800/600?random=24", category: "ธุรกิจ" },
  { id: 5, src: "https://picsum.photos/800/600?random=25", category: "โรงงาน" },
  { id: 6, src: "https://picsum.photos/800/600?random=26", category: "บ้าน" }
]

const categories = computed(() => {
  const set = new Set<string>()
  set.add("ทั้งหมด")
  data.forEach(item => set.add(item.category))
  return Array.from(set)
})

const activeCat = ref("ทั้งหมด")

const filtered = computed(() =>
  activeCat.value === "ทั้งหมด"
    ? data
    : data.filter(i => i.category === activeCat.value)
)
</script>

<template>
  <section class="py-12 md:py-16 bg-slate-50">
    <div class="max-w-6xl mx-auto px-4 lg:px-6 text-center">
      <!-- หัวข้อ -->
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800">
        {{ $t("nav.works") }}
      </h2>
      <p class="text-base text-slate-600 mt-3 mb-6 max-w-3xl mx-auto">
        {{ $t("work.description") }}
      </p>

      <!-- ปุ่มเลือกหมวด -->
      <div class="mb-8 flex flex-wrap justify-center gap-3">
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

      <!-- Swiper แถวเดียว -->
      <Swiper
        :modules="[Navigation, Pagination, A11y]"
        :slides-per-view="1.2"
        :space-between="16"
        navigation
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