<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'

// core styles + โมดูลที่ใช้
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/a11y'

// เลือกโมดูลที่ต้องใช้
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules'

type Slide = {
  src: string
  eyebrow?: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaTo?: string
}

const slides: Slide[] = [
  {
    src: 'https://picsum.photos/1600/900?random=11',
    eyebrow: 'SOLAR ROOF',
    title: 'โซลาร์รูฟ บ้าน/ธุรกิจ',
    subtitle: 'ออกแบบ ติดตั้ง และรับประกัน โดยทีมวิศวกร',
    ctaText: 'ดูแพ็กเกจ', ctaTo: '/category/package'
  },
  {
    src: 'https://picsum.photos/1600/900?random=12',
    eyebrow: 'SHOP',
    title: 'อุปกรณ์โซลาร์เซลล์ ครบวงจร',
    subtitle: 'อินเวอร์เตอร์ แบตเตอรี่ แผง พร้อมส่ง',
    ctaText: 'เข้าร้านค้า', ctaTo: '/shop'
  },
  {
    src: 'https://picsum.photos/1600/900?random=13',
    eyebrow: 'PORTFOLIO',
    title: 'ผลงานติดตั้งทั่วไทย',
    subtitle: 'มาตรฐาน วสท. พร้อมบริการหลังการขาย',
    ctaText: 'ดูผลงาน', ctaTo: '/our-work'
  }
]
</script>

<template>
  <section class="relative w-full">
    <Swiper
      :modules="[Navigation, Pagination, Autoplay, A11y]"
      :slides-per-view="1"
      :loop="true"
      :speed="700"
      :autoplay="{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }"
      navigation
      :pagination="{ clickable: true }"
      class="w-full h-[70vh] lg:h-[120vh]"
    >
      <SwiperSlide v-for="(s, i) in slides" :key="i">
        <div class="relative w-full h-full">
          <!-- ภาพ -->
          <img :src="s.src" class="w-full h-full object-cover" alt="" />
          <!-- ไล่เฉด -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />

          <!-- ข้อความ + CTA -->
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
/* ------- Text animations (stagger) ------- */
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

/* Optional: ซ่อนลูกศรบนมือถือ */
@media (max-width: 767px) {
  :deep(.swiper-button-prev),
  :deep(.swiper-button-next) { display: none; }
}
</style>