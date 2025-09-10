<script setup lang="ts">

import { Icon } from "@iconify/vue";
</script>

<template>
    <footer class="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
        <aside>
            <LayoutFullLogoDark />
            <p>
                {{ $t('company.name') }}
                <br />
                {{ $t('company.address1') }}
            </p>
        </aside>
        <nav>
            <h6 class="footer-title">{{ $t('footer.menu') }}</h6>
            <a class="link link-hover" href="/">{{ $t('nav.home') }}</a>
            <a class="link link-hover" href="/#service">{{ $t('nav.services') }}</a>
            <a class="link link-hover" href="/our-work">{{ $t('nav.works') }}</a>
            <a class="link link-hover" href="/product">{{ $t('nav.products') }}</a>
            <a class="link link-hover" href="/contact">{{ $t('nav.contact') }}</a>
        </nav>
        <nav>
            <h6 class="footer-title">{{ $t('nav.contact') }}</h6>
            <p class="text-sm flex">{{ $t('company.name') }}</p>
            <p class="text-sm max-w-xs flex">
                {{ $t('company.address1') }}
            </p>
            <a href="https://www.facebook.com/CSInnovationTechnology" target="_blank" class="link link-hover flex">
                <Icon icon="line-md:facebook" width="18" height="18" class="mr-2" />C.S Innovation Technology
            </a>
            <a href="mailto:test@gamil.com" class="link link-hover flex">
                <Icon icon="line-md:email" width="18" height="18" class="mr-2" />
                test@gamil.com
            </a>
            <a href="tel:034105191" class="link link-hover flex">
                <Icon icon="line-md:phone" width="18" height="18" class="mr-2" />
                034-105-191
            </a>
            <a href="tel:0936351949" class="link link-hover flex">
                <Icon icon="line-md:phone" width="18" height="18" class="mr-2" />
                093-635-1949 (Khun Vittakorn)
            </a>
            <a href="https://line.me/R/ti/p/@CSInnovation" target="_blank" class="link link-hover flex">
                <Icon icon="line-md:chat" width="18" height="18" class="mr-2" /> @CSInnovation
            </a>

        </nav>
        <form>
    <h6 class="footer-title">{{ $t('footer.Newsletter') }}</h6>
    <fieldset class="w-80">
      <label>{{$t('footer.detail') }}</label>
      <div class="join mt-2">
        <input
          type="text"
          placeholder="E-mail"
          class="input input-bordered join-item" />
        <button class="btn btn-primary join-item">{{ $t('footer.subscribe') }}</button>
      </div>
    </fieldset>
  </form>
    </footer>
</template>
