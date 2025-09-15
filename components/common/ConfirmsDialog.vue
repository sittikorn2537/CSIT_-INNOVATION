<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  color?: string
  icon?: string
  loading?: boolean
}>(), {
  title: 'ยืนยันการลบ',
  message: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
  confirmText: 'ลบ',
  cancelText: 'ยกเลิก',
  color: 'error',
  icon: 'mdi-alert-circle-outline',
  loading: false
})

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const model = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const onCancel = () => { emit('cancel'); emit('update:open', false) }
const onConfirm = () => emit('confirm')
</script>

<template>
  <v-dialog v-model="model" max-width="460">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center ga-2 py-4">
        <v-avatar size="36" :color="color" variant="tonal">
          <v-icon :icon="icon" :color="color" />
        </v-avatar>
        <span class="text-h6">{{ title }}</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4 text-medium-emphasis">
        <div v-html="message" />
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="onCancel">{{ cancelText }}</v-btn>
        <v-btn :color="color" :loading="loading" @click="onConfirm">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>