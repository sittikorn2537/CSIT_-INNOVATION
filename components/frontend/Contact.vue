<script setup lang="ts">

import { Icon } from "@iconify/vue";

/** ปรับข้อมูลได้ตรงนี้ */
const data = {
    title: $t('nav.contact'),
    company: $t('company.name'),
    address1: $t('company.address1'),
    // address2: 'จังหวัดนครปฐม 73000',
    fbLine: 'C.S Innovation Technology',
    email: 'test@gamil.com',
    line: '@CSInnovation',
    tel1: '088-888-8888',
    tel2: '088-888-8888 (ตั๊ก วิศวกร)',
    hero:
        'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop'
}

/* helper ลิงก์โทร */
const tel = (s: string) => `tel:${s.replace(/[^0-9]/g, '')}`
</script>

<template>
    <!-- full-width hero -->
    <section class="w-full" id="contact">
        <div class="grid lg:grid-cols-2">
            <!-- ซ้าย: รูปเต็มครึ่ง -->
            <figure class="h-[56vh] lg:h-[66vh]">
                <img :src="data.hero" alt="" class="w-full h-full object-cover" />
            </figure>

            <!-- ขวา: แผงพื้นหลังฟ้า + เนื้อหา -->
            <div class="bg-sky-300/80">
                <div class="h-full max-w-3xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
                    <h2 class="text-3xl lg:text-4xl font-extrabold text-slate-900">
                        {{ data.title }}
                    </h2>
                    <p class="mt-2 text-2xl lg:text-3xl font-bold text-slate-900">
                        {{ data.company }}
                    </p>

                    <!-- รายการข้อมูล (ไอคอน + ข้อความ) -->
                    <ul class="mt-6 space-y-4 text-slate-800">
                        <li class="flex gap-3">
                            <!-- pin -->
                            <Icon icon="line-md:map-marker" width="24" height="24" />
                            <div>
                                <div>{{ data.address1 }}</div>
                            </div>
                        </li>

                        <li class="flex gap-3">
                            <!-- facebook/info -->
                            <Icon icon="line-md:facebook" width="24" height="24" />
                            <!-- <span>{{ data.fbLine }}</span> -->
                            <a class="link link-hover" :href="`https://www.facebook.com/CSInnovationTechnology`" target="_blank">{{ data.fbLine }}</a>

                            
                        </li>

                        <li class="flex gap-3">
                            <!-- mail -->
                            <Icon icon="line-md:email" width="24" height="24" />
                            <a class="link link-hover" :href="`mailto:${data.email}`">{{ data.email }}</a>
                        </li>

                        <li class="flex gap-3">
                            <!-- line/chat -->
                            <Icon icon="line-md:chat" width="24" height="24" />
                            <span>{{ data.line }}</span>
                        </li>

                        <li class="flex gap-3">
                            <!-- phone -->
                            <Icon icon="line-md:phone" width="24" height="24" />
                            <div class="space-y-1">
                                <a class="link link-hover block" :href="tel(data.tel1)">{{ data.tel1 }}</a>
                                <a class="link link-hover block" :href="tel(data.tel2)">{{ data.tel2 }}</a>
                            </div>
                        </li>
                    </ul>

              
                </div>
            </div>
        </div>
    </section>
</template>