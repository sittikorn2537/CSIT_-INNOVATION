<script setup lang="ts">
/*-For Set Blank Layout-*/
definePageMeta({
    layout: "blank",
});


import Carousel from "@/components/frontend/Carousel.vue";
import Service from "@/components/frontend/Service.vue";
import WorkShowcase from "@/components/frontend/WorkShowcase.vue";
import Product from "@/components/frontend/Product.vue";
import Contact from "@/components/frontend/Contact.vue";
import Clients from "@/components/frontend/Clients.vue";
import FloatingContactButtons from "@/components/frontend/FloatingContactButtons.vue";

import Footer from "~/components/Layout/Footer.vue";



// const route = useRoute()
const localePath = useLocalePath()
</script>
<template>
    <LayoutHeader />
    <Carousel />
    <Service />
    <WorkShowcase />
    <Product />
    <Clients id="clients" />
    <FloatingContactButtons />
    <!-- <Contact /> -->
    <Footer />

</template>

<style>
body {
    overflow-x: hidden;
}
</style>