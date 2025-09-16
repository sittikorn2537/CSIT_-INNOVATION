<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import WorkForm from '@/components/admin/WorkForm.vue'
import type { ApiResponse } from '~/types/api'
import type { WorkItem } from '~/types/work'



const { $api } = useNuxtApp()

/* ---------- state ---------- */
const all = ref<WorkItem[]>([])
const items = ref<WorkItem[]>([])
const loading = ref(false)

const search = ref('')
const page = ref(1)
const perPage = ref(10)
const hasMore = ref(false)

const showForm = ref(false)
const editing = ref<{ work: WorkItem | null; index: number | null }>({
  work: null,
  index: null
})

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')

/* ---------- API wrappers ---------- */
const apiList = async (): Promise<WorkItem[]> => {
  const res = await $api<ApiResponse<WorkItem[]>>('/settings/works')
  return res.data ?? []
}

// สร้าง
const apiCreateFD = async (fd: FormData): Promise<WorkItem> => {
  // ถ้า backend รับ POST /settings/works เป็น multipart ได้ตรงๆ
  const res = await $api<{ status: boolean; message: string; data?: WorkItem }>(
    '/settings/works',
    { method: 'POST', body: fd }
  )
  if (res?.data) return res.data

  // fallback: เผื่อ backend ไม่คืนเต็ม
  return {
    id: crypto.randomUUID(),
    title_th: String(fd.get('title_th') || ''),
    title_en: String(fd.get('title_en') || ''),
    description: String(fd.get('description') || ''),
    categories_id: String(fd.get('categories_id') || ''),
    image_url: typeof fd.get('image_url') === 'string' ? String(fd.get('image_url')) : '',
    updated_at: new Date().toISOString()
  } as WorkItem
}

// อัปเดต
const apiUpdateFD = async (id: string | number, fd: FormData): Promise<WorkItem> => {
  // ถ้าเซิร์ฟเวอร์ไม่รองรับ PUT multipart ให้ใช้ POST พร้อม _method=PUT
  // fd.set('_method', 'PUT')
  // const res = await $api<{ status: boolean; message: string; data?: WorkItem }>(
  //   `/settings/works/${id}`, { method: 'POST', body: fd }
  // )

  const res = await $api<{ status: boolean; message: string; data?: WorkItem }>(
    `/settings/works/${id}`,
    { method: 'POST', body: fd }
  )
  if (res?.data) return res.data

  // fallback: รวมค่าจาก fd กับของเดิม
  const prev = all.value.find(w => String(w.id) === String(id))
  const getS = (k: string) => String(fd.get(k) ?? (prev as any)?.[k] ?? '')
  return {
    ...(prev || ({} as WorkItem)),
    id,
    title_th: getS('title_th'),
    title_en: getS('title_en'),
    description: getS('description'),
    categories_id: getS('categories_id'),
    // ถ้า backend สร้าง URL ใหม่จากไฟล์ จะคืนใน res.data — ถ้าไม่คืน ใช้ค่าเดิม
    image_url: typeof fd.get('image') === 'object' ? (prev?.image_url || '') : getS('image_url'),
    updated_at: new Date().toISOString()
  }
}

const apiDelete = async (id: number | string): Promise<void> => {
  await $api(`/settings/works/${id}`, { method: 'DELETE' })
}

/* ---------- data flow ---------- */
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
    data = data.filter(w =>
      [w.title_th, w.title_en, w.description].some(v => (v || '').toLowerCase().includes(q))
    )
  }
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  hasMore.value = end < data.length
  items.value = data.slice(start, end)
}

/* ---------- UI actions ---------- */
const openForm = (w: WorkItem | null = null, absoluteIndex: number | null = null) => {
  const clone = w ? JSON.parse(JSON.stringify(w)) as WorkItem : null
  editing.value = { work: clone, index: absoluteIndex }
  showForm.value = true
}

const removeItem = async (rowIndex: number) => {
  const target = items.value[rowIndex]
  if (!target) return
  if (!confirm(`ยืนยันลบ: ${target.title_th || target.title_en || 'รายการนี้'} ?`)) return

  loading.value = true
  try {
    await apiDelete(target.id)
    all.value = all.value.filter(w => w.id !== target.id)
    filterAndPaginate()
  } finally {
    loading.value = false
  }
}

// เปลี่ยน signature ให้รับไฟล์ได้
const onSaved = async (data: WorkItem, _index: number | null) => {
  loading.value = true
  try {
    // สร้าง FormData ทุกครั้ง
    const fd = new FormData()
    fd.append('title_th', data.title_th || '')
    fd.append('title_en', data.title_en || '')
    fd.append('description', data.description || '')
    fd.append('categories_id', String(data.categories_id || ''))

    // ถ้ามีไฟล์ใหม่ ให้ส่งเป็น field ชื่อ 'image' (ปรับชื่อให้ตรงกับ backend)
    if (data.image) {
      fd.append('image', data.image)               // <--- File
    } else if (data.image_url) {
      // ไม่มีไฟล์ใหม่ แต่มีรูปเดิม ส่ง URL เดิมไปเผื่อ backend ใช้
      fd.append('image_url', data.image_url)            // <--- string URL
    }

    let saved: WorkItem

    if (data.id) {
      saved = await apiUpdateFD(data.id, fd)            // ← ใช้ endpoint อัปเดตแบบ form-data
    } else {
      saved = await apiCreateFD(fd)                     // ← ใช้ endpoint สร้างแบบ form-data
    }

    // อัปเดต state ให้รีแอคทีฟ
    const pos = all.value.findIndex(x => String(x.id) === String(saved.id))
    if (pos > -1) {
      const next = all.value.slice()
      next[pos] = { ...saved }
      all.value = next
    } else {
      all.value = [{ ...saved }, ...all.value]
    }
  } finally {
    loading.value = false
    showForm.value = false
    filterAndPaginate()
  }
}
/* ---------- lifecycle ---------- */
onMounted(fetchAll)
watch([search], () => { page.value = 1; filterAndPaginate() })
watch(page, filterAndPaginate)
</script>

<template>
  <v-container class="py-6" fluid>
    <!-- Header + Tools -->
    <div class="d-flex flex-column gap-3 mb-4">
      <div>
        <h2 class="text-h6 text-sm-h5 font-weight-medium mb-1">ผลงานของเรา</h2>
        <div class="text-medium-emphasis text-body-2">จัดการภาพผลงานและรายละเอียด</div>
      </div>

      <div class="d-flex flex-wrap align-center ga-2">
        <v-text-field v-model="search" class="flex-grow-1" density="comfortable" variant="solo" hide-details
          rounded="xl" prepend-inner-icon="mdi-magnify" placeholder="ค้นหาผลงาน…" style="min-width:220px" />
        <v-btn color="primary" rounded="xl" class="ms-auto" @click="openForm()">
          <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มผลงาน
        </v-btn>
      </div>
    </div>

    <!-- List -->
    <v-card rounded="xl" elevation="1">
      <v-table class="text-body-2 pa-5">
        <thead>
          <tr>
            <th class="px-4 py-3">ภาพ</th>
            <th class="px-4 py-3">ชื่อผลงาน</th>
            <th class="px-4 py-3">คำอธิบาย</th>
            <th class="px-4 py-3">หมวดหมู่</th>
            <th class="px-4 py-3">อัปเดต</th>
            <th class="px-4 py-3 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(w, i) in items" :key="w.id" class="hover:bg-surface">
            <td class="px-4 py-3">
              <v-avatar rounded="lg" size="64" variant="tonal">
                <v-img v-if="w.image_url" :src="w.image_url" cover />
                <v-icon v-else icon="mdi-image-off" />
              </v-avatar>
            </td>
            <td class="px-4 py-3 font-weight-medium">
              {{ w.title_th }}
              <span v-if="w.title_en" class="text-medium-emphasis"> / {{ w.title_en }}</span>
            </td>
            <td class="px-4 py-3 text-medium-emphasis">
              <span class="line-clamp-2">{{ w.description || '-' }}</span>
            </td>
            <td class="px-4 py-3 font-weight-medium">
              {{ w.categories_th }}
              <span v-if="w.categories_en" class="text-medium-emphasis"> / {{ w.categories_en }}</span>
            </td>
            <td class="px-4 py-3 text-medium-emphasis">{{ formatDate(w.updated_at) }}</td>
            <td class="px-4 py-3">
              <div class="d-flex justify-end ga-2">
                <v-btn size="small" variant="tonal" @click="openForm(w, (page - 1) * perPage + i)">
                  แก้ไข
                </v-btn>
                <v-btn size="small" color="error" variant="tonal" @click="removeItem(i)">
                  ลบ
                </v-btn>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && items.length === 0">
            <td colspan="5" class="px-6 py-10">
              <div class="d-flex flex-column align-center justify-center text-center ga-2">
                <v-avatar size="64" color="grey-lighten-3">
                  <v-icon icon="mdi-image-off" />
                </v-avatar>
                <div class="text-subtitle-1">ยังไม่มีผลงาน</div>
                <div class="text-medium-emphasis text-body-2">เริ่มเพิ่มผลงานแรกของคุณได้เลย</div>
                <v-btn class="mt-2" color="primary" rounded="xl" @click="openForm()">
                  <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มผลงาน
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
    <WorkForm v-model:open="showForm" :model-value="editing" @saved="onSaved" />
  </v-container>
</template>