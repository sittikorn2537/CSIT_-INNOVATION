<script setup lang="ts">
import CardsMedia from "../ui-components/cards/CardsMedia.vue";
import { ref, onMounted, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Grid, Pagination, Navigation, Autoplay, A11y } from 'swiper/modules'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
const { $api } = useNuxtApp()

// Swiper styles
import 'swiper/css'
import 'swiper/css/grid'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

type ApiService = {
  id: string | number
  icon?: string
  icon_kind?: 'emoji' | 'iconify' | 'none'
  title_th?: string
  title_en?: string
  description_th?: string
  description_en?: string
  href?: string
  updated_at?: string
  user_created?: number
}
type ServiceView = {
  id: string
  icon?: string
  iconKind: 'emoji' | 'iconify' | 'none'
  title: string
  desc: string
  href: string
}


/** ---------- Services from API ---------- */
const services = ref<ServiceView[]>([])
const loadingServices = ref(false)

const pref = (th?: string, en?: string, lang = locale.value) =>
  lang === 'th' ? (th?.trim() || en?.trim() || '') : (en?.trim() || th?.trim() || '')

const mapService = (s: ApiService): ServiceView => ({
  id: String(s.id),
  icon: s.icon || '',
  iconKind: (s.icon_kind as any) || 'none',
  title: pref(s.title_th, s.title_en),
  desc: pref(s.description_th, s.description_en),
  href: s.href || '#',
})

const fetchServices = async () => {
  loadingServices.value = true
  try {
    // รองรับทั้ง {status,message,data} และ array ตรงๆ
    const res = await $api<any>('/settings/services')
    const arr: ApiService[] = Array.isArray(res) ? res : (res?.data || [])
    services.value = arr.map(mapService)
  } catch (e) {
    console.error('load services failed:', e)
    services.value = []
  } finally {
    loadingServices.value = false
  }
}

onMounted(fetchServices)

const { t, locale } = useI18n()

// เปลี่ยนภาษาแล้วรีเฟรชข้อความ (จะ map ใหม่ด้วย locale ปัจจุบัน)
watch(locale, fetchServices)

/** ---------- Static parts (ของเดิม) ---------- */
type Item = { image: string; title: string; description: string; href: string }
const items: Item[] = [
  {
    image: 'https://picsum.photos/1600/900?random=10',
    title: 'โซลาร์รูฟท็อปเพื่อบ้าน',
    description: 'ประหยัดค่าไฟฟ้าได้มากกว่า ด้วยระบบโซลาร์เซลล์ ประสิทธิภาพสูง คุ้มค่าในระยะยาว ติดตั้งได้ทุกระบบหลังคา',
    href: '#'
  },
  {
    image: 'https://picsum.photos/1600/900?random=10',
    title: 'โซลาร์รูฟท็อปเพื่อธุรกิจ',
    description: 'ลดต้นทุนค่าไฟให้กับธุรกิจคุณ สูงสุดถึง 70% ของค่าไฟในปัจจุบัน คืนทุนไว ใน 3–4 ปี',
    href: '#'
  }
]
type Feature = { icon: string; text: string }
const title = `ทำไมต้องเลือก\nCSIT`
const cta = { text: 'ดูแพ็คเกจโซลาร์เซลล์', to: '/solar-cell-package' }
const { info } = useContactInfo()
const features: Feature[] = [
  {
    icon: info?.value?.logo_url || '/images/logos/logo-dark.png',
    text: t('service.text1')
  },
  {
    icon: info?.value?.logo_url || '/images/logos/logo-dark.png',
    text: t('service.text2')
  },
  {
    icon: info?.value?.logo_url || '/images/logos/logo-dark.png',
    text: t('service.text3')
  },
  {
    icon: info?.value?.logo_url || '/images/logos/logo-dark.png',
    text: t('service.text4')
  },
]
const videoThumb = 'https://csitech.co.th/resources/web/messageImage_1758028731401.jpg'
</script>

<template>
  <div class="container mx-auto max-w-6xl" id="service" style="margin-top: -60px;">
    <v-row>
      <v-col cols="12" sm="12" lg="12">
        <section class="relative overflow-hidden py-10 z-1000">
          <div class="container mx-auto px-4 max-w-6xl">
            <div class="relative">
              <figure class="hidden md:block rounded-xl overflow-hidden shadow ring-1 ring-black/5">
                <img :src="videoThumb" alt="solar" class="w-full h-[260px] md:h-[360px] object-cover" />
              </figure>

              <div class="md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 md:w-[58%] mt-6 md:mt-0">
                <div class="relative bg-[#d80717] text-slate-900 rounded-xl shadow-xl ring-1 ring-black/5 pa-6 md:pa-8">
                  <svg class="hidden md:block absolute right-6 bottom-4 w-40 h-40 text-white/20" viewBox="0 0 24 24"
                    fill="currentColor">
                    <path
                      d="M12 2a7 7 0 0 0-7 7c0 2.9 1.76 5.29 4.26 6.32L9 19h6l-.26-3.68A7 7 0 0 0 19 9a7 7 0 0 0-7-7Zm-1 19h2v1a1 1 0 1 1-2 0v-1Z" />
                  </svg>

                  <p class="font-extrabold tracking-tight text-xl md:text-2xl">
                    {{ $t('company.name') }}
                  </p>
                  <!-- <h3 class="text-xl md:text-2xl font-extrabold leading-snug mt-1">
                    {{ $t('company.title') }}
                  </h3> -->
                  <p class="mt-4 leading-relaxed">
                    {{ $t('company.title') }}
                  </p>

                  <!-- <div class="mt-5">
                    <NuxtLink to="/our-work" class="btn btn-ghost no-underline text-slate-900 hover:bg-slate-900 hover:text-white">
                      {{ $t("work.all") }}
                      <svg viewBox="0 0 24 24" class="w-4 h-4 ml-1" fill="currentColor">
                        <path d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8 8-8z" />
                      </svg>
                    </NuxtLink>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
        </section>
      </v-col>

      <v-col cols="12">
        <section class="relative z-10 py-14 bg-slate-50">
          <div class="container mx-auto max-w-6xl px-4">
            <h2 class="text-3xl lg:text-4xl font-bold text-center mb-8">
              {{ $t('services.title', 'บริการของเรา') }}
            </h2>

            <ClientOnly>
              <Swiper :modules="[Grid, Pagination, Navigation, Autoplay, A11y]" :space-between="16" :loop="false"
                :autoplay="{ delay: 4500, disableOnInteraction: true }" :pagination="{ clickable: true }" 
                :breakpoints="{
                  0: { slidesPerView: 1, grid: { rows: 1, fill: 'row' } },
                  480: { slidesPerView: 1.2, grid: { rows: 2, fill: 'row' } },
                  640: { slidesPerView: 2, grid: { rows: 2, fill: 'row' } },
                  1024: { slidesPerView: 3, grid: { rows: 2, fill: 'row' } }
                }" class="service-swiper !pb-10">
                <SwiperSlide v-for="s in services" :key="s.id">
                  <div
                    class="h-full rounded-2xl bg-white/90 ring-1 ring-slate-200 shadow-sm px-5 py-5 hover:shadow-md hover:bg-white transition">
                    <div class="flex items-start gap-3">
                      <!-- ไอคอน: emoji หรือ iconify -->
                      <div
                        class="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-600 text-xl shrink-0">
                        <template v-if="s.iconKind === 'iconify' && s.icon">
                          <Icon :icon="s.icon" width="20" height="20" />
                        </template>
                        <template v-else>
                          {{ s.icon || '🔧' }}
                        </template>
                      </div>

                      <div class="min-w-0">
                        <h3 class="text-base font-semibold text-slate-900 truncate">
                          {{ s.title }}
                        </h3>
                        <p class="text-sm text-slate-600 mt-1 line-clamp-3">
                          {{ s.desc }}
                        </p>

                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </ClientOnly>
          </div>
        </section>
      </v-col>
    </v-row>
  </div>

  <section class="why-section  w-full bg-gradient-to-r from-sky-500 via-slate-900 to-red-900">
    <div class="mx-auto max-w-6xl px-4 lg:px-6 py-10 md:py-14">
      <div class="grid gap-8 md:gap-10 md:grid-cols-3 items-start">
        <div class="text-white">
          <h2 class="whitespace-pre-line text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            {{ title }}
          </h2>

        </div>

        <div class="md:col-span-2">
          <div class="grid gap-8 md:gap-10 sm:grid-cols-2">
            <div v-for="(f, i) in features" :key="i" class="flex items-start gap-4 text-white/95 animate-in"
              :style="{ animationDelay: (i * 80) + 'ms' }">
              <div class="w-12 h-12 shrink-0 mt-1">
                <img :src="f.icon" alt="" class="w-12 h-12 object-contain" />
              </div>
              <p class="leading-relaxed">
                {{ f.text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>