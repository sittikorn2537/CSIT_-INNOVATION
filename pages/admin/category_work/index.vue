<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import CategoryWorkForm from '@/components/admin/CategoryWorksForm.vue'

/** ==== Types ==== */
type CategoryWork = {
  id: string
  name_th: string
  name_en: string
  created_at?: string
  updated_at?: string
}
type ApiResponse<T> = { status: boolean; message: string; data?: T }

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

/** ==== Utils ==== */
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')
const asKey = (v: string | number | undefined | null) => String(v ?? '')

/** ==== API ==== */
const { $api } = useNuxtApp()

const apiList = async (): Promise<CategoryWork[]> => {
  const res = await $api<ApiResponse<CategoryWork[]>>('/settings/category-work')
  return res.data ?? []
}

const apiCreate = async (
  payload: Omit<CategoryWork, 'id' | 'created_at' | 'updated_at'>
): Promise<CategoryWork> => {
  const res = await $api<ApiResponse<CategoryWork>>('/settings/category-work', {
    method: 'POST',
    body: payload,
  })
  // fallback เผื่อ backend ไม่คืนข้อมูลเต็ม
  return res.data ?? {
    id: crypto.randomUUID(),
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

const apiUpdate = async (
  id: string,
  payload: Partial<CategoryWork>
): Promise<CategoryWork> => {
  const res = await $api<ApiResponse<CategoryWork>>(`/settings/category-work/${id}`, {
    method: 'PUT',
    body: payload,
  })
  return res.data ?? { id, ...payload, updated_at: new Date().toISOString() } as CategoryWork
}

const apiDelete = async (id: string): Promise<void> => {
  await $api(`/settings/category-work/${id}`, { method: 'DELETE' })
}

/** ==== Load + filter + paginate ==== */
const fetchAll = async () => {
  loading.value = true
  try {
    all.value = await apiList()
  } finally {
    loading.value = false
  }
  filterAndPaginate()
}

const filterAndPaginate = () => {
  let data = all.value.slice()
  const q = search.value.trim().toLowerCase()
  if (q) {
    data = data.filter(c =>
      [c.name_th, c.name_en].some(v => (v || '').toLowerCase().includes(q))
    )
  }
  const start = (page.value - 1) * perPage.value
  const end   = start + perPage.value
  hasMore.value = end < data.length
  items.value = data.slice(start, end)
}

/** ==== UI actions ==== */
const openForm = (c: CategoryWork | null = null, absoluteIndex: number | null = null) => {
  const clone = c ? (JSON.parse(JSON.stringify(c)) as CategoryWork) : null
  editing.value = { category: clone, index: absoluteIndex }
  showForm.value = true
}

const onSaved = async (data: CategoryWork, _index: number | null) => {
  loading.value = true
  try {
    let saved: CategoryWork
    if (data.id) {
      // update
      const payload: Partial<CategoryWork> = {
        name_th: data.name_th,
        name_en: data.name_en,
      }
      saved = await apiUpdate(data.id, payload)
      const pos = all.value.findIndex(x => asKey(x.id) === asKey(saved.id))
      if (pos > -1) {
        const cloned = all.value.slice()
        cloned[pos] = { ...cloned[pos], ...saved }
        all.value = cloned
      } else {
        all.value = [{ ...saved }, ...all.value]
      }
    } else {
      // create
      const payload: Omit<CategoryWork, 'id' | 'created_at' | 'updated_at'> = {
        name_th: data.name_th,
        name_en: data.name_en,
      }
      saved = await apiCreate(payload)
      all.value = [{ ...saved }, ...all.value]
    }
  } finally {
    loading.value = false
    showForm.value = false
    filterAndPaginate()
  }
}

const askDelete = async (row: CategoryWork) => {
  const ok = confirm(`ยืนยันลบหมวดหมู่งาน: ${row.name_th || row.name_en}?`)
  if (!ok) return
  loading.value = true
  try {
    await apiDelete(row.id)
    all.value = all.value.filter(x => asKey(x.id) !== asKey(row.id))
  } finally {
    loading.value = false
    filterAndPaginate()
  }
}

/** ==== lifecycle ==== */
onMounted(fetchAll)
watch([search], () => { page.value = 1; filterAndPaginate() })
watch(page, filterAndPaginate)
</script>

<template>
  <v-container class="py-6" fluid>
    <!-- Header + Tools -->
    <div class="d-flex flex-column gap-3 mb-4">
      <div>
        <h2 class="text-h6 text-sm-h5 font-weight-medium mb-1">หมวดหมู่งาน</h2>
        <div class="text-medium-emphasis text-body-2">เพิ่ม/แก้ไข/ลบ หมวดหมู่งาน (เชื่อม API /settings/category-work)</div>
      </div>

      <div class="d-flex flex-wrap align-center ga-2">
        <v-text-field
          v-model="search"
          class="flex-grow-1"
          density="comfortable"
          variant="solo"
          hide-details
          rounded="xl"
          prepend-inner-icon="mdi-magnify"
          placeholder="ค้นหา…"
          style="min-width:220px"
        />
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
          <tr v-for="(c, i) in items" :key="c.id" class="hover:bg-surface">
            <td class="px-4 py-3 font-weight-medium">{{ c.name_th }}</td>
            <td class="px-4 py-3">{{ c.name_en }}</td>
            <td class="px-4 py-3 text-medium-emphasis">{{ formatDate(c.updated_at) }}</td>
            <td class="px-4 py-3">
              <div class="d-flex justify-end ga-2">
                <v-btn size="small" variant="tonal" @click="openForm(c, (page - 1) * perPage + i)">แก้ไข</v-btn>
                <v-btn size="small" color="error" variant="tonal" @click="askDelete(c)">ลบ</v-btn>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && items.length === 0">
            <td colspan="4" class="px-6 py-10">
              <div class="d-flex flex-column align-center justify-center text-center ga-2">
                <v-avatar size="64" color="grey-lighten-3"><v-icon icon="mdi-view-grid-outline" /></v-avatar>
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

    <!-- Dialog Form -->
    <CategoryWorkForm
      :open="showForm"
      :model-value="editing"
      @update:open="showForm = $event"
      @saved="onSaved"
    />
  </v-container>
</template>