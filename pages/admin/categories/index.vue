<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import CategoryForm from '@/components/admin/CategorysForm.vue'
import type { Category } from '~/types/category'
import type { ApiResponse } from '~/types/api'
import ConfirmDialog from '@/components/common/ConfirmsDialog.vue'



/** ---------- State ---------- */
const all = ref<Category[]>([])
const items = ref<Category[]>([])
const loading = ref(false)

const search = ref('')
const page = ref(1)
const perPage = ref(10)
const hasMore = ref(false)

const showForm = ref(false)
const editing = ref<{ category: Category | null; index: number | null }>({
  category: null,
  index: null
})

/** ---------- Utils ---------- */
const { $api } = useNuxtApp()
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')

/** ---------- API helpers (แก้ path ได้ตรงนี้) ---------- */

const apiGetCategories = async () => {
  const res = await $api<ApiResponse<Category[]>>('/settings/categories')
  return res.data // <- คลายห่อออกมาใช้เป็น array ตรง ๆ
}

const apiCreateCategory = async (
  payload: Omit<Category, 'id' | 'created_at' | 'updated_at'>
) => {
  const res = await $api<ApiResponse<Category>>('/settings/categories', {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' }
  })
  return res.data  // ✅ ตอนนี้เป็น Category ชัวร์ ๆ
}

const apiUpdateCategory = async (id: string, payload: Partial<Category>) => {
  const now = new Date().toISOString()

  // call API
  await $api(`/settings/categories/${id}`, {
    method: 'PUT',
    body: payload,
    headers: { 'Content-Type': 'application/json' }
  })

  // ✅ return payload รวม id และ updated_at
  return {
    id,
    ...payload,
    updated_at: now
  } as Category
}

const apiDeleteCategory = async (id: string) => {
  await $api(`/settings/categories/${id}`, { method: 'DELETE' })
}

/** ---------- Fetch & client-side paginate ---------- */
const fetchAll = async () => {
  loading.value = true
  try {
    const data = await apiGetCategories()
    all.value = data
  } finally {
    loading.value = false
  }
}

const filterAndPaginate = () => {
  let data = all.value.slice()
  const q = search.value.trim().toLowerCase()
  if (q) {
    data = data.filter(c =>
      [c.name_th, c.name_en, c.description].some(v => (v || '').toLowerCase().includes(q))
    )
  }

  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  hasMore.value = end < data.length
  items.value = data.slice(start, end)
}

/** ---------- Open form ---------- */
const openForm = (c: Category | null = null, i: number | null = null) => {
  editing.value = { category: c ? { ...c } : null, index: i }
  showForm.value = true
}

/** ---------- Remove ---------- */
const removeItem = async (rowIndex: number) => {
  const target = items.value[rowIndex]
  if (!target?.id) return
  // ลบแบบ optimistic
  const backup = all.value.slice()
  all.value = all.value.filter(c => c.id !== target.id)
  filterAndPaginate()

  try {
    await apiDeleteCategory(target.id)
  } catch (e) {
    // rollback
    all.value = backup
    filterAndPaginate()
  }
}

/** ---------- Save (create/update) ---------- */
const onSaved = async (data: Category, index: number | null) => {
  // แยกกรณี create vs update ตามว่ามี id เดิมหรือไม่

  try {
    if (!data.id) {
      // CREATE
      // เตรียม payload ที่จำเป็น (ตัด id/timestamps ออก)
      const payload = {
        name_th: data.name_th,
        name_en: data.name_en,
        description: data.description ?? ''
      }
      const created = await apiCreateCategory(payload)
      // อัปเดต list
      all.value.push(created)
    } else {
      // UPDATE
      const payload = {
        name_th: data.name_th,
        name_en: data.name_en,
        description: data.description ?? ''
      }
      const updated = await apiUpdateCategory(data.id, payload)
      const pos = all.value.findIndex(a => a.id === data.id)
      if (pos > -1) all.value[pos] = { ...updated }
    }
  } finally {
    filterAndPaginate()
    showForm.value = false
  }
}

/** ---------- Lifecycle ---------- */
onMounted(async () => {
  await fetchAll()
  filterAndPaginate()
})

watch([search], () => {
  page.value = 1
  filterAndPaginate()
})
watch(page, filterAndPaginate)

// ===== เพิ่ม state สำหรับยืนยันการลบ =====
const showConfirm = ref(false)
const deleting = ref(false)
const deleteTarget = ref<{ id: string; name?: string } | null>(null)

// เรียกตอนกดปุ่มลบในแถว
const askDelete = (row: Category) => {
  deleteTarget.value = { id: row.id, name: row.name_th || row.name_en }
  showConfirm.value = true
}

// กดยืนยันลบ
const confirmDelete = async () => {
  if (!deleteTarget.value) return
  try {
    deleting.value = true
    // 🔥 เรียก API ลบจริง
    await apiDeleteCategory(deleteTarget.value.id)

    // ลบออกจาก all แล้วรีเฟรชตาราง
    const pos = all.value.findIndex(i => i.id === deleteTarget.value!.id)
    if (pos > -1) all.value.splice(pos, 1)
    filterAndPaginate()
  } finally {
    deleting.value = false
    showConfirm.value = false
    deleteTarget.value = null
  }
}


</script>

<template>
  <v-container class="py-6" fluid>
    <!-- Header + Tools -->
    <div class="d-flex flex-column gap-3 mb-4">
      <div>
        <h2 class="text-h6 text-sm-h5 font-weight-medium mb-1">หมวดหมู่สินค้า</h2>
        <div class="text-medium-emphasis text-body-2">จัดการหมวดหมู่ ชื่อไทย/อังกฤษ และคำอธิบาย</div>
      </div>

      <div class="d-flex flex-wrap align-center ga-2">
        <v-text-field v-model="search" class="flex-grow-1" density="comfortable" variant="solo" hide-details
          rounded="xl" prepend-inner-icon="mdi-magnify" placeholder="ค้นหาหมวดหมู่…" style="min-width:220px" />
        <v-btn color="primary" rounded="xl" class="ms-auto" @click="openForm()">
          <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มหมวดหมู่
        </v-btn>
      </div>
    </div>

    <!-- List -->
    <v-card rounded="xl" elevation="1">
      <v-table class="text-body-2 pa-5">
        <thead>
          <tr>
            <th class="px-4 py-3">ชื่อ (TH)</th>
            <th class="px-4 py-3">ชื่อ (EN)</th>
            <th class="px-4 py-3">รายละเอียด</th>
            <th class="px-4 py-3">อัปเดต</th>
            <th class="px-4 py-3 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in items" :key="c.id || i" class="hover:bg-surface">
            <td class="px-4 py-3 font-weight-medium">{{ c.name_th }}</td>
            <td class="px-4 py-3">{{ c.name_en }}</td>
            <td class="px-4 py-3 text-medium-emphasis">
              <span class="line-clamp-2">{{ c.description }}</span>
            </td>
            <td class="px-4 py-3 text-medium-emphasis">{{ formatDate(c.updated_at) }}</td>
            <td class="px-4 py-3">
              <div class="d-flex justify-end ga-2">
                <v-btn size="small" variant="tonal" @click="openForm(c, (page - 1) * perPage + i)">
                  แก้ไข
                </v-btn>
                <v-btn size="small" color="error" variant="tonal" @click="askDelete(c)">
                  ลบ
                </v-btn>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && items.length === 0">
            <td colspan="5" class="px-6 py-10">
              <div class="d-flex flex-column align-center justify-center text-center ga-2">
                <v-avatar size="64" color="grey-lighten-3">
                  <v-icon icon="mdi-view-grid-outline" />
                </v-avatar>
                <div class="text-subtitle-1">ยังไม่มีหมวดหมู่</div>
                <div class="text-medium-emphasis text-body-2">เริ่มเพิ่มหมวดหมู่แรกของคุณได้เลย</div>
                <v-btn class="mt-2" color="primary" rounded="xl" @click="openForm()">
                  <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มหมวดหมู่
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Pagination -->
    <div class="d-flex justify-end align-center ga-2 mt-4">
      <v-btn :disabled="page <= 1" variant="outlined" rounded="xl" @click="page--">ก่อนหน้า</v-btn>
      <div class="text-medium-emphasis">หน้า {{ page }}</div>
      <v-btn :disabled="!hasMore" variant="outlined" rounded="xl" @click="page++">ถัดไป</v-btn>
    </div>

  <!-- ✅ ป๊อปอัปยืนยันการลบ -->
  <ConfirmDialog
    v-model:open="showConfirm"
    :loading="deleting"
    title="ยืนยันการลบ"
    :message="`คุณต้องการลบ <b>${deleteTarget?.name || 'รายการนี้'}</b> ใช่หรือไม่?<br/>การกระทำนี้ไม่สามารถย้อนกลับได้`"
    confirmText="ลบรายการ"
    cancelText="ยกเลิก"
    color="error"
    @confirm="confirmDelete"
  />

    <!-- Dialog Form -->
    <CategoryForm v-model:open="showForm" :model-value="editing" @saved="onSaved" />
    
  </v-container>

</template>