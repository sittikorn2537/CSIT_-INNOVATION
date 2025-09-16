<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'

/** ---------- Types ---------- */
type SettingItem = {
  id: number | string
  logo_url?: string
  company_th: string
  company_en?: string
  address_th?: string
  address_en?: string
  email?: string
  phone_main?: string
  phone_alt?: string
  contact_person?: string
  line_id?: string
  wechat?: string
  facebook?: string
  facebook_name?: string
  website_url?: string
  is_active?: 0 | 1 | boolean
  user_created?: number | null
  user_updated?: number | null
  created_at?: string
  updated_at?: string
}
type ApiResponse<T> = { status: boolean; message?: string; data?: T }

const { $api } = useNuxtApp()

/** ---------- State ---------- */
const loading = ref(false)
const saving = ref(false)
const recordId = ref<number | string>(1) // ถ้าระบบคุณ fix = 1 ก็ปล่อยแบบนี้ได้เลย
const form = ref<SettingItem>({
  id: '',
  logo_url: '',
  company_th: '',
  company_en: '',
  address_th: '',
  address_en: '',
  email: '',
  phone_main: '',
  phone_alt: '',
  contact_person: '',
  line_id: '',
  wechat: '',
  facebook: '',
  facebook_name: '',
  website_url: '',
  is_active: 1
})

/** ---------- Logo upload (Dropzone) ---------- */
const fileInput = ref<HTMLInputElement | null>(null)
const logoFile = ref<File | null>(null)
const objectUrl = ref<string>('')     // สำหรับ preview ไฟล์ใหม่
const previewSrc = computed(() => objectUrl.value || normalizeUrl(form.value.logo_url) || '')

const normalizeUrl = (u?: string) => {
  if (!u) return ''
  return u.startsWith('//') ? 'https:' + u : u
}

const clearObjectUrl = () => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = ''
}

const setFile = (file: File | null) => {
  clearObjectUrl()
  logoFile.value = null
  if (!file) return  // กลับไปใช้รูปเดิม (previewSrc จะอ่านจาก logo_url)
  logoFile.value = file
  objectUrl.value = URL.createObjectURL(file)
}

const pickFile = () => fileInput.value?.click()
const onFileChange = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0] || null
  setFile(f)
}
const onDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation() }
const onDrop = (e: DragEvent) => {
  e.preventDefault(); e.stopPropagation()
  const f = e.dataTransfer?.files?.[0] || null
  setFile(f)
}
const clearFile = () => {
  setFile(null)             // ยกเลิกไฟล์ใหม่ → กลับไปใช้ logo_url เดิม
  if (fileInput.value) fileInput.value.value = ''
}

onBeforeUnmount(clearObjectUrl)

/** ---------- API ---------- */
// NOTE: ถ้าของคุณเป็น /settings/contact_infos (ไม่มี id) ให้ปรับตามจริง
const apiGet = async (id: number | string) => {
  return $api<ApiResponse<SettingItem>>(`/settings/contacts/${id}`)
}
const apiUpdate = async (id: number | string, fd: FormData) => {
  // บาง backend ต้องใช้ POST + _method=PUT
  // fd.set('_method', 'PUT')
  return $api<ApiResponse<SettingItem>>(`/settings/contacts/${id}`, {
    method: 'POST',
    body: fd
  })
}
const { info, fetchOnce } = useContactInfo()
/** ---------- Load ---------- */
const load = async () => {
  loading.value = true
  try {
    const res = await apiGet(recordId.value)
    if (res?.data) {
      // map ข้อมูลลงฟอร์ม
      form.value = {
        ...form.value,
        ...res.data,
        is_active: (res.data.is_active === 1 || res.data.is_active === true) ? 1 : 0
      }
      // reset file preview
      clearFile()
    }
    await fetchOnce() 
  } finally {
    loading.value = false
  }
}



/** ---------- Save ---------- */
const save = async () => {
  if (!form.value.company_th?.trim()) {
    // คุณจะใช้ snackbar/toast ก็ได้
    alert('กรุณากรอกชื่อบริษัท (ไทย)')
    return
  }

  saving.value = true
  try {
    const fd = new FormData()
    fd.append('id', String(form.value.id || recordId.value))
    fd.append('company_th', form.value.company_th || '')
    fd.append('company_en', form.value.company_en || '')
    fd.append('address_th', form.value.address_th || '')
    fd.append('address_en', form.value.address_en || '')
    fd.append('email', form.value.email || '')
    fd.append('phone_main', form.value.phone_main || '')
    fd.append('phone_alt', form.value.phone_alt || '')
    fd.append('contact_person', form.value.contact_person || '')
    fd.append('line_id', form.value.line_id || '')
    fd.append('wechat', form.value.wechat || '')
    fd.append('facebook', form.value.facebook || '')
    fd.append('facebook_name', form.value.facebook_name || '')
    fd.append('website_url', form.value.website_url || '')
    fd.append('is_active', (form.value.is_active ? '1' : '0'))

    // โลโก้: ส่งไฟล์ใหม่ถ้ามี, ถ้าไม่มีก็ส่ง logo_url เดิมให้ backend ตัดสินใจ
    if (logoFile.value) {
      fd.append('logo', logoFile.value)        // ชื่อฟิลด์ไฟล์ปรับตาม backend
    } else if (form.value.logo_url) {
      fd.append('logo_url', form.value.logo_url)
    }

    const res = await apiUpdate(recordId.value, fd)
    const saved = res?.data
    if (saved) {
      form.value = {
        ...form.value,
        ...saved,
        is_active: (saved.is_active === 1 || saved.is_active === true) ? 1 : 0
      }
      clearFile() // เคลียร์ object url แล้วใช้รูปจาก backend ที่อัปเดตล่าสุด
    }
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <v-container class="py-6" fluid>
    <div class="d-flex flex-column gap-3 mb-4">
      <div>
        <h2 class="text-h6 text-sm-h5 font-weight-medium mb-1">ตั้งค่าบริษัท</h2>
        <div class="text-medium-emphasis text-body-2">อัปเดตข้อมูลติดต่อและโลโก้บริษัท</div>
      </div>
    </div>

    <v-card rounded="xl" elevation="1">
      <v-card-text class="pt-6">
        <v-row>
          <!-- Dropzone: Logo -->
          <v-col cols="12" md="4">
            <div class="rounded-xl border-dashed" style="border: 2px dashed rgba(0,0,0,.15); padding: 16px;"
              @drop="onDrop" @dragover="onDragOver">
              <div class="d-flex ga-4 align-start">
                <div class="rounded-lg"
                  style="width: 180px; height: 140px; overflow: hidden; background: #f3f4f6; display:grid; place-items:center;">
                  <img v-if="previewSrc" :src="previewSrc" alt="logo preview"
                    style="width:100%; height:100%; object-fit:contain;" />
                  <div v-else class="text-medium-emphasis text-caption">ไม่มีโลโก้</div>
                </div>

                <div class="flex-grow-1">
                  <div class="text-subtitle-2 mb-1">โลโก้บริษัท</div>
                  <div class="text-body-2 text-medium-emphasis mb-2">
                    ลากไฟล์มาวาง หรือกดเลือกไฟล์ (รองรับ .jpg .png .webp)
                  </div>

                  <div class="d-flex ga-2">
                    <v-btn variant="tonal" color="primary" @click="pickFile">เลือกไฟล์</v-btn>
                    <v-btn v-if="logoFile || objectUrl" variant="text" color="error"
                      @click="clearFile">ลบไฟล์ใหม่</v-btn>
                  </div>

                  <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChange" />

                  <div v-if="logoFile" class="mt-2 text-body-2">
                    ไฟล์ที่เลือก: <b>{{ logoFile.name }}</b>
                  </div>
                  <!-- <div v-else-if="form.logo_url" class="mt-2 text-body-2 text-medium-emphasis">
                    ใช้รูปเดิมจาก <span class="text-primary">{{ form.logo_url }}</span>
                  </div> -->
                </div>
              </div>
            </div>
          </v-col>

          <!-- Company info -->
          <v-col cols="12" md="8">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.company_th" label="ชื่อบริษัท (ไทย)" :rules="[v => !!v || 'จำเป็น']"
                  hide-details="auto" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.company_en" label="ชื่อบริษัท (อังกฤษ)" variant="outlined" hide-details />
              </v-col>

              <v-col cols="12" md="6">
                <v-textarea v-model="form.address_th" label="ที่อยู่ (ไทย)" variant="outlined" auto-grow rows="3"
                  hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea v-model="form.address_en" label="ที่อยู่ (อังกฤษ)" variant="outlined" auto-grow rows="3"
                  hide-details />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.email" label="อีเมล" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="form.phone_main" label="เบอร์หลัก" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="form.phone_alt" label="เบอร์สำรอง" variant="outlined" hide-details />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field v-model="form.contact_person" label="ผู้ติดต่อ" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="form.line_id" label="LINE ID" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="form.wechat" label="WeChat" variant="outlined" hide-details />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.facebook" label="Facebook URL" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.facebook_name" label="Facebook Name" variant="outlined" hide-details />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.website_url" label="เว็บไซต์" variant="outlined" hide-details />
              </v-col>


            </v-row>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-4">
        <v-spacer />
        <v-btn variant="text" :disabled="saving || loading" @click="load">รีเฟรช</v-btn>
        <v-btn color="primary" :loading="saving" :disabled="loading" @click="save">
          บันทึกการเปลี่ยนแปลง
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Loading overlay เล็ก ๆ -->
    <v-overlay v-model="loading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
  </v-container>
</template>