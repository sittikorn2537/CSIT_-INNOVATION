<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '@/components/common/ConfirmsDialog.vue'

const router = useRouter()

// state
const showConfirm = ref(true)
const loading = ref(false)

const accessToken = useCookie('app-access-token')
const refreshToken = useCookie('app-refresh-token')

// ✅ เมื่อกดยืนยัน logout
const confirmLogout = async () => {
  loading.value = true
  try {
    // ล้าง token
    accessToken.value = null
    refreshToken.value = null

    // TODO: reset store อื่น ๆ เช่น Pinia
    // const authStore = useAuthStore()
    // authStore.$reset()

    // ไปหน้า login
    router.push('/admin')
  } finally {
    loading.value = false
  }
}

// ✅ เมื่อกดยกเลิก → กลับไปหน้าเดิม
const cancelLogout = () => {
  router.back()
}
</script>

<template>
  <div class="d-flex flex-column align-center justify-center min-h-screen">
    <ConfirmDialog
      v-model:open="showConfirm"
      :loading="loading"
      title="ออกจากระบบ"
      message="คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?"
      confirm-text="ออกจากระบบ"
      cancel-text="ยกเลิก"
      color="error"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>