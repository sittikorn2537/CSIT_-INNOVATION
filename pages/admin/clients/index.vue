<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ClientForm from '~/components/admin/ClientForm.vue'
import ConfirmDialog from '@/components/common/ConfirmsDialog.vue'
import type { Client } from '~/types/client'

const { $api } = useNuxtApp()

/* ---------- state ---------- */
const allClients   = ref<Client[]>([])
const clients      = ref<Client[]>([])
const loading      = ref(false)

const search       = ref('')
const page         = ref(1)
const perPage      = ref(10)
const hasMore      = ref(false)

const showForm     = ref(false)
const editing      = ref<Client | null>(null)

/* confirm delete */
const showConfirm  = ref(false)
const deleting     = ref(false)
const deleteTarget = ref<{ id: string | number; name?: string } | null>(null)

/* ---------- helpers ---------- */
const fmt = (v?: string) => (v || '').toLowerCase()
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')

/* ---------- api ---------- */
const fetchAll = async () => {
  loading.value = true
  try {
    const res = await $api<{ status: boolean; data: Client[] }>('/settings/clients')
    allClients.value = res?.data || []
  } catch (err) {
    console.error('fetch clients failed', err)
  } finally {
    loading.value = false
  }
}

/* ---------- filter + paginate ---------- */
const recompute = () => {
  let list = allClients.value.slice()
  const q = search.value.trim().toLowerCase()

  if (q) {
    list = list.filter(c =>
      [c.name_th, c.name_en, c.website_url].some(v => fmt(v).includes(q))
    )
  }

  const start = (page.value - 1) * perPage.value
  const end   = start + perPage.value
  hasMore.value = end < list.length
  clients.value = list.slice(start, end)
}

/* ---------- form open/save ---------- */
const openForm = (c: Client | null = null) => {
  // clone เพื่อตัดผลข้างเคียง
  editing.value = c ? JSON.parse(JSON.stringify(c)) : null
  showForm.value = true
}

const onSaved = async (formData: FormData) => {
  try {
    if (editing.value?.id) {
      // UPDATE
      await $api(`/settings/clients/${editing.value.id}`, {
        method: 'POST', // ถ้าแบ็กเอนด์รองรับ PUT ก็เปลี่ยนเป็น PUT ได้
        body: formData
      })
    } else {
      // CREATE
      await $api('/settings/clients', {
        method: 'POST',
        body: formData
      })
    }
    await fetchAll()
    recompute()
  } catch (err) {
    console.error('Save failed', err)
  } finally {
    showForm.value = false
    editing.value = null
  }
}

/* ---------- delete with confirm dialog ---------- */
const askDelete = (c: Client) => {
  deleteTarget.value = { id: c.id, name: c.name_th || c.name_en }
  showConfirm.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  try {
    deleting.value = true
    await $api(`/settings/clients/${deleteTarget.value.id}`, { method: 'DELETE' })
    // ตัดออกจาก all แล้วจัดหน้าใหม่
    allClients.value = allClients.value.filter(x => x.id !== deleteTarget.value!.id)
    recompute()
  } catch (err) {
    console.error('Delete failed', err)
  } finally {
    deleting.value = false
    showConfirm.value = false
    deleteTarget.value = null
  }
}

/* ---------- lifecycle ---------- */
onMounted(async () => {
  await fetchAll()
  recompute()
})

watch([search], () => { page.value = 1; recompute() })
watch(page, recompute)
</script>

<template>
  <v-container class="py-6" fluid>
    <!-- Header + Tools -->
    <div class="d-flex flex-column gap-3 mb-4">
      <div>
        <h2 class="text-h6 text-sm-h5 font-weight-medium mb-1">ลูกค้าของเรา</h2>
        <div class="text-medium-emphasis text-body-2">
          จัดการรายชื่อลูกค้า โลโก้ และลิงก์เว็บไซต์
        </div>
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
          placeholder="ค้นหาลูกค้า…"
          style="min-width:220px"
        />
        <v-btn color="primary" rounded="xl" class="ms-auto" @click="openForm()">
          <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มลูกค้า
        </v-btn>
      </div>
    </div>

    <!-- Table -->
    <v-card rounded="xl" elevation="1">
      <v-table class="text-body-2 pa-5">
        <thead>
          <tr>
            <th class="px-4 py-3">โลโก้</th>
            <th class="px-4 py-3">ชื่อ (ไทย)</th>
            <th class="px-4 py-3">ชื่อ (อังกฤษ)</th>
            <th class="px-4 py-3">เว็บไซต์</th>
            <th class="px-4 py-3">อัปเดต</th>
            <th class="px-4 py-3 text-right">จัดการ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="c in clients" :key="c.id" class="hover:bg-surface">
            <td class="px-4 py-3">
              <v-avatar rounded="lg" size="48" variant="tonal">
                <v-img v-if="c.logo_url" :src="c.logo_url" cover />
                <v-icon v-else icon="mdi-image-off" />
              </v-avatar>
            </td>
            <td class="px-4 py-3 font-weight-medium">{{ c.name_th }}</td>
            <td class="px-4 py-3">{{ c.name_en || '-' }}</td>
            <td class="px-4 py-3">
              <a v-if="c.website_url" :href="c.website_url" target="_blank" class="text-primary">
                {{ c.website_url }}
              </a>
              <span v-else>-</span>
            </td>
            <td class="px-4 py-3 text-medium-emphasis">{{ formatDate(c.updated_at) }}</td>
            <td class="px-4 py-3">
              <div class="d-flex justify-end ga-2">
                <v-btn size="small" variant="tonal" @click="openForm(c)">แก้ไข</v-btn>
                <v-btn size="small" color="error" variant="tonal" @click="askDelete(c)">ลบ</v-btn>
              </div>
            </td>
          </tr>

          <!-- Empty -->
          <tr v-if="!loading && clients.length === 0">
            <td colspan="6" class="px-6 py-10">
              <div class="d-flex flex-column align-center justify-center text-center ga-2">
                <v-avatar size="64" color="grey-lighten-3">
                  <v-icon icon="mdi-account-group-outline" />
                </v-avatar>
                <div class="text-subtitle-1">ยังไม่มีข้อมูลลูกค้า</div>
                <div class="text-medium-emphasis text-body-2">
                  เริ่มเพิ่มลูกค้าของคุณได้เลย
                </div>
                <v-btn class="mt-2" color="primary" rounded="xl" @click="openForm()">
                  <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มลูกค้า
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

    <!-- Confirm Delete -->
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
    <ClientForm
      :open="showForm"
      :model="editing"
      @update:open="showForm = $event"
      @saved="onSaved"
    />
  </v-container>
</template>