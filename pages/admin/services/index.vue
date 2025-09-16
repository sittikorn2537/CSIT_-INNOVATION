<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import ServiceForm from '@/components/admin/ServiceForm.vue'
import type { ApiResponse } from '~/types/api'
import ConfirmDialog from '@/components/common/ConfirmsDialog.vue'
import type { ServiceItem } from '~/types/service'



/** ---------- State ---------- */
const all = ref<ServiceItem[]>([])
const items = ref<ServiceItem[]>([])
const loading = ref(false)

const search = ref('')
const page = ref(1)
const perPage = ref(10)
const hasMore = ref(false)

const showForm = ref(false)
const editing = ref<{ service: ServiceItem | null; index: number | null } | null>({
  service: null,
  index: null
})

/** ---------- Helpers ---------- */
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')
const asKey = (v: string | number | undefined | null) => String(v ?? '')

/** ---------- API wrappers ---------- */
const { $api } = useNuxtApp()

const apiList = async (): Promise<ServiceItem[]> => {
  const res = await $api<ApiResponse<ServiceItem[]>>('/settings/services')
  return res.data ?? []
}

const apiCreate = async (
  payload: Omit<ServiceItem, 'id' | 'updated_at'>
): Promise<ServiceItem> => {
  const res = await $api<ApiResponse<ServiceItem>>('/settings/services', {
    method: 'POST',
    body: payload,
  })
  // ถ้า backend ส่งกลับมา ใช้นั้น; ถ้าไม่ ก็ประกอบให้เอง
  return res?.data ?? {
    ...payload,
    id: crypto.randomUUID(),
    updated_at: new Date().toISOString(),
  }
}

const apiUpdate = async (id: number | string, payload: Partial<ServiceItem>): Promise<ServiceItem> => {
  const res = await $api<ApiResponse<ServiceItem>>(`/settings/services/${id}`, {
    method: 'POST',
    body: payload
  })
  // รวมข้อมูล: ให้ payload ทับของเดิม, และให้ของจาก API (ถ้ามี) ทับทับอีกรอบ
  const current = all.value.find(x => asKey(x.id) === asKey(id)) || ({} as ServiceItem)
  const merged: ServiceItem = {
    ...current,
    ...payload,
    ...(res?.data || {}),
    id, // กัน API เปลี่ยนชนิด
    updated_at: (res?.data?.updated_at) || new Date().toISOString(),
  }
  return merged
}

const apiDelete = async (id: number | string): Promise<void> => {
  await $api(`/settings/services/${id}`, { method: 'DELETE' })
}

/** ---------- Load + filter + paginate ---------- */
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
    data = data.filter(s =>
      [
        s.title_th,
        s.title_en,
        s.description_th,
        s.description_en,
        s.icon
      ].some(v => (v || '').toLowerCase().includes(q))
    )
  }
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  hasMore.value = end < data.length
  items.value = data.slice(start, end)
}

/** ---------- UI actions ---------- */
const openForm = (s: ServiceItem | null = null, absoluteIndex: number | null = null) => {
  const clone = s ? (JSON.parse(JSON.stringify(s)) as ServiceItem) : null
  editing.value = { service: clone, index: absoluteIndex }
  showForm.value = true
}


const onSaved = async (data: ServiceItem, _index: number | null) => {
  loading.value = true
  try {
    let saved: ServiceItem
    if (data.id) {
      // UPDATE
      const payload: Partial<ServiceItem> = {
        title_th: data.title_th,
        title_en: data.title_en,
        description_th: data.description_th,
        description_en: data.description_en,
        icon: data.icon,
        icon_kind: data.icon_kind,
      }
      saved = await apiUpdate(data.id, payload)
      // อัปเดตใน all แบบ reactive
      const pos = all.value.findIndex(x => asKey(x.id) === asKey(saved.id))
      if (pos > -1) {
        const cloned = all.value.slice()
        cloned[pos] = { ...saved }
        all.value = cloned
      } else {
        all.value = [{ ...saved }, ...all.value]
      }
    } else {
      // CREATE
      const payload: Omit<ServiceItem, 'id' | 'updated_at'> = {
        title_th: data.title_th,
        title_en: data.title_en,
        description_th: data.description_th,
        description_en: data.description_en,
        icon: data.icon,
        icon_kind: data.icon_kind,
        user_created: data.user_created,
      }
      saved = await apiCreate(payload)
      all.value = [{ ...saved }, ...all.value]
    }
  } catch (e) {
    console.error('save service failed:', e)
  } finally {
    loading.value = false
    showForm.value = false
    filterAndPaginate()
  }
}

/** ---------- Confirm delete ---------- */
const showConfirm = ref(false)
const deleting = ref(false)
const deleteTarget = ref<{ id: string | number; title: string } | null>(null)

const askDelete = (row: ServiceItem) => {
  deleteTarget.value = {
    id: row.id,
    title: row.title_th || row.title_en || ''
  }
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

/** ---------- lifecycle ---------- */
onMounted(fetchAll)
watch([search], () => { page.value = 1; filterAndPaginate() })
watch(page, filterAndPaginate)
</script>

<template>
  <v-container class="py-6" fluid>
    <!-- Header + Tools -->
    <div class="d-flex flex-column gap-3 mb-4">
      <div>
        <h2 class="text-h6 text-sm-h5 font-weight-medium mb-1">บริการของเรา</h2>
        <div class="text-medium-emphasis text-body-2">จัดการข้อมูลบริการ </div>
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
          placeholder="ค้นหาบริการ…"
          style="min-width:220px"
        />
        <v-btn color="primary" rounded="xl" class="ms-auto" @click="openForm()">
          <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มบริการ
        </v-btn>
      </div>
    </div>

    <!-- ตาราง -->
    <v-card rounded="xl" elevation="1">
      <v-table class="text-body-2 pa-5">
        <thead>
          <tr>
            <th class="px-4 py-3">บริการ</th>
            <th class="px-4 py-3">รายละเอียด</th>
            <th class="px-4 py-3">อัปเดต</th>
            <th class="px-4 py-3 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in items" :key="s.id" class="hover:bg-surface">
            <td class="px-4 py-3 font-weight-medium">
              <div class="d-flex align-center ga-3">
                <!-- ไอคอน -->
                <template v-if="s.icon_kind === 'emoji'">
                  <div style="font-size:20px;line-height:1">{{ s.icon }}</div>
                </template>
                <template v-else-if="s.icon_kind === 'iconify'">
                  <Icon v-if="s.icon" :icon="s.icon" width="18" height="18" />
                </template>
                <!-- ชื่อ -->
                <span class="ms-2">
                  {{ s.title_th }}
                  <span v-if="s.title_en" class="text-medium-emphasis"> / {{ s.title_en }}</span>
                </span>
              </div>
            </td>

            <td class="px-4 py-3 text-medium-emphasis">
              <div>{{ s.description_th }}</div>
              <div v-if="s.description_en" class="text-disabled mt-1">{{ s.description_en }}</div>
            </td>

            <td class="px-4 py-3 text-medium-emphasis">
              {{ formatDate(s.updated_at) }}
            </td>

            <td class="px-4 py-3">
              <div class="d-flex justify-end ga-2">
                <v-btn size="small" variant="tonal" @click="openForm(s, (page - 1) * perPage + i)">
                  แก้ไข
                </v-btn>
                <v-btn size="small" color="error" variant="tonal" @click="askDelete(s)">
                  ลบ
                </v-btn>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && items.length === 0">
            <td colspan="4" class="px-6 py-10">
              <div class="d-flex flex-column align-center justify-center text-center ga-2">
                <v-avatar size="64" color="grey-lighten-3"><v-icon icon="mdi-image-off" /></v-avatar>
                <div class="text-subtitle-1">ยังไม่มีบริการ</div>
                <div class="text-medium-emphasis text-body-2">เริ่มเพิ่มบริการแรกของคุณได้เลย</div>
                <v-btn class="mt-2" color="primary" rounded="xl" @click="openForm()">
                  <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มบริการ
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

    <!-- Confirm delete -->
    <ConfirmDialog
      v-model:open="showConfirm"
      :loading="deleting"
      title="ยืนยันการลบ"
      :message="`คุณต้องการลบ <b>${deleteTarget?.title || 'รายการนี้'}</b> ใช่หรือไม่?<br/>การกระทำนี้ไม่สามารถย้อนกลับได้`"
      confirmText="ลบรายการ"
      cancelText="ยกเลิก"
      color="error"
      @confirm="confirmDelete"
    />

    <!-- Dialog Form -->
    <ServiceForm
      :open="showForm"
      :model-value="editing"
      @update:open="showForm = $event"
      @saved="onSaved"
    />
  </v-container>
</template>