<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CategoryWork } from '~/types/category_work';


const props = defineProps<{
  open: boolean
  modelValue: { category: CategoryWork | null; index: number | null } | null
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'saved', data: CategoryWork, index: number | null): void
}>()

const isOpen = ref<boolean>(props.open)
watch(() => props.open, v => (isOpen.value = v))
watch(isOpen, v => emit('update:open', v))

const blank: CategoryWork = {
  id:"",
  categories_th: '',
  categories_en: '',
  is_active: 1,
}
const form = ref<CategoryWork>({ ...blank })

const isEdit = computed(() => !!props.modelValue?.category)

watch(
  () => props.modelValue,
  (val) => {
    form.value = val?.category
      ? {
          ...val.category,
          is_active: (val.category.is_active ?? 1) as 0 | 1,
        }
      : { ...blank }
  },
  { immediate: true }
)

const save = () => {
  if (!form.value.categories_th?.trim()) return
  const now = new Date().toISOString()
  const data: CategoryWork = {
    ...form.value,
    is_active: (form.value.is_active ?? 1) as 0 | 1,
    updated_at: form.value.updated_at || now,
  }
  emit('saved', data, props.modelValue?.index ?? null)
  isOpen.value = false
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="520">
    <v-card rounded="xl">
      <v-card-title class="py-4">
        {{ isEdit ? 'แก้ไขหมวดหมู่งาน' : 'เพิ่มหมวดหมู่งาน' }}
      </v-card-title>
      <v-divider />

      <v-card-text class="pt-4">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.categories_th"
              label="ชื่อหมวดหมู่ (ไทย)"
              variant="outlined"
              :rules="[v => !!v || 'จำเป็น']"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.categories_en"
              label="ชื่อหมวดหมู่ (อังกฤษ)"
              variant="outlined"
              hide-details
            />
          </v-col>
     
        </v-row>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">ยกเลิก</v-btn>
        <v-btn color="primary" @click="save">
          {{ isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มหมวดหมู่' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>