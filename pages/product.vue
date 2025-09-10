<script setup lang="ts">
definePageMeta({
  layout: "blank",
});
import Listproduct from "@/components/frontend/Listproduct.vue";
import Footer from "~/components/Layout/Footer.vue";

</script>
<template>
  <LayoutHeader class="pages" />
 <Listproduct/>
 <Footer/>
</template>

