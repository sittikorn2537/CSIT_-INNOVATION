<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Autoplay, FreeMode, A11y } from 'swiper/modules'
import { useI18n } from 'vue-i18n'
const { $api } = useNuxtApp()

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/free-mode'

type ApiClient = {
  id: number | string
  name_th?: string
  name_en?: string
  logo_url?: string
  website_url?: string
  is_active?: number | boolean
  updated_at?: string
}
type Client = { id: string; name: string; logo: string; href?: string }

const { locale } = useI18n()
const clients = ref<Client[]>([])
const swiperInst = ref<any>(null)

const onSwiper = (swiper: any) => { swiperInst.value = swiper }
const onMouseEnter = () => swiperInst.value?.autoplay?.stop?.()
const onMouseLeave = () => swiperInst.value?.autoplay?.start?.()

const localizeName = (c: ApiClient) => {
  const th = (c.name_th || '').trim()
  const en = (c.name_en || '').trim()
  return locale.value === 'th' ? (th || en || '') : (en || th || '')
}
const normalizeUrl = (u?: string) => (u ? (u.startsWith('//') ? 'https:' + u : u) : '')

const loadClients = async () => {
  try {
    const res = await $api<any>('/settings/clients')
    const list: ApiClient[] = Array.isArray(res) ? res : (res?.data || [])
    clients.value = list
      .filter(c => c.is_active === 1 || c.is_active === true)
      .map(c => ({
        id: String(c.id),
        name: localizeName(c),
        logo: normalizeUrl(c.logo_url) || '',
        href: c.website_url || undefined
      }))
    // ถ้ามีอินสแตนซ์แล้ว ให้ update size/loop ทันที
    setTimeout(() => {
      swiperInst.value?.update?.()
      swiperInst.value?.autoplay?.start?.()
    }, 0)
  } catch (e) {
    console.error('load /settings/clients failed', e)
    clients.value = []
  }
}

onMounted(loadClients)
watch(locale, loadClients)
</script>

<template>
  <section class="py-12 md:py-16 bg-white">
    <div class="max-w-6xl mx-auto px-4 lg:px-6">
      <header class="text-center mb-6">
        <h2 class="text-2xl md:text-3xl font-extrabold text-slate-800">
          {{ $t('clients.title', 'ลูกค้าของเรา') }}
        </h2>
        <div class="h-1 w-24 bg-green-500 rounded-full mx-auto mt-2" />
      </header>

      <div class="relative">
        <button class="nav-prev absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:shadow-md">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#0f2c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button class="nav-next absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:shadow-md">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#0f2c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <!-- ✅ หุ้ม ClientOnly + v-if เพื่อให้ autoplay ทำงานหลัง mount -->
        <ClientOnly>
          <Swiper
            v-if="clients.length"
            :modules="[Navigation, Autoplay, FreeMode, A11y]"
            @swiper="onSwiper"
            :navigation="{ prevEl: '.nav-prev', nextEl: '.nav-next' }"
            :loop="true"
            :free-mode="{ enabled: true, momentum: false }"
            :autoplay="{ delay: 1, disableOnInteraction: false, pauseOnMouseEnter: false }"
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
              <NuxtLink :to="c.href || '#'" :target="c.href ? '_blank' : undefined" class="block no-underline">
                <div class="h-24 sm:h-28 md:h-28 lg:h-28 xl:h-28 w-full rounded-xl bg-white ring-2 ring-green-400/70 flex items-center justify-center overflow-hidden">
                  <img
                    :src="c.logo"
                    :alt="c.name"
                    class="max-h-[72%] max-w-[90%] object-contain transition"
                    loading="lazy"
                  />
                </div>
              </NuxtLink>
            </SwiperSlide>
          </Swiper>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nav-prev, .nav-next { backdrop-filter: blur(2px); }
</style>