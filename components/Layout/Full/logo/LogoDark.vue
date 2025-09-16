<script setup lang="ts">
import { RouterLink } from 'vue-router';
import logodark from '/images/logos/logo-dark.png';

const { info, loading } = useContactInfo()


</script>
<template>
    <div class="logo">
        <NuxtLink to="/">
            <img :src="info?.logo_url" alt="home" width="100px" class="mx-auto" />
        </NuxtLink>
    </div>
</template>
<style>
*,
::before,
::after {
    background-repeat: initial;
    box-sizing: border-box;
    /* หรือค่าอื่นที่ต้องการ */
}
</style>