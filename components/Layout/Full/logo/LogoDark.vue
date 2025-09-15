<script setup lang="ts">
import { RouterLink } from 'vue-router';
import logodark from '/images/logos/logo-dark.png';
</script>
<template>
    <div class="logo">
        <NuxtLink to="/">
            <img :src="logodark" alt="home" width="100px" class="mx-auto" />
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