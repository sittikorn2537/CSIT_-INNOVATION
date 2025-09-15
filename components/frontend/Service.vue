<script setup lang="ts">
import CardsMedia from "../ui-components/cards/CardsMedia.vue";
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Grid, Pagination, Navigation, Autoplay, A11y } from 'swiper/modules'

// styles ของ Swiper
import 'swiper/css'
import 'swiper/css/grid'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// ตัวอย่างข้อมูล mock
type Service = {
    id: string
    icon: string     // จะใช้ emoji / url รูปเล็ก / icon-font ก็ได้
    title: string
    desc: string
    href: string
}

const services = ref<Service[]>([
    {
        id: 's1',
        icon: '🧩',
        title: 'ระบบเว็บไซต์คุณภาพสูง',
        desc: 'ดีไซน์+โค้ดให้คลีนเร็ว รองรับทั้งคอนเทนต์และ SEO ใช้งานง่าย',
        href: '#'
    },
    {
        id: 's2',
        icon: '🧑🏻‍💻',
        title: 'รับทำเว็บไซต์ และการตลาดออนไลน์',
        desc: 'ออกแบบให้โดนใจพร้อมทำแคมเปญออนไลน์เพื่อเพิ่มยอดขาย',
        href: '#'
    },
    {
        id: 's3',
        icon: '🔎',
        title: 'บริการ Google Ads',
        desc: 'ยิงแอดให้ตรงกลุ่ม เพิ่มโอกาสการมองเห็นและยอดขาย',
        href: '#'
    },
    {
        id: 's4',
        icon: '📈',
        title: 'บริการ SEO',
        desc: 'ทำอันดับให้ดีขึ้นบน Google อย่างยั่งยืน',
        href: '#'
    },
    {
        id: 's5',
        icon: '💬',
        title: 'บริการ LINE Official Account',
        desc: 'บริหาร LINE OA ให้คุ้มค่า ทั้งบรอดแคสต์และแชตบอท',
        href: '#'
    },
    {
        id: 's6',
        icon: '🧰',
        title: 'บริการ Google Workspace',
        desc: 'อีเมลธุรกิจและเครื่องมือองค์กร เพื่อการทำงานร่วมกันอย่างมีประสิทธิภาพ',
        href: '#'
    },
    {
        id: 's5',
        icon: '💬',
        title: 'บริการ LINE Official Account',
        desc: 'บริหาร LINE OA ให้คุ้มค่า ทั้งบรอดแคสต์และแชตบอท',
        href: '#'
    },
    {
        id: 's6',
        icon: '🧰',
        title: 'บริการ Google Workspace',
        desc: 'อีเมลธุรกิจและเครื่องมือองค์กร เพื่อการทำงานร่วมกันอย่างมีประสิทธิภาพ',
        href: '#'
    }
])

type Item = {
    image: string
    title: string
    description: string
    href: string
}
const items: Item[] = [
    {
        image: 'https://picsum.photos/1600/900?random=10', // ใส่รูปจริงของคุณ
        title: 'โซลาร์รูฟท็อปเพื่อบ้าน',
        description:
            'ประหยัดค่าไฟฟ้าได้มากกว่า ด้วยระบบโซลาร์เซลล์ ประสิทธิภาพสูง คุ้มค่าในระยะยาว ติดตั้งได้ทุกระบบหลังคา',
        href: '#'
    },
    {
        image: 'https://picsum.photos/1600/900?random=10',
        title: 'โซลาร์รูฟท็อปเพื่อธุรกิจ',
        description:
            'ลดต้นทุนค่าไฟให้กับธุรกิจคุณ สูงสุดถึง 70% ของค่าไฟในปัจจุบัน คืนทุนไว ใน 3–4 ปี',
        href: '#'
    }
]
type Feature = {
    icon: string
    text: string
}

const title = `ทำไมต้องเลือก\nSOLARWORKS`
const cta = { text: 'ดูแพ็คเกจโซลาร์เซลล์', to: '/solar-cell-package' }

// ใส่รูปไอคอนจริงของคุณได้ทันที (ใช้ของเว็บตัวอย่างไว้ก่อน)
const features: Feature[] = [
    {
        icon: '/images/logos/logo-dark.png',
        text:
            'เราเป็นผู้เชี่ยวชาญในการออกแบบระบบโซลาร์เซลล์ ทั้งระบบออนกริดและไฮบริด โดยยึดความเหมาะสม ในการใช้งานของลูกค้าเป็นหลัก'
    },
    {
        icon: '/images/logos/logo-dark.png',
        text:
            'เรามีทีมบริการหลังการขาย ที่คอยรับฟัง และแก้ปัญหา พร้อมดูแล บำรุงรักษา ระบบให้อยู่กับคุณไปตลอด 25 ปี'
    },
    {
        icon: '/images/logos/logo-dark.png',
        text:
            'เรามีความยืดหยุ่นในรับฟังความต้องการของลูกค้า เพื่อให้ลูกค้าได้ใช้ประโยชน์ จากระบบสูงสุด'
    },
    {
        icon: '/images/logos/logo-dark.png',
        text:
            'เราพัฒนาทีมวิศวกรและช่างติดตั้งอย่างต่อเนื่อง เพื่อนำเอาเทคโนโลยีใหม่ๆ มาปรับใช้ในการทำงาน'
    }
]

const videoThumb =
    'https://picsum.photos/1600/900?random=10'
</script>

<template>
    <div class="container mx-auto  max-w-6xl " id="service" style="margin-top: -60px;">
        <v-row>
            <v-col cols="12" sm="12" lg="12">
                <section class="relative overflow-hidden py-10 z-1000">
                    <!-- แถบภาพพื้นหลัง (ซ้าย) -->
                    <div class="container mx-auto px-4 max-w-6xl">
                        <div class="relative">
                            <!-- รูป/วิดีโอ -->
                            <figure class="rounded-xl overflow-hidden shadow ring-1 ring-black/5">
                                <img :src="videoThumb" alt="solar" class="w-full h-[260px] md:h-[360px] object-cover" />
                            </figure>


                            <!-- แผงข้อความสีส้ม (ขวา) -->
                            <div class="md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 md:w-[58%] mt-6 md:mt-0">
                                <div
                                    class="relative bg-[#d80717] text-slate-900 rounded-xl shadow-xl ring-1 ring-black/5 pa-6 md:pa-8">
                                    <!-- ลายน้ำไอคอนเบา ๆ -->
                                    <svg class="hidden md:block absolute right-6 bottom-4 w-40 h-40 text-white/20"
                                        viewBox="0 0 24 24" fill="currentColor">
                                        <path
                                            d="M12 2a7 7 0 0 0-7 7c0 2.9 1.76 5.29 4.26 6.32L9 19h6l-.26-3.68A7 7 0 0 0 19 9a7 7 0 0 0-7-7Zm-1 19h2v1a1 1 0 1 1-2 0v-1Z" />
                                    </svg>

                                    <p class="font-extrabold tracking-tight text-xl md:text-2xl">
                                        {{ $t('company.name') }}
                                    </p>
                                    <h3 class="text-2xl md:text-3xl font-extrabold leading-snug mt-1">
                                        {{ $t('company.title') }}
                                    </h3>

                                    <p class="mt-4 leading-relaxed">
                                        {{ $t('company.description') }}
                                    </p>

                                    <div class="mt-5">
                                        <NuxtLink to="/our-work"
                                            class="btn btn-ghost no-underline text-slate-900 hover:bg-slate-900 hover:text-white">
                                            {{ $t("work.all") }}
                                            <svg viewBox="0 0 24 24" class="w-4 h-4 ml-1" fill="currentColor">
                                                <path d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8 8-8z" />
                                            </svg>
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </v-col>
            <v-col cols="12">
                <section class="relative z-10 py-14 bg-slate-50">
                    <div class="container mx-auto max-w-6xl px-4">
                        <h2 class="text-3xl lg:text-4xl font-bold text-center mb-8">บริการของเรา</h2>

                        <ClientOnly>
                            <Swiper :modules="[Grid, Pagination, Navigation, Autoplay, A11y]" :space-between="16"
                                :loop="false" :autoplay="{ delay: 4500, disableOnInteraction: true }"
                                :pagination="{ clickable: true }" navigation :breakpoints="{
                                    0: { slidesPerView: 1, grid: { rows: 1, fill: 'row' } },
                                    480: { slidesPerView: 1.2, grid: { rows: 2, fill: 'row' } },
                                    640: { slidesPerView: 2, grid: { rows: 2, fill: 'row' } },
                                    1024: { slidesPerView: 3, grid: { rows: 2, fill: 'row' } }
                                }" class="service-swiper !pb-10">
                                <SwiperSlide v-for="s in services" :key="s.id">
                                    <div class="h-full rounded-2xl bg-white/90 ring-1 ring-slate-200 shadow-sm px-5 py-5
                     hover:shadow-md hover:bg-white transition">
                                        <div class="flex items-start gap-3">
                                            <div
                                                class="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-600 text-xl shrink-0">
                                                {{ s.icon }}
                                            </div>
                                            <div class="min-w-0">
                                                <h3 class="text-base font-semibold text-slate-900 truncate">
                                                    {{ s.title }}
                                                </h3>
                                                <p class="text-sm text-slate-600 mt-1 line-clamp-3">
                                                    {{ s.desc }}
                                                </p>
                                                <a :href="s.href"
                                                    class="inline-flex items-center gap-1 text-sky-600 text-sm font-medium mt-3 hover:underline">
                                                    รายละเอียดเพิ่มเติม <span aria-hidden="true">→</span>
                                                </a>
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
    <section class="why-section font-sans w-full bg-gradient-to-r from-sky-500 via-slate-900 to-red-900">
        <div class="mx-auto max-w-6xl px-4 lg:px-6 py-10 md:py-14">
            <div class="grid gap-8 md:gap-10 md:grid-cols-3 items-start">
                <!-- LEFT: Title + CTA -->
                <div class="text-white">
                    <h2 class="whitespace-pre-line text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                        {{ title }}
                    </h2>

                    <NuxtLink :to="cta.to"
                        class="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition shadow-lg">
                        {{ cta.text }}
                    </NuxtLink>
                </div>

                <!-- RIGHT: 2x2 grid -->
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