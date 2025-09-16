<script setup lang="ts">

import { Icon } from "@iconify/vue";
const { info } = useContactInfo()
/** ปรับข้อมูลได้ตรงนี้ */


/* helper ลิงก์โทร */
const tel = (s: string) => `tel:${s.replace(/[^0-9]/g, '')}`
</script>

<template>
    <!-- full-width hero -->
    <section class="w-full" id="contact">
        <div class="grid lg:grid-cols-2">
            <!-- ซ้าย: รูปเต็มครึ่ง -->
            <figure class="h-[56vh] lg:h-[66vh]">
                <img src="https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop"
                    alt="" class="w-full h-full object-cover" />
            </figure>

            <!-- ขวา: แผงพื้นหลังฟ้า + เนื้อหา -->
            <div class="bg-sky-300/80">
                <div class="h-full max-w-3xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
                    <h2 class="text-3xl lg:text-4xl font-extrabold text-slate-900">
                        {{ $t('nav.contact') }}
                    </h2>
                    <p class="mt-2 text-2xl lg:text-3xl font-bold text-slate-900">
                        {{ $i18n?.locale === 'en' ? info?.company_en : info?.company_th }}
                    </p>

                    <!-- รายการข้อมูล (ไอคอน + ข้อความ) -->
                    <ul class="mt-6 space-y-4 text-slate-800">
                        <li class="flex gap-3">
                            <!-- pin -->
                            <Icon icon="line-md:map-marker" width="24" height="24" />
                            <div>
                                <div> {{ $i18n?.locale === 'en' ? info?.address_en : info?.address_th }}</div>
                            </div>
                        </li>

                        <li class="flex gap-3">
                            <!-- facebook/info -->
                            <Icon icon="line-md:facebook" width="24" height="24" />
                            <!-- <span>{{ data.fbLine }}</span> -->
                            <a class="link link-hover" :href="info?.facebook" target="_blank">{{ info?.facebook_name
                                }}</a>


                        </li>

                        <li class="flex gap-3">
                            <!-- mail -->
                            <Icon icon="line-md:email" width="24" height="24" />
                            <a class="link link-hover" :href="`mailto:${info?.email}`">{{ info?.email }}</a>
                        </li>

                        <li class="flex gap-3">
                            <a :href="`https://line.me/R/ti/p/${info?.line_id}`" target="_blank"
                                class="flex items-center gap-2 hover:underline">
                                <Icon icon="simple-icons:line" width="24" height="24" /> {{ info?.line_id }}
                            </a>
                        </li>

                        <li class="flex gap-3">
                            <!-- phone -->
                            <Icon icon="line-md:phone" width="24" height="24" />
                            <div class="space-y-1">
                                <a href="tel:034105191" class="flex items-center gap-2 hover:underline">
                                    {{ info?.phone_main }}
                                </a>
                                <a href="tel:0936351949" class="flex items-center gap-2 hover:underline">
                                    {{ info?.phone_alt }}
                                </a>
                            </div>
                        </li>
                    </ul>


                </div>
            </div>
        </div>
    </section>
</template>