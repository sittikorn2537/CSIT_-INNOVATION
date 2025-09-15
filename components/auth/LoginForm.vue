<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const username = ref('admin')
const password = ref('csit2025@admin')
const remember = ref(false)

const loading = ref(false)
const errorMsg = ref('')

const onSubmit = async () => {
  errorMsg.value = ''
  if (!username.value || !password.value) {
    errorMsg.value = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
    return
  }

  try {
    const { $api } = useNuxtApp()
    loading.value = true

    // ✅ ส่งค่าเป็น string ไม่ใช่ ref
    const res = await $api.raw('/auth/sign-in', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value,
        remember: remember.value,
      },
    })
    // ✅ อ่าน token จาก header
    const token = res.headers.get('app-access-token')
    if (token) {
      useCookie('app-access-token').value = token
    }
    console.log('Login success', res._data)
    // ✅ redirect ไปตาม query redirect หรือ dashboard
    const redirect = (route.query.redirect as string) || '/admin/dashboard'
    return navigateTo(redirect)
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
</script>

<template>
    <form @submit.prevent="onSubmit">
        <div class="d-flex align-center text-center mb-6">
            <div class="text-h6 w-100 px-5 font-weight-regular auth-divider position-relative">
                <span class="bg-surface px-5 py-3 position-relative text-subtitle-1 text-grey100">
                    Your Social Campaigns
                </span>
            </div>
        </div>

        <v-row class="mb-3">
            <v-col cols="12">
                <v-label class="font-weight-medium mb-1">Username</v-label>
                <v-text-field v-model="username" variant="outlined" hide-details color="primary"
                    autocomplete="username" />
            </v-col>

            <v-col cols="12">
                <v-label class="font-weight-medium mb-1">Password</v-label>
                <v-text-field v-model="password" variant="outlined" type="password" hide-details color="primary"
                    autocomplete="current-password" />
            </v-col>

            <v-col cols="12" class="py-0">
                <div class="d-flex flex-wrap align-center w-100">
                    <v-checkbox v-model="remember" hide-details color="primary" density="compact">
                        <template #label>Remember this Device</template>
                    </v-checkbox>
                    <div class="ml-sm-auto">
                        <RouterLink to="/auth/forgot"
                            class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium">
                            Forgot Password ?
                        </RouterLink>
                    </div>
                </div>
            </v-col>

            <v-col cols="12" v-if="errorMsg" class="py-0">
                <v-alert type="error" variant="tonal" density="compact" class="mb-3">
                    {{ errorMsg }}
                </v-alert>
            </v-col>

            <v-col cols="12">
                <v-btn :loading="loading" size="large" rounded="pill" color="primary" block type="submit" flat>
                    Sign In
                </v-btn>
            </v-col>
        </v-row>
    </form>
</template>

<style lang="sass">
@import 'vuetify/styles/main.sass'
</style>