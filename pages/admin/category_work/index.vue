<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import CategoryWorkForm from '@/components/admin/CategoryWorksForm.vue'
import ConfirmDialog from '@/components/common/ConfirmsDialog.vue'
import type { CategoryWork } from '~/types/category_work'
import type { ApiResponse } from '~/types/api'

/** ==== State ==== */
const all = ref<CategoryWork[]>([])
const items = ref<CategoryWork[]>([])
const loading = ref(false)

const search  = ref('')
const page    = ref(1)
const perPage = ref(10)
const hasMore = ref(false)

const showForm = ref(false)
const editing  = ref<{ category: CategoryWork | null; index: number | null } | null>({
  category: null,
  index: null
})

/* confirm delete */
const showConfirm = ref(false)
const deleting = ref(false)
const deleteTarget = ref<{ id: number|string; name?: string } | null>(null)

/** ==== Utils ==== */
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')
const asKey = (v: string | number | undefined | null) => String(v ?? '')

/** ==== API ==== */
const { $api } = useNuxtApp()

const apiList = async (): Promise<CategoryWork[]> => {
  const res = await $api<ApiResponse<CategoryWork[]>>('/settings/category_works')
  return res.data ?? []
}
const apiCreate = async (payload: Omit<CategoryWork, 'id'|'created_at'|'updated_at'>) => {
  const res = await $api<ApiResponse<CategoryWork>>('/settings/category_works', { method: 'POST', body: payload })
  return res.data ?? { id: crypto.randomUUID(), ...payload }
}
const apiUpdate = async (id: number|string, payload: Partial<CategoryWork>) => {
  const res = await $api<ApiResponse<CategoryWork>>(`/settings/category_works/${id}`, { method: 'POST', body: payload })
  return res.data ?? { id, ...payload } as CategoryWork
}
const apiDelete = async (id: number|string) => {
  await $api(`/settings/category_works/${id}`, { method: 'DELETE' })
}

/** ==== Load + filter + paginate ==== */
const fetchAll = async () => {
  loading.value = true
  try { all.value = await apiList() } finally { loading.value = false }
  filterAndPaginate()
}
const filterAndPaginate = () => {
  let data = all.value.slice()
  const q = search.value.trim().toLowerCase()
  if (q) data = data.filter(c => [c.categories_th, c.categories_en].some(v => (v || '').toLowerCase().includes(q)))
  const start = (page.value - 1) * perPage.value
  const end   = start + perPage.value
  hasMore.value = end < data.length
  items.value = data.slice(start, end)
}

/** ==== UI actions ==== */
const openForm = (c: CategoryWork|null=null, absIndex:number|null=null) => {
  const clone = c ? JSON.parse(JSON.stringify(c)) as CategoryWork : null
  editing.value = { category: clone, index: absIndex }
  showForm.value = true
}
const onSaved = async (data: CategoryWork) => {
  loading.value = true
  try {
    let saved: CategoryWork
    if (data.id) {
      saved = await apiUpdate(data.id, {
        categories_th: data.categories_th,
        categories_en: data.categories_en,
        is_active: data.is_active ?? 1
      })
      const pos = all.value.findIndex(x => asKey(x.id) === asKey(saved.id))
      if (pos > -1) all.value[pos] = { ...all.value[pos], ...saved }
    } else {
      saved = await apiCreate({
        categories_th: data.categories_th,
        categories_en: data.categories_en,
        is_active: data.is_active ?? 1
      })
      all.value.unshift(saved)
    }
  } finally {
    loading.value = false
    showForm.value = false
    filterAndPaginate()
  }
}

const askDelete = (row: CategoryWork) => {
  deleteTarget.value = { id: row.id, name: row.categories_th || row.categories_en }
  showConfirm.value = true
}
const confirmDelete = async () => {
  if (!deleteTarget.value) return
  try {
    deleting.value = true
    await apiDelete(deleteTarget.value.id)
    all.value = all.value.filter(x => asKey(x.id) !== asKey(deleteTarget.value!.id))
    filterAndPaginate()
  } finally {
    deleting.value = false
    showConfirm.value = false
    deleteTarget.value = null
  }
}

/** ==== lifecycle ==== */
onMounted(fetchAll)
watch([search], () => { page.value = 1; filterAndPaginate() })
watch(page, filterAndPaginate)
</script>

<template>
  <v-container class="py-6" fluid>
    <!-- Header -->
    <div class="d-flex flex-column gap-3 mb-4">
      <div>
        <h2 class="text-h6 text-sm-h5 font-weight-medium mb-1">หมวดหมู่งาน</h2>
        <div class="text-medium-emphasis text-body-2">เพิ่ม/แก้ไข/ลบ หมวดหมู่งาน (API: /settings/category_works)</div>
      </div>
      <div class="d-flex flex-wrap align-center ga-2">
        <v-text-field v-model="search" class="flex-grow-1" density="comfortable" variant="solo" hide-details rounded="xl"
          prepend-inner-icon="mdi-magnify" placeholder="ค้นหา…" style="min-width:220px" />
        <v-btn color="primary" rounded="xl" class="ms-auto" @click="openForm()">
          <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มหมวดหมู่
        </v-btn>
      </div>
    </div>

    <!-- Table -->
    <v-card rounded="xl" elevation="1">
      <v-table class="text-body-2 pa-5">
        <thead>
          <tr>
            <th class="px-4 py-3">ชื่อ (TH)</th>
            <th class="px-4 py-3">ชื่อ (EN)</th>
            <th class="px-4 py-3">อัปเดต</th>
            <th class="px-4 py-3 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c,i) in items" :key="c.id" class="hover:bg-surface">
            <td class="px-4 py-3 font-weight-medium">{{ c.categories_th }}</td>
            <td class="px-4 py-3">{{ c.categories_en }}</td>
            <td class="px-4 py-3 text-medium-emphasis">{{ fmtDate(c.updated_at) }}</td>
            <td class="px-4 py-3">
              <div class="d-flex justify-end ga-2">
                <v-btn size="small" variant="tonal" @click="openForm(c, (page-1)*perPage+i)">แก้ไข</v-btn>
                <v-btn size="small" color="error" variant="tonal" @click="askDelete(c)">ลบ</v-btn>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && items.length===0">
            <td colspan="4" class="px-6 py-10 text-center text-medium-emphasis">ยังไม่มีหมวดหมู่</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Pagination -->
    <div class="d-flex justify-end align-center ga-2 mt-4">
      <v-btn :disabled="page<=1" variant="outlined" rounded="xl" @click="page--">ก่อนหน้า</v-btn>
      <div class="text-medium-emphasis">หน้า {{ page }}</div>
      <v-btn :disabled="!hasMore" variant="outlined" rounded="xl" @click="page++">ถัดไป</v-btn>
    </div>

    <!-- Confirm Delete -->
    <ConfirmDialog
      v-model:open="showConfirm"
      :loading="deleting"
      title="ยืนยันการลบ"
      :message="`คุณต้องการลบ <b>${deleteTarget?.name || 'รายการนี้'}</b> ใช่หรือไม่?<br/>การกระทำนี้ไม่สามารถย้อนกลับได้`"
      confirmText="ลบ"
      cancelText="ยกเลิก"
      color="error"
      @confirm="confirmDelete"
    />

    <!-- Dialog Form -->
    <CategoryWorkForm :open="showForm" :model-value="editing" @update:open="showForm=$event" @saved="onSaved" />
  </v-container>
</template>