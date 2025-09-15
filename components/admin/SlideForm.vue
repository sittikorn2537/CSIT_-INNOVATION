<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { SlideItem } from '~/types/slideItem'

// ✅ Props/Emit
const props = defineProps<{
  open: boolean
  modelValue: { slide: SlideItem | null; index: number | null }
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'saved', data: FormData, index: number | null): void
}>()

// ✅ Dialog state
const isOpen = ref(props.open)
watch(() => props.open, v => (isOpen.value = v))
watch(isOpen, v => emit('update:open', v))

// ✅ ฟอร์ม state
const blank: SlideItem = {
  id: '' as any,
  eyebrow: '',
  title_th: '',
  title_en: '',
  subtitle_th: '',
  subtitle_en: '',
  src: '',
  ctaText_th: '',
  ctaText_en: '',
  ctaTo: '',
  updated_at: ''
}
const form = ref<SlideItem>({ ...blank })

const isEdit = computed(() => !!props.modelValue?.slide)

// ---------- File & Preview ----------
const fileInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)     // ไฟล์ใหม่ที่เลือก
const objectUrl = ref<string>('')            // URL.createObjectURL สำหรับพรีวิว

const previewSrc = computed(() => {
  // ถ้ามีไฟล์ใหม่ → ใช้ objectUrl
  if (objectUrl.value) return objectUrl.value
  // ถ้าไม่มีไฟล์ใหม่ → ใช้รูปเดิมจาก form.src (ถ้ามี)
  return form.value.src || ''
})

// helper: เซ็ตไฟล์ + พรีวิว
const setFile = (f: File) => {
  if (!f) return
  // ตรวจชนิดไฟล์แบบเบา ๆ
  if (!/image\/(jpeg|png|webp|gif)/i.test(f.type)) {
    // คุณอาจขึ้น alert/Toast ก็ได้
    return
  }
  // ล้างของเดิม
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  imageFile.value = f
  objectUrl.value = URL.createObjectURL(f)
}

const pickImage = () => fileInput.value?.click()

const onFileChange = (e: Event) => {
  const el = e.target as HTMLInputElement
  const f = el.files?.[0]
  if (f) setFile(f)
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  const f = e.dataTransfer?.files?.[0]
  if (f) setFile(f)
}

const clearImage = () => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  imageFile.value = null
  objectUrl.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

// เวลาดึงค่ามา edit
watch(
  () => props.modelValue,
  (val) => {
    form.value = val?.slide ? { ...val.slide } : { ...blank }
    // รีเซ็ต file/pvw
    clearImage()
  },
  { immediate: true }
)

// ✅ Save → ส่งเป็น FormData (support รูปแบบ form-data เท่านั้น)
const save = () => {
  if (!form.value.title_th?.trim()) return
  const now = new Date().toISOString()

  const fd = new FormData()
  if (form.value.id) fd.append('id', String(form.value.id))
  fd.append('eyebrow', form.value.eyebrow || '')
  fd.append('title_th', form.value.title_th)
  fd.append('title_en', form.value.title_en || '')
  fd.append('subtitle_th', form.value.subtitle_th || '')
  fd.append('subtitle_en', form.value.subtitle_en || '')
  fd.append('ctaText_th', form.value.ctaText_th || '')
  fd.append('ctaText_en', form.value.ctaText_en || '')
  fd.append('ctaTo', form.value.ctaTo || '')
  fd.append('updated_at', form.value.updated_at || now)

  // แนบไฟล์ถ้ามี → ให้ backend สร้าง URL และตอบกลับ src ใหม่
  if (imageFile.value) {
    fd.append('src', imageFile.value)
  } else if (form.value.src) {
    // ไม่มีไฟล์ใหม่แต่มีรูปเดิม → ส่งค่า src เดิมเป็น string ไปด้วย (แล้วแต่ backend จะใช้/เมิน)
    fd.append('src', form.value.src)
  }

  emit('saved', fd, props.modelValue?.index ?? null)
  isOpen.value = false
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="720">
    <v-card rounded="xl">
      <v-card-title class="py-4">{{ isEdit ? 'แก้ไขสไลด์' : 'เพิ่มสไลด์' }}</v-card-title>
      <v-divider />

      <v-card-text class="pt-4">
        <v-row>
          <!-- ===== Dropzone Upload Area (ใหม่) ===== -->
          <v-col cols="12">
            <div class="rounded-xl border-dashed" style="border: 2px dashed rgba(0,0,0,.15); padding: 16px;"
              @drop="onDrop" @dragover="onDragOver">
              <div class="d-flex ga-4 align-start">
                <div class="rounded-lg"
                  style="width: 160px; height: 120px; overflow: hidden; background: #f3f4f6; display:grid; place-items:center;">
                  <img v-if="previewSrc" :src="previewSrc" alt="preview"
                    style="width:100%; height:100%; object-fit:cover;" />
                  <div v-else class="text-medium-emphasis text-caption">ไม่มีรูป</div>
                </div>

                <div class="flex-grow-1">
                  <div class="text-subtitle-2 mb-1">รูปสไลด์ (แนะนำสัดส่วน 16:9)</div>
                  <div class="text-body-2 text-medium-emphasis mb-2">
                    ลากไฟล์มาวางที่นี่ หรือกดเลือกไฟล์ (รองรับ .jpg .png .webp .gif)
                  </div>

                  <div class="d-flex ga-2">
                    <v-btn variant="tonal" color="primary" @click="pickImage">เลือกไฟล์</v-btn>
                    <v-btn v-if="imageFile || objectUrl" variant="text" color="error" @click="clearImage">
                      ลบไฟล์ใหม่
                    </v-btn>
                  </div>

                  <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChange" />

                  <!-- แสดงชื่อไฟล์ที่เลือก -->
                  <div v-if="imageFile" class="mt-2 text-body-2">
                    ไฟล์ที่เลือก: <b>{{ imageFile.name }}</b>
                  </div>

                  <!-- ถ้ายังไม่มีไฟล์ใหม่ แต่มีรูปเดิม -->
                  <div v-else-if="form.src" class="mt-2 text-body-2 text-medium-emphasis">
                    ใช้รูปเดิมจาก <span class="text-primary">{{ form.src }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
          <!-- ===== /Dropzone Upload Area ===== -->
          <v-col cols="12" md="6">
            <v-text-field v-model="form.eyebrow" label="Eyebrow" variant="outlined" hide-details />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.ctaTo" label="CTA Link (ctaTo)" variant="outlined" hide-details />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="form.title_th" label="ชื่อเรื่อง (ไทย)" variant="outlined"
              :rules="[v => !!v || 'จำเป็น']" hide-details="auto" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.title_en" label="ชื่อเรื่อง (อังกฤษ)" variant="outlined" hide-details />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="form.subtitle_th" label="คำอธิบายย่อย (ไทย)" variant="outlined" hide-details />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.subtitle_en" label="คำอธิบายย่อย (อังกฤษ)" variant="outlined" hide-details />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="form.ctaText_th" label="CTA Text (ไทย)" variant="outlined" hide-details />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.ctaText_en" label="CTA Text (อังกฤษ)" variant="outlined" hide-details />
          </v-col>


        </v-row>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">ยกเลิก</v-btn>
        <v-btn color="primary" @click="save">
          {{ isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสไลด์' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>