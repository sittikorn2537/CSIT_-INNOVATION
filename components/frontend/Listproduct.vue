<script setup lang="ts">

type Product = {
    id: number
    name: string
    image: string
    price: number
    compareAt?: number // ราคาปกติ (จะขีดทับถ้ามี)
    unit?: string
    href?: string
    tag?: string
    category?: string
}

const allProducts: Product[] = [
    { id: 1, name: 'Apple Green – DC เบรกเกอร์ 500 โวลต์', image: 'https://picsum.photos/600/600?random=201', price: 400, compareAt: 486, unit: 'ชิ้น', category: 'อุปกรณ์ไฟฟ้า' },
    { id: 2, name: 'Apple Green – DC เบรกเกอร์ 500 โวลต์', image: 'https://picsum.photos/600/600?random=202', price: 486, unit: 'ชิ้น', category: 'อุปกรณ์ไฟฟ้า' },
    { id: 3, name: 'Huawei 100kW 3 Phase On-Grid String Inverter', image: 'https://picsum.photos/600/600?random=203', price: 218500, unit: 'ชิ้น', category: 'อินเวอร์เตอร์' },
    { id: 4, name: 'Huawei 100kW 3 Phase On-Grid String Inverter', image: 'https://picsum.photos/600/600?random=204', price: 218500, unit: 'ชิ้น', category: 'อินเวอร์เตอร์' },
    { id: 5, name: 'LINK – สาย DC PV-1#6 สีดำ /100 เมตร', image: 'https://picsum.photos/600/600?random=205', price: 4667, unit: 'ม้วน', category: 'สายไฟ' },
    { id: 6, name: 'LINK – สาย DC PV-1#6 สีดำ /100 เมตร', image: 'https://picsum.photos/600/600?random=206', price: 4667, unit: 'ม้วน', category: 'สายไฟ' },
    { id: 7, name: 'Low Voltage ENP51100', image: 'https://picsum.photos/600/600?random=207', price: 65000, unit: 'ชิ้น', category: 'แบตเตอรี่' },
    { id: 8, name: 'Schneider – Charging station, EVlink Home', image: 'https://picsum.photos/600/600?random=208', price: 34925, unit: 'ชิ้น', category: 'ชาร์เจอร์รถไฟฟ้า' },
    { id: 9, name: 'Solar Mount – จับยึดแผง (ชุด)', image: 'https://picsum.photos/600/600?random=209', price: 1590, unit: 'ชุด', category: 'โครงยึด' },
    { id: 10, name: 'Smart Meter – 3 เฟส', image: 'https://picsum.photos/600/600?random=210', price: 8900, unit: 'ชิ้น', category: 'มิเตอร์' },
]

/** ฟอร์แมตราคา THB */
const thb = (n: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 }).format(n)

/** เพจจิเนชันแบบง่าย */
const pageSize = 8
const page = ref(1)
const total = computed(() => Math.ceil(allProducts.length / pageSize))
const products = computed(() => {
    const start = (page.value - 1) * pageSize
    return allProducts.slice(start, start + pageSize)
})

const next = () => (page.value = Math.min(page.value + 1, total.value))
const prev = () => (page.value = Math.max(page.value - 1, 1))
</script>
<template>
    <div
        class="  text-center why-section  w-full bg-gradient-to-r from-sky-500 via-slate-900 to-red-900 text-white py-10">
        <h1 class="text-3xl md:text-4xl font-extrabold  ">{{ $t('nav.products') }}</h1>
        <p class=" mt-1 max-w-4xl ma-auto">{{ $t('product.description') }}</p>
    </div>
    <div class="container mx-auto max-w-6xl px-4 py-10">
        <!-- Grid -->
        <div class="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <article v-for="p in products" :key="p.id"
                class="group card  rounded-xl ring-1 ring-slate-200 hover:ring-sky-200 shadow-sm hover:shadow-md transition overflow-hidden h-full">
                <NuxtLink :to="'/product/' + p.id" class="block h-full">
                    <div class="flex flex-col h-full">
                        <!-- รูป: อัตราส่วนเดียว -->
                        <div class="relative bg-slate-50">
                            <div class="aspect-[4/3] grid place-items-center">
                                <img :src="p.image" :alt="p.name"
                                    class="max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
                            </div>
                        </div>
                        <!-- เนื้อหา -->
                        <div class="flex flex-col flex-1 pa-5">
                            <!-- ชื่อ -->
                            <h3 class="text-slate-800 font-semibold leading-snug min-h-[3.5rem]">
                                {{ p.name }}
                            </h3>
                            <!-- ราคา -->
                            <div class="mt-3">
                                <div class="flex items-baseline gap-2">
                                    <span class="text-red-500 font-extrabold text-lg">{{ thb(p.price) }}</span>
                                    <span v-if="p.unit" class="text-slate-400 text-sm">/ {{ p.unit }}</span>
                                </div>
                                <div v-if="p.compareAt && p.compareAt > p.price"
                                    class="text-slate-400 text-sm line-through">
                                    {{ thb(p.compareAt) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </NuxtLink>

            </article>
        </div>
    </div>
</template>