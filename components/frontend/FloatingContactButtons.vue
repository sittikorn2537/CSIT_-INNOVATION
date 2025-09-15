<script setup lang="ts">
import { Icon } from '@iconify/vue'

const props = withDefaults(defineProps<{
  lineUrl?: string
  phone?: string
  wechatUrl?: string
  show?: boolean
}>(), {
  lineUrl: 'https://line.me/R/ti/p/@yourline',
  phone: '0936351949',
  wechatUrl: 'https://wechat.com/', // ✅ แก้เป็น wechat official link ของคุณ
  show: true,
})
</script>

<template>
  <div v-if="show" class="floating">
    <!-- WeChat -->
    <a
      :href="props.wechatUrl"
      target="_blank"
      rel="noopener"
      aria-label="Chat on WeChat"
      class="btn btn-wechat"
    >
      <Icon icon="simple-icons:wechat" width="26" height="26" />
    </a>

    <!-- LINE -->
    <a
      :href="props.lineUrl"
      target="_blank"
      rel="noopener"
      aria-label="Chat on LINE"
      class="btn btn-line"
    >
      <Icon icon="simple-icons:line" width="26" height="26" />
    </a>

    <!-- PHONE -->
    <a
      :href="`tel:${props.phone}`"
      aria-label="Call us"
      class="btn btn-phone"
    >
      <Icon icon="mdi:phone" width="26" height="26" />
    </a>
  </div>
</template>

<style scoped>
.floating {
  position: fixed;
  right: 20px;
  bottom: 30px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  box-shadow: 0 10px 25px rgba(0,0,0,.15);
  border: 1px solid rgba(0,0,0,.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: transform .2s ease, background-color .2s ease, filter .2s ease;
}
.btn:hover { transform: scale(1.1); }
.btn:active { transform: scale(.96); }

/* ✅ สีปุ่ม */
.btn-wechat { background: #07C160; } /* WeChat Green */
.btn-line   { background: #06C755; } /* LINE Green */
.btn-phone  { background: #1A73E8; } /* Google Blue */
</style>