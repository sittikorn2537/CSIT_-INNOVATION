<script setup lang="ts">
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Autoplay, FreeMode, A11y } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/free-mode'

type Client = { id: string | number; name: string; logo: string; href?: string }

const clients = ref<Client[]>([
  { id: 1,  name: 'Krungthai',        logo: 'https://picsum.photos/seed/ktb/220/120' },
  { id: 2,  name: 'S&P',              logo: 'https://picsum.photos/seed/sandp/220/120' },
  { id: 3,  name: 'Fujikura',         logo: 'https://picsum.photos/seed/fjk/220/120' },
  { id: 4,  name: 'Thai-Danish',      logo: 'https://picsum.photos/seed/td/220/120' },
  { id: 5,  name: 'Energy Ministry',  logo: 'https://picsum.photos/seed/moen/220/120' },
  { id: 6,  name: 'PTT',              logo: 'https://picsum.photos/seed/ptt/220/120' },
  { id: 7,  name: 'SCG',              logo: 'https://picsum.photos/seed/scg/220/120' },
  { id: 8,  name: 'AIS',              logo: 'https://picsum.photos/seed/ais/220/120' },
  { id: 9,  name: 'True',             logo: 'https://picsum.photos/seed/true/220/120' },
  { id: 10, name: 'GMM',              logo: 'https://picsum.photos/seed/gmm/220/120' },
])

// สำหรับ pause autoplay เมื่อ hover
const swiperRef = ref<any>(null)
const onMouseEnter = () => swiperRef.value?.swiper?.autoplay?.stop?.()
const onMouseLeave = () => swiperRef.value?.swiper?.autoplay?.start?.()
</script>

<template>
  <section class="py-12 md:py-16 bg-white">
    <div class="max-w-6xl mx-auto px-4 lg:px-6">
      <!-- Heading -->
      <header class="text-center mb-6">
        <h2 class="text-2xl md:text-3xl font-extrabold text-slate-800">ลูกค้าของเรา</h2>
        <div class="h-1 w-24 bg-green-500 rounded-full mx-auto mt-2" />
      </header>

      <div class="relative">
        <!-- arrows -->
        <button
          class="nav-prev absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:shadow-md">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#0f2c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button
          class="nav-next absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:shadow-md">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#0f2c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <Swiper
          ref="swiperRef"
          :modules="[Navigation, Autoplay, FreeMode, A11y]"
          :navigation="{ prevEl: '.nav-prev', nextEl: '.nav-next' }"
          :loop="true"
          :free-mode="true"
          :autoplay="{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false }"
          :speed="3500"               
          :space-between="18"
          :slides-per-view="2.2"
          :breakpoints="{
            480:  { slidesPerView: 3,   spaceBetween: 20 },
            640:  { slidesPerView: 4,   spaceBetween: 22 },
            1024: { slidesPerView: 5,   spaceBetween: 24 },
            1280: { slidesPerView: 6,   spaceBetween: 24 }
          }"
          class="py-2"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
        >
          <SwiperSlide v-for="c in clients" :key="c.id">
            <div
              class="h-24 sm:h-28 md:h-28 lg:h-28 xl:h-28 w-full rounded-xl
                     bg-white ring-2 ring-green-400/70
                     flex items-center justify-center overflow-hidden">
              <img
                :src="c.logo"
                :alt="c.name"
                class="max-h-[72%] max-w-[90%] object-contain grayscale hover:grayscale-0 transition"
                loading="lazy"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ปรับให้ลูกศรไม่ขยับ layout */
.nav-prev, .nav-next { backdrop-filter: blur(2px); }
</style>