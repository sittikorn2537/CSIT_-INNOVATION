<script setup lang="ts">
definePageMeta({
    layout: "blank",
});
import WorkShow from "@/components/frontend/WorkShow.vue";
import Footer from "~/components/Layout/Footer.vue";
import FloatingContactButtons from "@/components/frontend/FloatingContactButtons.vue";
</script>
<template>
    <LayoutHeader class="pages" />
    <div
        class="  text-center why-section  w-full bg-gradient-to-r from-sky-500 via-slate-900 to-red-900 text-white py-10">
        <h1 class="text-3xl md:text-4xl font-extrabold  ">{{ $t('nav.works') }}</h1>
        <p class=" mt-1"></p>
    </div>
    <WorkShow class="pages" />
    <FloatingContactButtons />
    <Footer />
</template>
<style>
.pages .our-work {
    display: none;
}
</style>