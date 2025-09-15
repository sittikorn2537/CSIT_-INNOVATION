<script setup lang="ts">
import { ref } from 'vue'

const showZoom = ref(false)
</script>
<template>

    <div
        class="  text-center why-section  w-full bg-gradient-to-r from-sky-500 via-slate-900 to-red-900 text-white py-10">
        <h1 class="text-3xl md:text-4xl font-extrabold  ">Apple Green – DC เบรกเกอร์ 500 โวลต์</h1>
        <!-- <p class=" mt-1 max-w-4xl m-auto">{{ $t('product.description') }}</p> -->
    </div>
    <main class="bg-slate-50">
        <div class="container mx-auto max-w-6xl px-4 py-10">
            <!-- Grid -->
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                <!-- ซ้าย: รูปสินค้า -->
                <div class="lg:col-span-2 sm:col-span-2">
                    <div class="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=1200&auto=format&fit=crop"
                            alt="Apple Green – DC เบรกเกอร์ 500 โวลต์" class="w-full aspect-[4/3] object-contain" />
                        <button
                            class="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full bg-white/90 text-slate-700 shadow-md"
                            @click="showZoom = true">
                            🔍
                        </button>
                    </div>
                </div>

                <!-- ขวา: รายละเอียด -->
                <div class="lg:col-span-2 sm:col-span-2 flex flex-col justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-slate-900">
                            รายละเอียดสินค้า
                        </h1>
                        <p class="mt-4 text-slate-700 leading-7">
                            เบรกเกอร์คุณภาพสูง ใช้สำหรับระบบโซลาร์เซลล์และงานไฟฟ้ากระแสตรง
                            ปลอดภัย มาตรฐานสากล เหมาะสำหรับบ้านและธุรกิจ
                        </p>
                        <p>
                            <b>Category</b> EVS Servers
                        </p>
                        <p>
                            <b>Tag</b> EVS XT-3
                        </p>
                        <div class="mt-6 text-3xl font-extrabold text-orange-500">
                            ราคา ฿486.00
                        </div>
                    </div>

                    <!-- ปุ่มแชร์ -->
                    <!-- <div class="mt-6 flex flex-wrap gap-3">
            <button class="btn-share bg-[#3b5998]">Facebook</button>
            <button class="btn-share bg-[#1DA1F2]">Twitter</button>
            <button class="btn-share bg-[#ea4335]">Email</button>
            <button class="btn-share bg-gray-600">Print</button>
          </div> -->
                </div>
            </div>
        </div>
    </main>

    <!-- Lightbox Modal -->
    <dialog v-if="showZoom" class="modal" open>
        <div class="modal-box relative max-w-5xl p-0 bg-transparent shadow-none">
            <!-- ปุ่มปิด -->
            <button
                class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 text-slate-700 shadow-md hover:bg-white transition"
                @click="showZoom = false">
                ✕
            </button>

            <!-- รูป -->
            <img src="https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=1600&auto=format&fit=crop"
                alt="Zoomed" class="max-h-screen w-auto mx-auto object-contain rounded-lg" />
        </div>

        <!-- backdrop -->
        <form method="dialog" class="modal-backdrop">
            <button @click="showZoom = false">close</button>
        </form>
    </dialog>
</template>

<style scoped></style>