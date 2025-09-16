<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount, onMounted } from 'vue'
import type { ProductItem } from '~/types/product';

/** Props & Emits */
const props = defineProps<{
  open: boolean
  modelValue: ProductItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'saved', data: FormData, index: number | null): void
}>()

/** Dialog state */
const isOpen = ref(props.open)
watch(() => props.open, v => (isOpen.value = v))
watch(isOpen, v => emit('update:open', v))

/** Form state */
const blank: ProductItem = {
  id: '' as any,
  categories_id: '0',
  product_name_th: '',
  product_name_en: '',
  product_image_url: '',
  product_link: '',
  description_th: '',
  description_en: '',
  price: '',
  sales_price: '',
  rating: '',
  updated_at: ''
}
const form = ref<ProductItem>({ ...blank })
const isEdit = computed(() => !!props.modelValue?.id)

/** --------- Upload & Preview --------- */
const fileInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)
const objectUrl = ref<string>('')

const normalizeUrl = (u?: string) => {
  if (!u) return ''
  if (u.startsWith('//')) return 'https:' + u
  return u
}

const previewSrc = computed(() => {
  if (objectUrl.value) return objectUrl.value
  return normalizeUrl(form.value.product_image_url || '')
})

const revokeURL = () => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = ''
  }
}

const setFile = (f: File | null) => {
  revokeURL()
  imageFile.value = null
  if (!f) return
  if (!/image\/(jpeg|png|webp|gif)/i.test(f.type)) return
  imageFile.value = f
  objectUrl.value = URL.createObjectURL(f)
}

const pickImage = () => fileInput.value?.click()
const onFileChange = (e: Event) => {
  const el = e.target as HTMLInputElement
  setFile(el.files?.[0] || null)
}
const onDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation() }
const onDrop = (e: DragEvent) => {
  e.preventDefault(); e.stopPropagation()
  const f = e.dataTransfer?.files?.[0] || null
  setFile(f)
}
const clearImage = () => { setFile(null); if (fileInput.value) fileInput.value.value = '' }

onBeforeUnmount(revokeURL)

/** --------- Categories --------- */
interface Category {
  id: string
  name_th: string
  name_en?: string
}
const categories = ref<Category[]>([])

const { $api } = useNuxtApp()
const fetchCategories = async () => {
  try {
    const res = await $api<{ status: boolean; data: Category[] }>('/settings/categories')
    categories.value = [
      { id: '0', name_th: 'เลือกหมวดหมู่สินค้า' }, // ✅ option พิเศษ
      ...(res.data || [])
    ]
  } catch (err) {
    console.error('โหลด categories ไม่ได้', err)
  }
}
onMounted(fetchCategories)

/** --------- Watch Model --------- */
watch(
  () => props.modelValue,
  (val) => {
    form.value = val ? { ...val } : { ...blank }
    clearImage()
  },
  { immediate: true }
)

/** --------- Save --------- */
const save = () => {
  if (!form.value.product_name_th?.trim()) return

  const fd = new FormData()

  // helper: append เฉพาะเมื่อมีค่า และแปลงเป็น string เสมอ
  const appendStr = (key: string, val: unknown) => {
    if (val === undefined || val === null) return
    fd.append(key, String(val))
  }

  // id (อัปเดต)
  appendStr('product_id', form.value.id)

  // ✅ ต้องเป็น string
  appendStr('categories_id', form.value.categories_id || '') // ถ้าเป็น number จะถูก String() เป็น "1" เป็นต้น

  appendStr('product_name_th', form.value.product_name_th)
  appendStr('product_name_en', form.value.product_name_en || '')
  appendStr('product_link', form.value.product_link || '')

   appendStr('description_th', form.value.description_th)
  appendStr('description_en', form.value.description_en || '')

  // ✅ price / sales_price / rating อาจเป็น number → แปลงเป็น string
  appendStr('price', form.value.price || '')
  appendStr('sales_price', form.value.sales_price || '')
  appendStr('rating', form.value.rating || '')

  // รูป
  if (imageFile.value) {
    fd.append('product_image', imageFile.value) // File
  } else if (form.value.product_image_url) {
    appendStr('product_image_url', form.value.product_image_url) // string
  }

  emit('saved', fd, null)
  isOpen.value = false
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="720">
    <v-card rounded="xl">
      <v-card-title class="py-4">
        {{ isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า' }}
      </v-card-title>
      <v-divider />

      <v-card-text class="pt-4">
        <v-row>
          <!-- Dropzone Upload -->
          <v-col cols="12">
            <div class="rounded-xl border-dashed" style="border:2px dashed rgba(0,0,0,.15);padding:16px;" @drop="onDrop"
              @dragover="onDragOver">
              <div class="d-flex ga-4 align-start">
                <div class="rounded-lg"
                  style="width:160px;height:120px;overflow:hidden;background:#f3f4f6;display:grid;place-items:center;">
                  <img v-if="previewSrc" :src="previewSrc" alt="preview"
                    style="width:100%;height:100%;object-fit:cover;" />
                  <div v-else class="text-medium-emphasis text-caption">ไม่มีรูป</div>
                </div>

                <div class="flex-grow-1">
                  <div class="text-subtitle-2 mb-1">รูปสินค้า</div>
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

                  <div v-if="imageFile" class="mt-2 text-body-2">
                    ไฟล์ที่เลือก: <b>{{ imageFile.name }}</b>
                  </div>
                  <div v-else-if="form.product_image_url" class="mt-2 text-body-2 text-medium-emphasis">
                    ใช้รูปเดิมจาก <span class="text-primary">{{ form.product_image_url }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Category Select -->






          <v-col cols="12" md="6">
            <v-text-field v-model="form.product_name_th" label="ชื่อสินค้า (ไทย)" variant="outlined" hide-details="auto"
              :rules="[v => !!v || 'จำเป็น']" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.product_name_en" label="ชื่อสินค้า (อังกฤษ)" variant="outlined" hide-details />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea v-model="form.description_th" label="รายละเอียดสินค้า (ไทย)" rows="3" auto-grow />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea v-model="form.description_en" label="รายละเอียดสินค้า (อังกฤษ)" rows="3" auto-grow />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.price" label="ราคา (ปกติ)" variant="outlined" hide-details prefix="฿" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.sales_price" label="ราคา (ลด)" variant="outlined" hide-details prefix="฿" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.rating" label="เรตติ้ง (0–5)" variant="outlined" hide-details />
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="form.categories_id" :items="categories" item-title="name_th" item-value="id"
              label="หมวดหมู่สินค้า" placeholder="เลือกหมวดหมู่สินค้า" variant="outlined" hide-details clearable />
          </v-col>

        </v-row>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">ยกเลิก</v-btn>
        <v-btn color="primary" @click="save">
          {{ isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสินค้า' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>