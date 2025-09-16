<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/a11y'
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules'
import { useI18n } from 'vue-i18n'

type ApiSlide = {
  id: number | string
  eyebrow?: string
  title_th?: string
  title_en?: string
  subtitle_th?: string
  subtitle_en?: string
  src: string
  ctaText_th?: string
  ctaText_en?: string
  ctaTo?: string
  updated_at?: string
}

type Slide = {
  id: number | string
  src: string
  eyebrow?: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaTo?: string
  updated_at?: string
}

const { locale } = useI18n()   // ✅ ดึง locale ปัจจุบัน (th / en)

const slides = ref<Slide[]>([])
const loading = ref(false)
const { $api } = useNuxtApp()

const prefer = (th?: string, en?: string, l: string = 'th') => {
  return l === 'th'
    ? (th?.trim() || en?.trim() || '')
    : (en?.trim() || th?.trim() || '')
}

const normalizeUrl = (u?: string) => {
  if (!u) return ''
  return u.startsWith('//') ? `https:${u}` : u
}

const fetchSlides = async () => {
  loading.value = true
  try {
    const res = await $api<{ status: boolean; data: ApiSlide[] }>('/settings/slides')
    const raw = Array.isArray(res?.data) ? res.data : []
    slides.value = raw.map((s): Slide => ({
      id: s.id,
      src: normalizeUrl(s.src),
      eyebrow: s.eyebrow,
      title: prefer(s.title_th, s.title_en, locale.value),
      subtitle: prefer(s.subtitle_th, s.subtitle_en, locale.value),
      ctaText: prefer(s.ctaText_th, s.ctaText_en, locale.value),
      ctaTo: s.ctaTo,
      updated_at: s.updated_at
    }))
  } catch (e) {
    console.error('โหลดสไลด์ล้มเหลว:', e)
    slides.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchSlides)
watch(locale, fetchSlides)   // ✅ รีโหลดสไลด์เมื่อเปลี่ยนภาษา
</script>

<template>
  <section class="relative w-full">
    <Swiper
      :modules="[Navigation, Pagination, Autoplay, A11y]"
      :slides-per-view="1"
      :loop="true"
      :speed="700"
      :autoplay="{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }"
      
      :pagination="{ clickable: true }"
      class="w-full h-[70vh] lg:h-[120vh]"
    >
      <!-- Loading -->
      <SwiperSlide v-if="loading">
        <div class="flex items-center justify-center w-full h-full text-white">
          กำลังโหลด...
        </div>
      </SwiperSlide>

      <!-- Slides -->
      <SwiperSlide v-for="s in slides" :key="s.id">
        <div class="relative w-full h-full">
          <!-- ภาพ -->
          <img :src="s.src" class="w-full h-full object-cover" alt="" />
          <!-- ไล่เฉด -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />

          <!-- ข้อความ + CTA (เหมือนเดิมเป๊ะ) -->
          <div class="absolute inset-0 flex items-center">
            <div class="max-w-6xl mx-auto w-full px-6">
              <div class="text-white max-w-xl hero-anim">
                <p v-if="s.eyebrow" class="eyebrow">{{ s.eyebrow }}</p>
                <h2 class="title">{{ s.title }}</h2>
                <p v-if="s.subtitle" class="subtitle">{{ s.subtitle }}</p>
                <div class="actions">
                  <NuxtLink
                    v-if="s.ctaText"
                    :to="s.ctaTo || '#'"
                    class="btn btn-primary rounded-full px-6 shadow-lg"
                  >
                    {{ s.ctaText }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<style scoped>
.hero-anim { --d: .08s; }
.hero-anim > * { opacity: 0; transform: translateY(16px); }
.swiper-slide-active .hero-anim > * {
  animation: fadeUp .6s cubic-bezier(.22,.61,.36,1) both;
}
.hero-anim .eyebrow { animation-delay: calc(var(--d) * 1); letter-spacing: .25em; font-size: .8rem; opacity: .9; }
.hero-anim .title   { animation-delay: calc(var(--d) * 2); font-weight: 800; font-size: clamp(1.8rem, 4vw, 3.2rem); line-height: 1.12; text-shadow: 0 1px 2px rgba(0,0,0,.3); }
.hero-anim .subtitle{ animation-delay: calc(var(--d) * 3); font-size: clamp(1rem, 1.6vw, 1.25rem); opacity: .95; margin-top: .75rem; }
.hero-anim .actions { animation-delay: calc(var(--d) * 4); margin-top: 1.1rem; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px) scale(.995); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}

@media (max-width: 767px) {
  :deep(.swiper-button-prev),
  :deep(.swiper-button-next) { display: none; }
}
</style>