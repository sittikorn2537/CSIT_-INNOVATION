<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmsDialog.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import type { ApiResponse } from '~/types/api'
import type { ProductItem } from '~/types/product'

const { $api } = useNuxtApp()

/* ---------- state ---------- */
const all = ref<ProductItem[]>([])
const items = ref<ProductItem[]>([])
const loading = ref(false)

const search = ref('')
const page = ref(1)
const perPage = ref(10)
const hasMore = ref(false)

const showForm = ref(false)
const editing = ref<ProductItem | null>(null)

/* confirm delete */
const showConfirm = ref(false)
const deleting = ref(false)
const deleteTarget = ref<{ id: string | number; name?: string } | null>(null)

/* helpers */
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')
const low = (v?: string) => (v || '').toLowerCase()
const money = (v?: string) => {
    if (!v && v !== '0') return '-'
    const n = Number(v)
    return isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 2 }) : v
}

/* ---------- API ---------- */
const apiList = async (): Promise<ProductItem[]> => {
    const res = await $api<ApiResponse<ProductItem[]>>('/settings/products')
    return res.data ?? []
}

const apiCreate = async (fd: FormData): Promise<ProductItem> => {
    const res = await $api<ApiResponse<ProductItem>>('/settings/products', { method: 'POST', body: fd })
    return res.data!
}

const apiUpdate = async (id: number | string, fd: FormData): Promise<ProductItem> => {
    const res = await $api<ApiResponse<ProductItem>>(`/settings/products/${id}`, { method: 'POST', body: fd })
    return res.data!
}

const apiDelete = async (id: number | string) => {
    await $api(`/settings/products/${id}`, { method: 'DELETE' })
}

/* ---------- load + filter ---------- */
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
        data = data.filter(p =>
            [p.product_name_th, p.product_name_en, p.product_link].some(v => low(v).includes(q))
        )
    }
    const start = (page.value - 1) * perPage.value
    const end = start + perPage.value
    hasMore.value = end < data.length
    items.value = data.slice(start, end)
}

/* ---------- UI actions ---------- */
const openForm = (p: ProductItem | null = null) => {
    editing.value = p ? JSON.parse(JSON.stringify(p)) : null
    showForm.value = true
}

const askDelete = (row: ProductItem) => {
    deleteTarget.value = { id: row.id, name: row.product_name_th }
    showConfirm.value = true
}

const confirmDelete = async () => {
    if (!deleteTarget.value) return
    try {
        deleting.value = true
        await apiDelete(deleteTarget.value.id)
        all.value = all.value.filter(p => String(p.id) !== String(deleteTarget.value!.id))
        filterAndPaginate()
    } finally {
        deleting.value = false
        showConfirm.value = false
        deleteTarget.value = null
    }
}

const onSaved = async (fd: FormData, index: number | null) => {
    loading.value = true
    try {
        let saved: ProductItem
        if (editing.value?.id) {
            saved = await apiUpdate(editing.value.id, fd)
            const pos = all.value.findIndex(p => String(p.id) === String(saved.id))
            if (pos > -1) all.value[pos] = saved
        } else {
            saved = await apiCreate(fd)
            all.value.unshift(saved)
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
        <!-- Header -->
        <div class="d-flex flex-column gap-3 mb-4">
            <div>
                <h2 class="text-h6 text-sm-h5 font-weight-medium mb-1">สินค้า</h2>
                <div class="text-medium-emphasis text-body-2">จัดการสินค้า ราคา และลิงก์</div>
            </div>

            <div class="d-flex flex-wrap align-center ga-2">
                <v-text-field v-model="search" class="flex-grow-1" density="comfortable" variant="solo" hide-details
                    rounded="xl" prepend-inner-icon="mdi-magnify" placeholder="ค้นหาสินค้า…" />
                <v-btn color="primary" rounded="xl" class="ms-auto" @click="openForm()">
                    <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มสินค้า
                </v-btn>
            </div>
        </div>

        <!-- Table -->
        <v-card rounded="xl" elevation="1">
            <v-table class="text-body-2 pa-5">
                <thead>
                    <tr>
                        <th class="px-4 py-3">ภาพ</th>
                        <th class="px-4 py-3">ชื่อสินค้า</th>
                        <th class="px-4 py-3">ราคา</th>
                        <th class="px-4 py-3">ประเภท</th>
                        <th class="px-4 py-3">เรตติ้ง</th>
                        <th class="px-4 py-3">อัปเดต</th>
                        <th class="px-4 py-3 text-right">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in items" :key="p.id" class="hover:bg-surface">
                        <td class="px-4 py-3">
                            <v-avatar rounded="lg" size="56" variant="tonal">
                                <v-img v-if="p.product_image_url" :src="p.product_image_url" cover />
                                <v-icon v-else icon="mdi-image-off" />
                            </v-avatar>
                        </td>
                        <td class="px-4 py-3 font-weight-medium">
                            <div>{{ p.product_name_th }}</div>
                            <div v-if="p.product_name_en" class="text-medium-emphasis">{{ p.product_name_en }}</div>
                        </td>
                        <td class="px-4 py-3">
                            <div class="text-high-emphasis">{{ money(p.sales_price || p.price) }}</div>
                            <div v-if="p.sales_price" class="text-decoration-line-through text-disabled">{{
                                money(p.price) }}</div>
                        </td>
                        <td class="px-4 py-3 font-weight-medium">
                            <div>{{ p.name_th }}</div>
                            <div v-if="p.name_en" class="text-medium-emphasis">{{ p.name_en }}</div>
                        </td>
                        <td class="px-4 py-3">{{ p.rating || '-' }}</td>
                        <td class="px-4 py-3 text-medium-emphasis">{{ fmtDate(p.updated_at) }}</td>
                        <td class="px-4 py-3">
                            <div class="d-flex justify-end ga-2">
                                <v-btn size="small" variant="tonal" @click="openForm(p)">แก้ไข</v-btn>
                                <v-btn size="small" color="error" variant="tonal" @click="askDelete(p)">ลบ</v-btn>
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
        <ConfirmDialog v-model:open="showConfirm" :loading="deleting" title="ยืนยันการลบ"
            :message="`คุณต้องการลบ <b>${deleteTarget?.name || 'สินค้า'}</b> ใช่หรือไม่?<br/>การกระทำนี้ไม่สามารถย้อนกลับได้`"
            confirmText="ลบสินค้า" cancelText="ยกเลิก" color="error" @confirm="confirmDelete" />

        <!-- Dialog Form -->
        <ProductForm :open="showForm" :model-value="editing" @update:open="showForm = $event" @saved="onSaved" />
    </v-container>
</template>