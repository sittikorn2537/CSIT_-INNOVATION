<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

type Product = {
    id: number
    name: string
    image: string
    price: number
    unit?: string
    href?: string
}

const products: Product[] = [
    {
        id: 1,
        name: 'Schneider – Charging station, EVlink Home,…',
        image: 'https://picsum.photos/400/400?random=101',
        price: 34925,
        unit: 'ชิ้น',
        href: '#'
    },
    {
        id: 2,
        name: 'Low Voltage ENP51100',
        image: 'https://picsum.photos/400/400?random=102',
        price: 65000,
        unit: 'ชิ้น',
        href: '#'
    },
    {
        id: 3,
        name: 'Apple Green – DC เบรกเกอร์ 500 โวลต์',
        image: 'https://picsum.photos/400/400?random=103',
        price: 486,
        unit: 'ชิ้น',
        href: '#'
    },
    {
        id: 4,
        name: 'LINK – สาย DC PV-1#6 สีดำ /100 เมตร',
        image: 'https://picsum.photos/400/400?random=104',
        price: 4667,
        unit: 'ม้วน',
        href: '#'
    },
    {
        id: 5,
        name: 'โซล่าอินเวอร์เตอร์ 5kW',
        image: 'https://picsum.photos/400/400?random=105',
        price: 23900,
        unit: 'ชิ้น',
        href: '#'
    },
]

const fmtTHB = (n: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 }).format(n)
</script>

<template>
    <main class="py-12 md:py-16">
        <div class="max-w-6xl mx-auto px-4 lg:px-6">
            <!-- Heading -->
            <header class="text-center">
                <h2 class="text-3xl md:text-5xl font-extrabold text-slate-800">{{ $t("nav.products") }}</h2>
                <p class="mt-2 text-slate-500">{{ $t("product.description") }}</p>
            </header>

            <!-- Carousel -->
            <div class="relative mt-8 md:mt-10">
                <!-- arrows -->
                <button
                    class="nav-prev absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:shadow-md">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="#0f2c3a" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
                <button
                    class="nav-next absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:shadow-md">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6l6 6-6 6" stroke="#0f2c3a" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>

                <Swiper :modules="[Navigation]" :navigation="{ prevEl: '.nav-prev', nextEl: '.nav-next' }"
                    :space-between="24" :slides-per-view="2" :breakpoints="{
                        640: { slidesPerView: 2, spaceBetween: 24 },
                        1024: { slidesPerView: 4, spaceBetween: 28 }
                    }" class="pb-6">
                    <SwiperSlide v-for="p in products" :key="p.id">
                        <NuxtLink :to="p.href || '#'"
                            class="group flex flex-col bg-white rounded-xl shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-sky-200 transition overflow-hidden h-full">
                            <!-- รูป -->
                            <div class="aspect-[4/3] bg-slate-50 grid place-items-center">
                                <img :src="p.image" :alt="p.name"
                                    class="max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
                            </div>

                            <!-- เนื้อหา -->
                            <div class="flex flex-col flex-1 p-5 justify-between">
                                <!-- ชื่อสินค้า (fix height + clamp) -->
                                <h3 class="text-slate-800 font-semibold leading-snug line-clamp-2 min-h-[3.5rem]">
                                    {{ p.name }}
                                </h3>

                                <!-- ราคา -->
                                <div class="mt-4">
                                    <span class="text-orange-500 font-extrabold text-lg">{{ fmtTHB(p.price) }}</span>
                                    <span v-if="p.unit" class="text-slate-400 ml-1">/ {{ p.unit }}</span>
                                </div>
                            </div>
                        </NuxtLink>
                    </SwiperSlide>
                </Swiper>
            </div>

            <!-- CTA -->
            <div class="mt-8 text-center">
                <NuxtLink to="/product"
                    class="inline-flex items-center gap-2 rounded-full px-6 py-2.5 border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 transition">
                    {{$t("product.all")}}
                </NuxtLink>
            </div>
        </div>
    </main>
</template>

<style scoped>
/* เน้นสไลด์แรกเล็กน้อยเหมือนตัวอย่าง: เงา/ขอบฟ้าอ่อน */
:deep(.swiper-slide:first-child .group) {
    box-shadow: 0 8px 22px rgba(2, 132, 199, .10);
    outline: 2px solid rgba(2, 132, 199, .15);
    outline-offset: -2px;
}
.p-5 {
  padding: 1.25rem !important;
}
</style>