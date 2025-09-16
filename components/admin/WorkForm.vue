<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount, onMounted } from 'vue'
import type { WorkItem } from '~/types/work'

/** เพิ่มฟิลด์ image ในชนิดที่ใช้ภายในฟอร์ม */
type WorkFormModel = WorkItem & {
  image?: File | null
}

/** ประเภทของหมวดหมู่งานที่ดึงมาแสดงใน select */
type CategoryWork = {
  id: string | number
  categories_th: string
  categories_en?: string
  is_active?: 0 | 1
  created_at?: string
  updated_at?: string
}

const props = defineProps<{
  open: boolean
  modelValue: { work: WorkItem | null; index: number | null }
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'saved', data: WorkFormModel, index: number | null): void
}>()

const { $api } = useNuxtApp()

/* ---------- Dialog state ---------- */
const isOpen = ref<boolean>(props.open)
watch(() => props.open, v => (isOpen.value = v))
watch(isOpen, v => emit('update:open', v))

/* ---------- Form Model ---------- */
const blank: WorkFormModel = {
  id: '' as any,
  title_th: '',
  title_en: '',
  image_url: '',        // url เดิม (กรณีแก้ไข)
  image: null,     // ไฟล์ใหม่ (ถ้ามี)
  categories_id: '',    // <-- เปลี่ยนเป็น string ว่าง (ให้เลือก)
  description: '',
  updated_at: ''
}

const form = ref<WorkFormModel>({ ...blank })
const isEdit = computed(() => !!props.modelValue?.work)

/* ---------- หมวดหมู่ (ดึงจาก API) ---------- */
const categories = ref<CategoryWork[]>([])
const loadingCategories = ref(false)

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    // API: /settings/category_works  (ตามที่ใช้อยู่ในระบบ)
    const res = await $api<{ status: boolean; message: string; data?: CategoryWork[] }>(
      '/settings/category_works'
    )
    categories.value = (res?.data ?? []).filter(c => (c.is_active ?? 1) === 1)
  } catch (e) {
    console.error('load categories failed:', e)
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

/* ---------- File handling ---------- */
const fileInput = ref<HTMLInputElement | null>(null)
const objectUrl = ref<string | null>(null) // สำหรับพรีวิวไฟล์ใหม่

const pickImage = () => fileInput.value?.click()

const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files[0]) return
  setImageFile(files[0])
}

const setImageFile = (file: File) => {
  form.value.image = file
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = URL.createObjectURL(file)
  // ไม่ลบ image_url เพื่อให้ backend ตัดสินใจเองว่าจะใช้ไฟล์ใหม่/เก่า
}

const clearImage = () => {
  form.value.image = null
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
}

onBeforeUnmount(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
})

/* Drag & Drop */
const onDrop = (e: DragEvent) => {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (file) setImageFile(file)
}
const onDragOver = (e: DragEvent) => e.preventDefault()

/* ---------- sync จาก parent ---------- */
watch(
  () => props.modelValue,
  (val) => {
    // cleanup object url เดิม
    if (objectUrl.value) {
      URL.revokeObjectURL(objectUrl.value)
      objectUrl.value = null
    }
    const base: WorkFormModel = val?.work
      ? { ...val.work, image: null }
      : { ...blank }

    // normalize categories_id -> string
    base.categories_id = base.categories_id ? String(base.categories_id) : ''

    form.value = base
  },
  { immediate: true }
)

/* ---------- Save ---------- */
const save = () => {
  if (!form.value.title_th?.trim()) return
  if (!form.value.categories_id) return // บังคับเลือกหมวดหมู่

  const now = new Date().toISOString()
  const data: WorkFormModel = {
    ...form.value,
    id: form.value.id,
    updated_at: form.value.updated_at || now
    // image ติดไปด้วยในอีเวนต์ saved
  }

  emit('saved', data, props.modelValue?.index ?? null)
  isOpen.value = false
}

/* พรีวิว: ถ้ามีไฟล์ใหม่ให้ใช้ objectUrl, ถ้าไม่มีก็ใช้ image_url เดิม */
const previewSrc = computed(() => objectUrl.value || form.value.image_url || '')

/* ---------- lifecycle ---------- */
onMounted(fetchCategories)
</script>

<template>
  <v-dialog v-model="isOpen" max-width="680">
    <v-card rounded="xl">
      <v-card-title class="py-4">
        {{ isEdit ? 'แก้ไขผลงาน' : 'เพิ่มผลงาน' }}
      </v-card-title>
      <v-divider />

      <v-card-text class="pt-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.title_th" label="ชื่อผลงาน (ไทย)" variant="outlined"
              :rules="[v => !!v || 'จำเป็น']" hide-details="auto" />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="form.title_en" label="ชื่อผลงาน (อังกฤษ)" variant="outlined" hide-details />
          </v-col>

          <!-- เลือกหมวดหมู่งาน -->
          <v-col cols="12" md="6">
            <v-select v-model="form.categories_id" :items="categories" :loading="loadingCategories"
              item-title="categories_th" item-value="id" variant="outlined" hide-details="auto"
              :rules="[v => !!v || 'กรุณาเลือกหมวดหมู่งาน']" label="หมวดหมู่งาน"
              :hint="form.categories_id ? '' : 'โปรดเลือกหมวดหมู่ก่อนบันทึก'" persistent-hint>
              <template #selection="{ item }">
                <span>{{categories.find(c => String(c.id) === String(form.categories_id))?.categories_th ||
                  'เลือกหมวดหมู่' }}</span>
              </template>
            </v-select>
          </v-col>

          <!-- อัปโหลดรูปแบบไฟล์ (Dropzone) -->
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
                  <div class="text-subtitle-2 mb-1">รูปผลงาน</div>
                  <div class="text-body-2 text-medium-emphasis mb-2">
                    ลากไฟล์มาวางที่นี่ หรือกดเลือกไฟล์ (รองรับ .jpg .png .webp)
                  </div>

                  <div class="d-flex ga-2">
                    <v-btn variant="tonal" color="primary" @click="pickImage">เลือกไฟล์</v-btn>
                    <v-btn v-if="form.image || objectUrl" variant="text" color="error" @click="clearImage">
                      ลบไฟล์ใหม่
                    </v-btn>
                  </div>

                  <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChange" />

                  <!-- แสดงชื่อไฟล์ที่เลือก -->
                  <div v-if="form.image" class="mt-2 text-body-2">
                    ไฟล์ที่เลือก: <b>{{ form.image.name }}</b>
                  </div>

                  <!-- ถ้ายังไม่มีไฟล์ใหม่ แต่มีรูปเดิม -->
                  <div v-else-if="form.image_url" class="mt-2 text-body-2 text-medium-emphasis">
                    ใช้รูปเดิมจาก <span class="text-primary">{{ form.image_url }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- คำอธิบาย -->
          <v-col cols="12">
            <v-textarea v-model="form.description" label="คำอธิบาย" variant="outlined" auto-grow rows="3"
              hide-details />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">ยกเลิก</v-btn>
        <v-btn color="primary" @click="save">
          {{ isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มผลงาน' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>