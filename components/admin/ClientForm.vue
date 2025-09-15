<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import type { Client } from '~/types/client'

const props = defineProps<{
  open: boolean
  model: Client | null
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'saved', data: FormData): void
}>()

/* ---------- State ---------- */
const isOpen = ref(props.open)
watch(() => props.open, v => (isOpen.value = v))
watch(isOpen, v => emit('update:open', v))

const blank: Client = {
  id: '',
  name_th: '',
  name_en: '',
  website_url: '',
  logo_url: '',
  is_active: false,
}
const form = ref<Client>({ ...blank })
const isEdit = computed(() => !!props.model?.id)

/* ---------- Logo Upload ---------- */
const fileInput = ref<HTMLInputElement | null>(null)
const logoFile = ref<File | null>(null)
const previewUrl = ref<string>('')


// อัพเดต preview ตามไฟล์หรือ URL เดิม
const updatePreview = (file: File | null, url?: string) => {
  // cleanup object URL เดิม
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }

  if (file) {
    previewUrl.value = URL.createObjectURL(file) // ✅ blob preview
  } else if (url) {
    previewUrl.value = url // ✅ ใช้ string จาก backend
  } else {
    previewUrl.value = ''
  }
}

// normalize URL ที่ขึ้นต้นด้วย //
const normalizeUrl = (u?: string) => {
  if (!u) return ''
  if (u.startsWith('//')) return 'https:' + u
  return u
}

const setFile = (f: File | null) => {
  if (previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
  logoFile.value = null

  if (!f) {
    previewUrl.value = normalizeUrl(form.value.logo_url)
    return
  }
  logoFile.value = f
  previewUrl.value = URL.createObjectURL(f)
}

const onFileChange = (e: Event) => {
  const el = e.target as HTMLInputElement
  const f = el.files?.[0] || null
  setFile(f)
}
const inputKey   = ref(0)                 // ✅ ใช้รีเฟรช input
const pickFile = () => fileInput.value?.click()
const clearFile = () => {
  setFile(null)
  // ✅ บังคับ re-render input ป้องกัน cached selection
  inputKey.value++
}

onBeforeUnmount(() => {
  if (previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

/* ---------- Watch model ---------- */
watch(
  () => props.model,
  (val) => {
    form.value = val ? { ...val } : { ...blank }
    console.log(val?.logo_url);

    logoFile.value = null
    updatePreview(null, val?.logo_url) // ✅ set preview จาก string
    if (fileInput.value) fileInput.value.value = ''
    inputKey.value++
  },
  { immediate: true }
)
/* ---------- Save ---------- */
const save = () => {
  if (!form.value.name_th?.trim()) return

  const fd = new FormData()
  if (form.value.id) fd.append('id', form.value.id)
  fd.append('name_th', form.value.name_th)
  fd.append('name_en', form.value.name_en || '')
  fd.append('website_url', form.value.website_url || '')
  fd.append('is_active', form.value.is_active ? '1' : '0')

  if (logoFile.value) {
    fd.append('logo', logoFile.value) // ✅ ส่งไฟล์ใหม่
  } else if (form.value.logo_url) {
    fd.append('logo_url', form.value.logo_url) // ✅ ส่ง string URL เดิม
  }

  emit('saved', fd)
  isOpen.value = false
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="600">
    <v-card rounded="xl">
      <v-card-title class="py-4">
        {{ isEdit ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้า' }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <v-row>
          <!-- Dropzone Upload -->
          <v-col cols="12">
            <div class="rounded-xl border-dashed" style="border: 2px dashed rgba(0,0,0,.2); padding:16px;"
              @drop.prevent="(e: any) => setFile(e.dataTransfer.files[0] || null)" @dragover.prevent>
              <div class="d-flex ga-4 align-start">
                <div class="rounded-lg"
                  style="width:160px;height:120px;overflow:hidden;background:#f3f4f6;display:grid;place-items:center;">
                       <img v-if="previewUrl" :src="previewUrl" alt="preview"
                    style="width:100%; height:100%; object-fit:cover;" />
                  <div v-else class="text-medium-emphasis text-caption">ไม่มีรูป</div>
                </div>

                <div class="flex-grow-1">
                  <div class="text-subtitle-2 mb-1">โลโก้ลูกค้า</div>
                  <div class="text-body-2 text-medium-emphasis mb-2">
                    ลากไฟล์มาวางที่นี่ หรือกดเลือกไฟล์ (.jpg .png .webp)
                  </div>

                  <div class="d-flex ga-2">
                    <v-btn variant="tonal" color="primary" @click="pickFile">เลือกไฟล์</v-btn>
                    <v-btn v-if="logoFile " variant="text" color="error" @click="clearFile">
                      ลบไฟล์
                    </v-btn>
                  </div>

                  <input   :key="inputKey" ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChange" />

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

          <v-col cols="12">
            <v-text-field v-model="form.name_th" label="ชื่อลูกค้า (ไทย)" variant="outlined" hide-details="auto"
              :rules="[v => !!v || 'กรุณากรอกชื่อ (ไทย)']" />
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="form.name_en" label="ชื่อลูกค้า (อังกฤษ)" variant="outlined" hide-details />
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="form.website_url" label="เว็บไซต์ (https://…)" variant="outlined" hide-details />
          </v-col>

          <!-- <v-col cols="12">
            <v-switch v-model="form.is_active" color="primary" label="แสดงบนหน้าเว็บไซต์" hide-details />
          </v-col> -->
        </v-row>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">ยกเลิก</v-btn>
        <v-btn color="primary" @click="save">
          {{ isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มลูกค้า' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>