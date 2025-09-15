<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Category } from '@/types/category'

const props = defineProps<{
  open: boolean
  modelValue: { category: Category | null; index: number | null }
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'saved', data: Category, index: number | null): void
}>()

const isOpen = ref<boolean>(props.open)
watch(() => props.open, v => (isOpen.value = v))
watch(isOpen, v => emit('update:open', v))

const blank: Category = {
  id: '',
  name_th: '',
  name_en: '',
  description: '',
  created_at: '',
  updated_at: ''
}
const form = ref<Category>({ ...blank })

const isEdit = computed(() => !!props.modelValue?.category)

watch(
  () => props.modelValue,
  (val) => {
    form.value = val?.category ? { ...val.category } : { ...blank }
  },
  { immediate: true }
)

const save = () => {
  const now = new Date().toISOString()
  if (!form.value.id) {
    // create mode → generate id ใหม่
    // form.value.id = 'cat' + Math.random().toString().slice(2, 6)
    form.value.created_at = now
  }
  form.value.updated_at = now

  emit('saved', { ...form.value }, props.modelValue?.index ?? null)
  isOpen.value = false
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card>
      <v-card-title>{{ isEdit ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่' }}</v-card-title>
      <v-card-text class="d-flex flex-column ga-3">
        <v-text-field v-model="form.name_th" label="ชื่อหมวดหมู่ (TH)" />
        <v-text-field v-model="form.name_en" label="ชื่อหมวดหมู่ (EN)" />
        <v-textarea
          v-model="form.description"
          label="รายละเอียดหมวดหมู่"
          rows="3"
          auto-grow
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">ยกเลิก</v-btn>
        <v-btn color="primary" @click="save">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>