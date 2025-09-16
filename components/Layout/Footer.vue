<script setup lang="ts">
import { Icon } from "@iconify/vue";
const { info } = useContactInfo()

</script>

<template>
  <footer class="bg-slate-900 text-gray-200 py-12 px-6">
    <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

      <!-- Logo + Address -->
      <div>
        <LayoutFullLogoDark class="mb-3" />
        <p class="text-sm leading-relaxed">
          <!-- {{ $t('company.name') }} <br />
          {{ $t('company.address1') }} -->
          {{ $i18n?.locale === 'en' ? info?.company_en : info?.company_th }}<br />
          {{ $i18n?.locale === 'en' ? info?.address_en : info?.address_th }}

        </p>
      </div>

      <!-- Menu -->
      <div>
        <h6 class="text-lg font-semibold mb-3">{{ $t('footer.menu') }}</h6>
        <ul class="space-y-2 text-sm">
          <li>
            <NuxtLink class="hover:underline" to="/">{{ $t('nav.home') }}</NuxtLink>
          </li>
          <li>
            <NuxtLink class="hover:underline" to="/#service">{{ $t('nav.services') }}</NuxtLink>
          </li>
          <li>
            <NuxtLink class="hover:underline" to="/our-work">{{ $t('nav.works') }}</NuxtLink>
          </li>
          <li>
            <NuxtLink class="hover:underline" to="/product">{{ $t('nav.products') }}</NuxtLink>
          </li>
          <li>
            <NuxtLink class="hover:underline" to="/contact">{{ $t('nav.contact') }}</NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h6 class="text-lg font-semibold mb-3">{{ $t('nav.contact') }}</h6>


        <ul class="space-y-2 text-sm ">
          <li>
            <a v-if="info?.facebook" :href="info.facebook" target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-2 hover:underline">
              <Icon icon="line-md:facebook" width="18" height="18" /> {{ info?.facebook_name }}
            </a>
          </li>
          <li>
            <a href="mailto:test@gamil.com" class="flex items-center gap-2 hover:underline">
              <Icon icon="line-md:email" width="18" height="18" /> {{ info?.email }}
            </a>
          </li>
          <li>
            <a :href="`tel:{{info?.phone_alt}}`" v-if="info?.phone_main"  class="flex items-center gap-2 hover:underline">
              <Icon icon="line-md:phone" width="18" height="18" /> {{ info?.phone_main }}
            </a>
          </li>
          <li>
            <a :href="`tel:{{info?.phone_alt}}`" v-if="info?.phone_alt" class="flex items-center gap-2 hover:underline">
              <Icon icon="line-md:phone" width="18" height="18" /> {{ info?.phone_alt }}
            </a>
          </li>
          <li>
            <a :href="`https://line.me/R/ti/p/${info?.line_id}`" target="_blank"
              class="flex items-center gap-2 hover:underline">
              <Icon icon="simple-icons:line" width="18" height="18" /> {{ info?.line_id }}
            </a>
          </li>
          <li>
            <a :href="`weixin://dl/chat?${info?.wechat}`" target="_blank" class="flex items-center gap-2 hover:underline">
              <Icon icon="simple-icons:wechat" width="18" height="18" /> {{ info?.wechat }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Newsletter -->
      <!-- <div>
        <h6 class="text-lg font-semibold mb-3">{{ $t('footer.Newsletter') }}</h6>
        <p class="text-sm text-gray-600 mb-3">{{ $t('footer.detail') }}</p>
        <form class="flex">
          <input type="email" placeholder="E-mail"
            class="flex-1 px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
          <button type="submit"
            class="px-4 py-2 rounded-r-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
            {{ $t('footer.subscribe') }}
          </button>
        </form>
      </div> -->
    </div>

    <!-- Bottom -->
    <div class="mt-10 border-t border-gray-300 pt-6 text-center text-sm text-gray-500">
      © {{ new Date().getFullYear() }}  {{ $i18n?.locale === 'en' ? info?.company_en : info?.company_th }}. All rights reserved.
    </div>
  </footer>
</template>