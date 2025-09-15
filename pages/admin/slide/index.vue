<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import SlideForm from '@/components/admin/SlideForm.vue'
import ConfirmDialog from '@/components/common/ConfirmsDialog.vue' // ให้ตรงกับชื่อไฟล์จริง
import type { SlideItem } from '~/types/slideItem'
import type { ApiResponse } from '~/types/api'

const { $api } = useNuxtApp()

/* ---------- state ---------- */
const all = ref<SlideItem[]>([])
const items = ref<SlideItem[]>([])
const loading = ref(false)

const search  = ref('')
const page    = ref(1)
const perPage = ref(10)
const hasMore = ref(false)

const showForm = ref(false)
const editing = ref<{ slide: SlideItem | null; index: number | null }>({
  slide: null,
  index: null
})

/* confirm delete */
const showConfirm = ref(false)
const deleting = ref(false)
const deleteTarget = ref<{ id: string|number; name?: string } | null>(null)

/* helpers */
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')
const keyOf   = (v: string|number|undefined|null) => String(v ?? '')

/* ---------- API ---------- */
const apiList = async (): Promise<SlideItem[]> => {
  const res = await $api<ApiResponse<SlideItem[]>>('/settings/slides')
  return res.data ?? []
}

// สร้างด้วย FormData
const apiCreateFD = async (fd: FormData): Promise<SlideItem> => {
  const res = await $api<ApiResponse<SlideItem>>('/settings/slides', {
    method: 'POST',
    body: fd,
  })
  // ถ้า backend คืน data → ใช้เลย
  if (res?.data) return res.data

  // fallback (กรณี dev/mock)
  // ดึงค่าออกมา (string | File) แล้วแปลงเป็น SlideItem อย่างหยาบ
  const getS = (k: string) => String(fd.get(k) ?? '')
  return {
    id: crypto.randomUUID(),
    eyebrow: getS('eyebrow'),
    title_th: getS('title_th'),
    title_en: getS('title_en'),
    subtitle_th: getS('subtitle_th'),
    subtitle_en: getS('subtitle_en'),
    src: getS('src'), // ปรกติ backend จะอัปเดตเป็น URL ใหม่หลังอัปโหลดไฟล์
    ctaText_th: getS('ctaText_th'),
    ctaText_en: getS('ctaText_en'),
    ctaTo: getS('ctaTo'),
    updated_at: new Date().toISOString(),
  }
}

const apiUpdateFD = async (id: string | number, fd: FormData): Promise<SlideItem> => {
  // ถ้าเซิร์ฟเวอร์ไม่รับ PUT multipart ให้เปิด 2 บรรทัดล่างนี้แทน
  // fd.set('_method', 'PUT')
  // const res = await $api<ApiResponse<SlideItem>>(`/settings/slides/${id}`, { method: 'POST', body: fd })

  const res = await $api<ApiResponse<any>>(`/settings/slides/${id}`, {
    method: 'POST',           // ← ใช้ POST + form-data ตามที่เซิร์ฟเวอร์ต้องการ
    body: fd,
  })

  // ตัวช่วยอ่านค่าจาก FormData (ให้เป็น string เสมอ)
  const s = (k: string, fallback = '') => {
    const v = fd.get(k)
    return typeof v === 'string' ? v : fallback
  }

  // 1) ของเดิมในตาราง (ถ้ามี)
  const prev = all.value.find(x => keyOf(x.id) === keyOf(id)) as SlideItem | undefined

  // 2) ค่าที่กรอกจากฟอร์ม (string fields)
  const fromFd: Partial<SlideItem> = {
    eyebrow:     s('eyebrow',     prev?.eyebrow     ?? ''),
    title_th:    s('title_th',    prev?.title_th    ?? ''),
    title_en:    s('title_en',    prev?.title_en    ?? ''),
    subtitle_th: s('subtitle_th', prev?.subtitle_th ?? ''),
    subtitle_en: s('subtitle_en', prev?.subtitle_en ?? ''),
    // หมายเหตุ: ถ้าอัปโหลดไฟล์ เรามัก "ไม่" ส่ง src มากับฟอร์ม
    // ให้ใช้ของเดิมไว้ก่อน แล้วค่อยทับด้วยค่าจาก response (ข้อ 3)
    src:         s('src',         prev?.src         ?? ''),
    ctaText_th:  s('ctaText_th',  prev?.ctaText_th  ?? ''),
    ctaText_en:  s('ctaText_en',  prev?.ctaText_en  ?? ''),
    ctaTo:       s('ctaTo',       prev?.ctaTo       ?? ''),
  }

  // 3) ค่าที่ได้จาก API (ตอบกลับมาอาจเป็น SlideItem เต็ม ๆ หรือมีเฉพาะ src)
  const data = res?.data
  if (data && typeof data === 'object') {
    // ถ้าเป็น SlideItem เต็ม → ใช้เลย แต่ merge เพื่อกัน field ที่เซิร์ฟเวอร์ไม่ส่ง
    const merged: SlideItem = {
      id,
      eyebrow:     data.eyebrow     ?? fromFd.eyebrow     ?? prev?.eyebrow     ?? '',
      title_th:    data.title_th    ?? fromFd.title_th    ?? prev?.title_th    ?? '',
      title_en:    data.title_en    ?? fromFd.title_en    ?? prev?.title_en    ?? '',
      subtitle_th: data.subtitle_th ?? fromFd.subtitle_th ?? prev?.subtitle_th ?? '',
      subtitle_en: data.subtitle_en ?? fromFd.subtitle_en ?? prev?.subtitle_en ?? '',
      // ให้ src จาก response มาก่อน (เพราะเป็น URL ใหม่หลังอัปโหลดรูป)
      src:         data.src         ?? fromFd.src         ?? prev?.src         ?? '',
      ctaText_th:  data.ctaText_th  ?? fromFd.ctaText_th  ?? prev?.ctaText_th  ?? '',
      ctaText_en:  data.ctaText_en  ?? fromFd.ctaText_en  ?? prev?.ctaText_en  ?? '',
      ctaTo:       data.ctaTo       ?? fromFd.ctaTo       ?? prev?.ctaTo       ?? '',
      updated_at:  data.updated_at  ?? new Date().toISOString(),
    }
    return merged
  }

  // 4) กรณี API ดันใส่ src ไว้ระดับ root (เช่น { status, message, src: "..." })
  const topSrc = (res as any)?.src
  const resolvedSrc = typeof topSrc === 'string' && topSrc ? topSrc : (fromFd.src ?? prev?.src ?? '')
  // 5) fallback สุดท้าย: รวม prev + fd และทับ src ด้วยค่าที่ resolve ได้
  return {
    id,
    eyebrow:     fromFd.eyebrow     ?? prev?.eyebrow     ?? '',
    title_th:    fromFd.title_th    ?? prev?.title_th    ?? '',
    title_en:    fromFd.title_en    ?? prev?.title_en    ?? '',
    subtitle_th: fromFd.subtitle_th ?? prev?.subtitle_th ?? '',
    subtitle_en: fromFd.subtitle_en ?? prev?.subtitle_en ?? '',
    src:         resolvedSrc,
    ctaText_th:  fromFd.ctaText_th  ?? prev?.ctaText_th  ?? '',
    ctaText_en:  fromFd.ctaText_en  ?? prev?.ctaText_en  ?? '',
    ctaTo:       fromFd.ctaTo       ?? prev?.ctaTo       ?? '',
    updated_at:  new Date().toISOString(),
  }
}
const apiDelete = async (id: number|string) => {
  await $api(`/settings/slides/${id}`, { method: 'DELETE' })
}

/* ---------- load + filter + paginate ---------- */
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
      [s.eyebrow, s.title_th, s.title_en, s.subtitle_th, s.subtitle_en, s.ctaText_th, s.ctaText_en, s.ctaTo]
        .some(v => (v || '').toLowerCase().includes(q))
    )
  }
  const start = (page.value - 1) * perPage.value
  const end   = start + perPage.value
  hasMore.value = end < data.length
  items.value = data.slice(start, end)
}

/* ---------- UI actions ---------- */
const openForm = (s: SlideItem | null = null, absIndex: number | null = null) => {
  const clone = s ? JSON.parse(JSON.stringify(s)) as SlideItem : null
  editing.value = { slide: clone, index: absIndex }
  showForm.value = true
}

const askDelete = (row: SlideItem) => {
  deleteTarget.value = { id: row.id, name: row.title_th || row.title_en }
  showConfirm.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  try {
    deleting.value = true
    await apiDelete(deleteTarget.value.id)
    all.value = all.value.filter(s => keyOf(s.id) !== keyOf(deleteTarget.value!.id))
    filterAndPaginate()
  } finally {
    deleting.value = false
    showConfirm.value = false
    deleteTarget.value = null
  }
}

/**
 * ✅ รับจาก SlideForm เป็น (fd: FormData, index: number|null)
 *    ไม่มีพารามิเตอร์ file แยก เพราะรวมอยู่ใน FormData แล้ว (key = "file")
 */
const onSaved = async (fd: FormData, _index: number | null) => {
  loading.value = true
  try {
    // เช็คว่ามี id ในฟอร์มหรือยัง
    const idVal = fd.get('id')
    const idStr = typeof idVal === 'string' ? idVal : (idVal ? String(idVal) : '')

    let saved: SlideItem
    if (idStr) {
      // UPDATE
      saved = await apiUpdateFD(idStr, fd)
      const pos = all.value.findIndex(s => keyOf(s.id) === keyOf(saved.id))
      if (pos > -1) {
        const clone = all.value.slice()
        clone[pos] = { ...saved }
        all.value = clone
      } else {
        all.value = [{ ...saved }, ...all.value]
      }
    } else {
      // CREATE
      saved = await apiCreateFD(fd)
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
        <h2 class="text-h6 text-sm-h5 font-weight-medium mb-1">สไลด์หน้าแรก</h2>
        <div class="text-medium-emphasis text-body-2">จัดการสไลด์: รูป, หัวข้อ, คำโปรย, ปุ่ม CTA</div>
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
          placeholder="ค้นหาสไลด์…"
          style="min-width:220px"
        />
        <v-btn color="primary" rounded="xl" class="ms-auto" @click="openForm()">
          <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มสไลด์
        </v-btn>
      </div>
    </div>

    <!-- ตาราง -->
    <v-card rounded="xl" elevation="1">
      <v-table class="text-body-2 pa-5">
        <thead>
          <tr>
            <th class="px-4 py-3">ภาพ</th>
            <th class="px-4 py-3">หัวข้อ</th>
            <th class="px-4 py-3">คำโปรย</th>
            <th class="px-4 py-3">CTA</th>
            <th class="px-4 py-3">อัปเดต</th>
            <th class="px-4 py-3 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in items" :key="s.id" class="hover:bg-surface">
            <td class="px-4 py-3">
              <v-avatar rounded="lg" size="72" variant="tonal">
                <v-img :src="s.src" cover />
              </v-avatar>
            </td>
            <td class="px-4 py-3 font-weight-medium">
              <div class="text-high-emphasis">{{ s.title_th }}</div>
              <div v-if="s.title_en" class="text-medium-emphasis text-body-2">{{ s.title_en }}</div>
              <div v-if="s.eyebrow" class="text-disabled text-body-2 mt-1">{{ s.eyebrow }}</div>
            </td>
            <td class="px-4 py-3 text-medium-emphasis">
              <div>{{ s.subtitle_th }}</div>
              <div v-if="s.subtitle_en" class="text-disabled mt-1">{{ s.subtitle_en }}</div>
            </td>
            <td class="px-4 py-3 text-medium-emphasis">
              <div>{{ s.ctaText_th }}</div>
              <div v-if="s.ctaText_en" class="text-disabled">{{ s.ctaText_en }}</div>
              <div v-if="s.ctaTo" class="mt-1">
                <a :href="s.ctaTo" class="text-primary" target="_blank">{{ s.ctaTo }}</a>
              </div>
            </td>
            <td class="px-4 py-3 text-medium-emphasis">{{ fmtDate(s.updated_at) }}</td>
            <td class="px-4 py-3">
              <div class="d-flex justify-end ga-2">
                <v-btn size="small" variant="tonal" @click="openForm(s, (page - 1) * perPage + i)">แก้ไข</v-btn>
                <v-btn size="small" color="error" variant="tonal" @click="askDelete(s)">ลบ</v-btn>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && items.length === 0">
            <td colspan="6" class="px-6 py-10">
              <div class="d-flex flex-column align-center justify-center text-center ga-2">
                <v-avatar size="64" color="grey-lighten-3">
                  <v-icon icon="mdi-image-multiple-outline" />
                </v-avatar>
                <div class="text-subtitle-1">ยังไม่มีสไลด์</div>
                <div class="text-medium-emphasis text-body-2">เริ่มเพิ่มสไลด์แรกของคุณได้เลย</div>
                <v-btn class="mt-2" color="primary" rounded="xl" @click="openForm()">
                  <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มสไลด์
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
    <SlideForm
      :open="showForm"
      :model-value="editing"
      @update:open="showForm = $event"
      @saved="onSaved"  
    />
  </v-container>
</template>