<script setup lang="ts">
definePageMeta({
  layout: "blank",
});
import Listproduct from "@/components/frontend/Listproduct.vue";
import Footer from "~/components/Layout/Footer.vue";
import FloatingContactButtons from "@/components/frontend/FloatingContactButtons.vue";

</script>
<template>
  <LayoutHeader class="pages" />
 <Listproduct/>
  <FloatingContactButtons />
 <Footer/>
</template>

