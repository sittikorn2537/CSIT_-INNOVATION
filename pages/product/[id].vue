<script setup lang="ts">
definePageMeta({
  layout: "blank",
});
import Detailproduct from "@/components/frontend/Detailproduct.vue";
import Footer from "~/components/Layout/Footer.vue";

</script>
<template>
  <LayoutHeader class="pages" />
 <Detailproduct/>
 <Footer/>
</template>

