<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import type { WorkItem } from '~/types/work'

/** เพิ่มฟิลด์ image_file ในชนิดที่ใช้ภายในฟอร์ม */
type WorkFormModel = WorkItem & {
  image_file?: File | null
}

const props = defineProps<{
  open: boolean
  modelValue: { work: WorkItem | null; index: number | null }
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'saved', data: WorkFormModel, index: number | null): void
}>()

const isOpen = ref<boolean>(props.open)
watch(() => props.open, v => (isOpen.value = v))
watch(isOpen, v => emit('update:open', v))

const blank: WorkFormModel = {
  id: '' as any,
  title_th: '',
  title_en: '',
  image_url: '',        // เก็บ url เดิมเพื่อแสดงพรีวิวได้ตอนแก้ไข
  image_file: null,     // <-- ไฟล์ใหม่ (ถ้ามี)
  categories: '',
  updated_at: ''
}

const form = ref<WorkFormModel>({ ...blank })
const isEdit = computed(() => !!props.modelValue?.work)

/** ---------- File handling ---------- */
const fileInput = ref<HTMLInputElement | null>(null)
const objectUrl = ref<string | null>(null) // สำหรับพรีวิวไฟล์ใหม่

const pickImage = () => fileInput.value?.click()

const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files[0]) return
  setImageFile(files[0])
}

const setImageFile = (file: File) => {
  form.value.image_file = file
  // clear url เดิมเพื่อกันสับสน (ให้แสดงรูปใหม่)
  // หรือจะคงไว้ก็ได้ แต่พรีวิวจะใช้ objectUrl ถ้ามี
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = URL.createObjectURL(file)
}

const clearImage = () => {
  form.value.image_file = null
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
  // ไม่ลบ image_url เดิม เพื่อให้ยังเห็นรูปเก่าได้ถ้ายังไม่อัปโหลดใหม่
}

onBeforeUnmount(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
})

/** Drag & Drop */
const onDrop = (e: DragEvent) => {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (file) setImageFile(file)
}
const onDragOver = (e: DragEvent) => e.preventDefault()

/** ---------- sync จาก parent ---------- */
watch(
  () => props.modelValue,
  (val) => {
    // reset state
    if (objectUrl.value) {
      URL.revokeObjectURL(objectUrl.value)
      objectUrl.value = null
    }
    const base: WorkFormModel = val?.work ? { ...val.work, image_file: null } : { ...blank }
    form.value = base
  },
  { immediate: true }
)

/** ---------- Save ---------- */
const save = () => {
  if (!form.value.title_th?.trim()) return

  const now = new Date().toISOString()
  const data: WorkFormModel = {
    ...form.value,
    id: form.value.id || crypto.randomUUID(),
    updated_at: form.value.updated_at || now
    // image_file ติดไปด้วยในอีเวนต์ saved
  }

  emit('saved', data, props.modelValue?.index ?? null)
  isOpen.value = false
}

/** พรีวิว: ถ้ามีไฟล์ใหม่ให้ใช้ objectUrl, ถ้าไม่มีก็ใช้ image_url เดิม */
const previewSrc = computed(() => objectUrl.value || form.value.image_url || '')
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
          <v-col cols="12">
            <v-text-field
              v-model="form.title_th"
              label="ชื่อผลงาน (ไทย)"
              variant="outlined"
              :rules="[v => !!v || 'จำเป็น']"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.title_en"
              label="ชื่อผลงาน (อังกฤษ)"
              variant="outlined"
              hide-details
            />
          </v-col>

          <!-- อัปโหลดรูปแบบไฟล์ -->
          <v-col cols="12">
            <div
              class="rounded-xl border-dashed"
              style="border: 2px dashed rgba(0,0,0,.15); padding: 16px;"
              @drop="onDrop"
              @dragover="onDragOver"
            >
              <div class="d-flex ga-4 align-start">
                <div
                  class="rounded-lg"
                  style="width: 160px; height: 120px; overflow: hidden; background: #f3f4f6; display:grid; place-items:center;"
                >
                  <img
                    v-if="previewSrc"
                    :src="previewSrc"
                    alt="preview"
                    style="width:100%; height:100%; object-fit:cover;"
                  />
                  <div v-else class="text-medium-emphasis text-caption">ไม่มีรูป</div>
                </div>

                <div class="flex-grow-1">
                  <div class="text-subtitle-2 mb-1">รูปผลงาน</div>
                  <div class="text-body-2 text-medium-emphasis mb-2">
                    ลากไฟล์มาวางที่นี่ หรือกดเลือกไฟล์ (รองรับ .jpg .png .webp)
                  </div>

                  <div class="d-flex ga-2">
                    <v-btn variant="tonal" color="primary" @click="pickImage">เลือกไฟล์</v-btn>
                    <v-btn v-if="form.image_file || objectUrl" variant="text" color="error" @click="clearImage">
                      ลบไฟล์ใหม่
                    </v-btn>
                  </div>

                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="d-none"
                    @change="onFileChange"
                  />

                  <!-- แสดงชื่อไฟล์ที่เลือก -->
                  <div v-if="form.image_file" class="mt-2 text-body-2">
                    ไฟล์ที่เลือก: <b>{{ form.image_file.name }}</b>
                  </div>

                  <!-- ถ้ายังไม่มีไฟล์ใหม่ แต่มีรูปเดิม -->
                  <div v-else-if="form.image_url" class="mt-2 text-body-2 text-medium-emphasis">
                    ใช้รูปเดิมจาก <span class="text-primary">{{ form.image_url }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.categories"
              label="คำอธิบาย"
              variant="outlined"
              auto-grow
              rows="3"
              hide-details
            />
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