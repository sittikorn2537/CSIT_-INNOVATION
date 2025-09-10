<template>
  <header id="masthead" class="site-header --transparent" role="banner">
    <div class="s-container">
      <!-- Left: Logo -->
      <div class="site-branding">
        <LayoutFullLogoDark />
      </div>

      <!-- Center: Desktop nav -->
      <nav id="site-nav-d" class="site-nav-d" aria-label="Main">
        <ul class="nav-list">
          <li v-for="item in menu" :key="item.id" class="nav-item"
            :class="{ active: $route.path === localePath(item.to) }">
            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
            <i class="nav-underline" aria-hidden="true"></i>
          </li>
        </ul>
      </nav>

      <!-- Right: CTA -->
      <div class="site-action">
        <NuxtLink to="/contact-us" class="btn-cta"> {{ $t('nav.contact') }} </NuxtLink>
      </div>

      <div class="dropdown btn-blue language">
        <label tabindex="0" class="  ">
          <span class="flex items-center justify-center ">
            <!-- <Icon icon="material-symbols-light:emoji-language-rounded" width="20" height="20" /> -->
            {{ locale.toUpperCase() }}
          </span>
        </label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-25 text-base mt-4"
          style="margin-top: 3px;">
          <li><a @click.prevent="setLocale('th')">ไทย</a></li>
          <li><a @click.prevent="setLocale('en')">English</a></li>
        </ul>
      </div>
      <!-- Mobile toggle -->
      <button class="burger" :aria-expanded="isOpen ? 'true' : 'false'" aria-label="Toggle menu" @click="toggle">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile nav -->
    <transition name="fade">
      <nav v-if="isOpen" id="site-nav-m" class="site-nav-m" aria-label="Mobile">
        <ul class="nav-list-m">
          <li v-for="item in menu" :key="'m-' + item.id" class="nav-item" :class="{ active: isActive(item.to) }">
            <NuxtLink :to="item.to" @click="close">
              {{ item.label }}
            </NuxtLink>
            <i class="nav-underline" aria-hidden="true"></i>
          </li>

          <!-- ปุ่ม CTA -->
          <li class="nav-item">
            <NuxtLink :to="localePath('/contact')" class="btn-cta --full" @click="close">
              {{ $t('nav.contact') }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const { locale, setLocale, t } = useI18n()

// const route = useRoute()
const localePath = useLocalePath()

const menu = computed(() => [
  { id: 26, label: t('nav.home'), to: localePath('/') },
  // anchor ต้องสร้างเป็น object: path + hash
  { id: 260, label: t('nav.services'), to: { path: localePath('/'), hash: '#service' } },
  { id: 165, label: t('nav.works'), to: localePath('/our-work') },
  { id: 167, label: t('nav.products'), to: localePath('/product') },
  { id: 169, label: t('nav.contact'), to: localePath('/contact') },
])

const route = useRoute()
const currentPath = computed(() => (route.path.replace(/\/+$/, '') || '/'))
// เช็ค active รองรับทั้ง path และ object (มี hash)
const normalize = (p: string) => (p.replace(/\/+$/, '') || '/')
const isActive = (to: any) => {
  const current = normalize(route.path)
  const targetPath = typeof to === 'string' ? to : to?.path || '/'
  return current === normalize(targetPath)
}

// state เมนูมือถือ (ตามเดิมของคุณ)
const isOpen = useState<boolean>('site-nav-open', () => false)
const close = () => (isOpen.value = false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

</script>

<style scoped>
.p-2 {
  padding: 0.5rem !important;
}

/* ====== Layout (desktop) ====== */
.site-header {
  inset: 0 auto auto 0;
  width: 100%;
  position: absolute;
  z-index: 50;
}

.site-header.--transparent {
  background: transparent;
  color: #fff;
}

.s-container {
  max-width: 1240px;
  margin: 0 auto;
  /* padding: 14px 16px; */
  display: flex;
  align-items: center;
  gap: 20px;
}

.site-branding .logo {
  display: inline-flex;
  align-items: center;
}

/* กลาง: เมนูแนวนอน จัดกึ่งกลาง */
.site-nav-d {
  flex: 1 1 auto;
}

.nav-list {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 28px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-item>a {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: .1px;
  transition: color .2s ease;
}

.nav-item:hover>a {
  color: #4080c4;
}

/* เส้นใต้สั้น ๆ */
.nav-item .nav-underline {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  bottom: -10px;
  width: 28px;
  height: 3px;
  border-radius: 2px;
  background: transparent;
  transition: background .2s ease;
}

.nav-item.active>a {
  color: #4080c4;
}

.nav-item.active .nav-underline {
  background: #4080c4;
}

/* ขวา: CTA pill ส้ม */
.site-action {
  flex: 0 0 auto;
}

.btn-blue {
  display: inline-block;
  padding: 10px 18px;
  margin-right: 5px;
  border-radius: 999px;
  background: rgb(95, 151, 208);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  line-height: 1;
  box-shadow: 0 4px 10px rgba(95, 151, 208, 0.586);
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
}

.btn-cta {
  display: inline-block;
  padding: 10px 18px;
  border-radius: 999px;
  background: #db0006;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  line-height: 1;
  box-shadow: 0 4px 10px rgba(219, 0, 7, 0.586);
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
}

.btn-cta:hover,
.btn-blue:hover {
  transform: translateY(-1px);
}

.btn-cta:active {
  transform: translateY(0);
  opacity: .9;
}

.language {
  margin-left: auto;
}

/* Burger */
.burger {
  display: none;
  position: relative;
  width: 38px;
  height: 38px;
  margin-left: 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #fff;
}

.burger span {
  position: absolute;
  left: 9px;
  right: 9px;
  height: 2px;
  background: currentColor;
  transition: transform .2s ease, opacity .2s ease;
}

.burger span:nth-child(1) {
  top: 12px;
}

.burger span:nth-child(2) {
  top: 18px;
}

.burger span:nth-child(3) {
  top: 24px;
}

/* ====== Mobile nav ====== */
.site-nav-m {
  background: rgba(0, 0, 0, .72);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}

.nav-list-m {
  list-style: none;
  margin: 0;
  padding: 10px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-list-m .nav-item>a {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}

.nav-list-m .nav-item.active>a {
  color: #4080c4;
}

.btn-cta.--full {
  display: block;
  text-align: center;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity .18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ====== Responsive ====== */
@media (max-width: 1023px) {
  .site-nav-d {
    display: none;
  }

  .btn-cta {
    display: none;
  }

  .burger {
    display: inline-block;
    /* margin-left: auto; */
  }

  .s-container {
    gap: 12px;
  }
}

#site-nav-m .nav-underline {
  display: none;
}

@media (min-width: 1024px) {
  #site-nav-m {
    display: none !important;
  }
}
</style>