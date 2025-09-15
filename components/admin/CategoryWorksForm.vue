<script setup lang="ts">
import { ref, watch, computed } from 'vue'

type CategoryWork = {
  id: string
  name_th: string
  name_en: string
  created_at?: string
  updated_at?: string
}

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
  id: '',
  name_th: '',
  name_en: '',
  created_at: '',
  updated_at: ''
}
const form = ref<CategoryWork>({ ...blank })

const isEdit = computed(() => !!props.modelValue?.category)

watch(
  () => props.modelValue,
  (val) => {
    form.value = val?.category ? { ...val.category } : { ...blank }
  },
  { immediate: true }
)

const nameRules = [(v: string) => !!(v && v.trim()) || 'กรุณากรอกชื่อ (ไทย)']

const close = () => (isOpen.value = false)

const save = () => {
  if (!form.value.name_th?.trim()) return
  const now = new Date().toISOString()

  // ถ้าเป็นสร้างใหม่และ backend อาจไม่คืน id → ใส่ temp id ไว้ก่อน
  if (!form.value.id) form.value.id = crypto.randomUUID()
  if (!form.value.created_at) form.value.created_at = now
  form.value.updated_at = now

  emit('saved', { ...form.value }, props.modelValue?.index ?? null)
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
              v-model="form.name_th"
              label="ชื่อหมวดหมู่ (ไทย)"
              variant="outlined"
              :rules="nameRules"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.name_en"
              label="ชื่อหมวดหมู่ (อังกฤษ)"
              variant="outlined"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="close">ยกเลิก</v-btn>
        <v-btn color="primary" @click="save">
          {{ isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มหมวดหมู่' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>