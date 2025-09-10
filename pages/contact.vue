<script setup lang="ts">
/*-For Set Blank Layout-*/
definePageMeta({
    layout: "blank",
});
import Contact from "@/components/frontend/Contact.vue";
import Footer from "~/components/Layout/Footer.vue";

</script>
<template>
    <LayoutHeader class="pages" />
    <div
        class="  text-center why-section  w-full bg-gradient-to-r from-sky-500 via-slate-900 to-red-900 text-white py-10">
        <h1 class="text-3xl md:text-4xl font-extrabold  ">{{ $t('nav.contact') }}</h1>
        <p class=" mt-1"></p>
    </div>
    <Contact />
    <Footer/>

</template>