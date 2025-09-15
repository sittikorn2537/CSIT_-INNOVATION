<!-- components/products/ProductForm.vue -->
<template>
  <v-dialog v-model="open" max-width="1100" persistent>
    <v-card rounded="xl">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <div class="text-h6">{{ isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า' }}</div>
          <div class="text-medium-emphasis text-body-2">
            กรอกข้อมูลให้ครบถ้วน & อัปโหลดรูปให้ชัดเจน
          </div>
        </div>
        <div class="d-flex ga-3 align-center">
          <v-btn variant="outlined" rounded="xl" @click="onClose">ยกเลิก</v-btn>
          <v-btn :loading="saving" color="primary" rounded="xl" @click="save">
            {{ isEdit ? 'บันทึกการแก้ไข' : 'บันทึกสินค้า' }}
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <!-- Body -->
      <v-card-text>
        <v-row>
          <!-- LEFT -->
          <v-col cols="12" lg="6">
            <!-- Category -->
            <v-label class="mb-2">หมวดหมู่สินค้า *</v-label>
            <div class="d-flex ga-2">
              <v-select
                v-model="form.category_id"
                :items="categories"
                item-title="name_th"
                item-value="id"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details="auto"
                class="flex-1"
                placeholder="— เลือกหมวดหมู่ —"
              />
              <v-btn variant="outlined" rounded="lg" @click="quickAddCategory">เพิ่ม</v-btn>
            </div>
            <v-messages
              v-if="errors.category_id"
              :value="[errors.category_id]"
              class="mt-1 text-error"
            />

            <!-- Name -->
            <div class="mt-4">
              <v-label class="mb-2">ชื่อสินค้า</v-label>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.name_th"
                    label="ชื่อสินค้า (ไทย) *"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    hide-details="auto"
                  />
                  <v-messages
                    v-if="errors.name_th"
                    :value="[errors.name_th]"
                    class="mt-1 text-error"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.name_en"
                    label="Product name (EN)"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Short desc -->
            <div class="mt-4">
              <v-label class="mb-2">รายละเอียดแบบย่อ</v-label>
              <v-row>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="form.short_desc_th"
                    label="รายละเอียดแบบย่อ (ไทย)"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    auto-grow
                    maxlength="160"
                    hide-details
                  />
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ (form.short_desc_th ?? '').length }}/160
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="form.short_desc_en"
                    label="Short description (EN)"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    auto-grow
                    maxlength="160"
                    hide-details
                  />
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ (form.short_desc_en ?? '').length }}/160
                  </div>
                </v-col>
              </v-row>
            </div>

            <!-- Description -->
            <div class="mt-4">
              <v-label class="mb-2">รายละเอียดสินค้า</v-label>
              <v-row>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="form.description_th"
                    label="รายละเอียดสินค้า (ไทย)"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    auto-grow
                    rows="6"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="form.description_en"
                    label="Description (EN)"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    auto-grow
                    rows="6"
                    hide-details
                  />
                </v-col>
              </v-row>
            </div>
          </v-col>

          <!-- RIGHT -->
          <v-col cols="12" lg="6">
            <v-label class="mb-2">ภาพสินค้า</v-label>
            <v-sheet
              class="d-flex flex-column align-center justify-center text-center ga-3"
              rounded="xl"
              color="grey-lighten-4"
              border="dashed"
              height="180"
            >
              <input
                ref="fileEl"
                type="file"
                accept="image/*"
                class="d-none"
                @change="onFile"
              />
              <v-avatar size="48" color="white"
                ><v-icon icon="mdi-cloud-upload"
              /></v-avatar>
              <div class="text-body-2 text-medium-emphasis">
                ลากไฟล์มาวาง หรือ
              </div>
              <v-btn variant="outlined" rounded="xl" @click="fileEl?.click()"
                >เลือกไฟล์</v-btn
              >
              <div v-if="uploading" class="text-caption text-medium-emphasis">
                กำลังอัปโหลด…
              </div>
            </v-sheet>

            <div v-if="form.image_url" class="mt-3">
              <v-img
                :src="form.image_url"
                aspect-ratio="16/9"
                rounded="lg"
                class="elevation-1"
                cover
              />
              <div class="d-flex ga-2 mt-2">
                <v-btn
                  variant="outlined"
                  rounded="lg"
                  @click="form.image_url = ''"
                  >ลบรูป</v-btn
                >
                <v-btn
                  variant="outlined"
                  rounded="lg"
                  :href="form.image_url"
                  target="_blank"
                  >เปิดรูป</v-btn
                >
              </div>
            </div>

            <!-- Preview card -->
            <v-card class="mt-4" rounded="xl" variant="tonal">
              <v-card-text>
                <div class="d-flex ga-3">
                  <v-avatar size="80" rounded="lg" variant="tonal">
                    <v-img :src="form.image_url || placeholder" cover />
                  </v-avatar>
                  <div class="flex-1">
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ form.name_th || 'ชื่อสินค้า' }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ catTitle(form.category_id) || 'หมวดหมู่' }}
                    </div>
                    <div class="text-body-2 mt-1">
                      {{
                        form.short_desc_th || 'รายละเอียดแบบย่อจะแสดงที่นี่'
                      }}
                    </div>
                    <div
                      v-if="form.name_en"
                      class="text-caption mt-1 text-medium-emphasis"
                    >
                      EN: {{ form.name_en }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'

const props = defineProps<{ open: boolean; categories: any[]; modelValue: any | null }>()
const emit = defineEmits(['update:open', 'saved'])

const open = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

const isEdit = ref(false)
const fileEl = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const saving = ref(false)
const placeholder = 'https://placehold.co/120x120?text=Preview'

/** ฟอร์ม 2 ภาษา */
const form = reactive({
  id: '',
  category_id: '',
  image_url: '',
  name_th: '',
  name_en: '',
  short_desc_th: '',
  short_desc_en: '',
  description_th: '',
  description_en: '',
})

const errors = reactive<{ [k: string]: string }>({})

/** แสดงชื่อหมวดหมู่ */
const catTitle = (id: string) => {
  const c = props.categories.find((c) => c.id === id)
  return c?.name_th || ''
}

const validate = () => {
  errors.category_id = form.category_id ? '' : 'กรุณาเลือกหมวดหมู่'
  errors.name_th = form.name_th ? '' : 'กรุณากรอกชื่อสินค้า (ไทย)'
  return !errors.category_id && !errors.name_th
}

const quickAddCategory = async () => {
  const nameTh = prompt('ชื่อหมวดหมู่ (ไทย)')
  if (!nameTh?.trim()) return
  const nameEn = prompt('Category name (English)') || ''
  // TODO: POST ไป backend แล้วให้ parent โหลดใหม่
}

const onFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    // upload file logic
    // form.image_url = uploadedUrl
  } finally {
    uploading.value = false
  }
}

const save = async () => {
  if (!validate()) return
  saving.value = true
  try {
    
    const payload = { ...form }
    console.log(payload);

    emit('saved', { mode: isEdit.value ? 'update' : 'create', data: payload })
    open.value = false
  } finally {
    saving.value = false
  }
}

const onClose = () => (open.value = false)

/** watch modelValue -> reset form */
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      // เพิ่มสินค้าใหม่
      isEdit.value = false
      form.id = ''
      form.category_id = ''
      form.image_url = ''
      form.name_th = ''
      form.name_en = ''
      form.short_desc_th = ''
      form.short_desc_en = ''
      form.description_th = ''
      form.description_en = ''
    } else {
      // แก้ไขสินค้า
      isEdit.value = true
      form.id = val.id || val._id || ''
      form.category_id = val.category_id || ''
      form.image_url = val.image_url || ''
      form.name_th = val.name_th || val.name || ''
      form.name_en = val.name_en || ''
      form.short_desc_th = val.short_desc_th || ''
      form.short_desc_en = val.short_desc_en || ''
      form.description_th = val.description_th || ''
      form.description_en = val.description_en || ''
    }
  },
  { immediate: true }
)
</script>