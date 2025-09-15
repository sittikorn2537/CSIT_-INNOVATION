<template>
    <v-container class="py-6" fluid>
        <!-- Header + Tools -->
        <div class="d-flex flex-column gap-3 mb-4">
            <div>
                <h2 class="text-h6 text-sm-h5 font-weight-medium mb-1">สินค้า</h2>
                <div class="text-medium-emphasis text-body-2">จัดการรายการสินค้า หมวดหมู่ และรายละเอียด</div>
            </div>

            <!-- ทำให้ไหลลงบรรทัดถ้าจอแคบ -->
            <div class="d-flex flex-wrap align-center ga-2">
                <v-text-field v-model="search" class="flex-grow-1" density="comfortable" variant="solo" hide-details
                    rounded="xl" prepend-inner-icon="mdi-magnify" placeholder="ค้นหาสินค้า…" style="min-width:220px" />
                <v-select v-model="categoryFilter" :items="categoryItems" item-title="name_th" item-value="id"
                    return-object clearable density="comfortable" variant="solo" hide-details rounded="xl"
                    style="min-width:200px" label="ทุกหมวดหมู่" />
                <v-btn color="primary" rounded="xl" class="ms-auto" @click="openForm()">
                    <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มสินค้า
                </v-btn>
            </div>
        </div>

        <!-- List Card -->
        <v-card rounded="xl" elevation="1">
            <v-table class="text-body-2 pa-5">
                <thead>
                    <tr>
                        <th class="px-4 py-3">ภาพ</th>
                        <th class="px-4 py-3">ชื่อสินค้า</th>
                        <th class="px-4 py-3">ชื่อสินค้าอังกฤษ</th>
                        <th class="px-4 py-3">หมวดหมู่</th>
                        <th class="px-4 py-3">อัปเดต</th>
                        <th class="px-4 py-3 text-right">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in products" :key="p.id" class="hover:bg-surface">
                        <td class="px-4 py-3">
                            <v-avatar rounded="lg" size="48" variant="tonal">
                                <v-img v-if="p.image_url" :src="p.image_url" cover />
                                <v-icon v-else icon="mdi-image-off" />
                            </v-avatar>
                        </td>
                        <td class="px-4 py-3 font-weight-medium">{{ p.name_th }}</td>
                        <td class="px-4 py-3 font-weight-medium">{{ p.name_en }}</td>
                        <td class="px-4 py-3">
                            <v-chip size="small" color="grey-lighten-2" class="text-high-emphasis">
                                {{ categoryName(p.category_id) }}
                            </v-chip>
                        </td>
                        <td class="px-4 py-3 text-medium-emphasis">{{ formatDate(p.updated_at) }}</td>
                        <td class="px-4 py-3">
                            <div class="d-flex justify-end ga-2">
                                <v-btn size="small" variant="tonal" @click="openForm(p)">
                                    แก้ไข
                                </v-btn>
                                <v-btn size="small" color="error" variant="tonal" @click="remove(p)">
                                    ลบ
                                </v-btn>
                            </div>
                        </td>
                    </tr>

                    <!-- Empty state -->
                    <tr v-if="!loading && products.length === 0">
                        <td colspan="5" class="px-6 py-10">
                            <div class="d-flex flex-column align-center justify-center text-center ga-2">
                                <v-avatar size="64" color="grey-lighten-3"><v-icon
                                        icon="mdi-package-variant" /></v-avatar>
                                <div class="text-subtitle-1">ยังไม่มีสินค้า</div>
                                <div class="text-medium-emphasis text-body-2">เริ่มเพิ่มสินค้าชิ้นแรกของคุณได้เลย</div>
                                <v-btn class="mt-2" color="primary" rounded="xl" @click="openForm()">
                                    <v-icon icon="mdi-plus" class="mr-1" /> เพิ่มสินค้า
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
        <ProductForm v-model:open="showForm" :categories="categories" :model-value="editing" @saved="refresh" />
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import ProductForm from '@/components/product/ProductForm.vue'

type Category = { id: string; name_th: string; name_en?: string }
type Product = {
  id: string
  category_id: string
  name?: string
  name_th?: string
  name_en?: string
  short_desc_th?: string
  short_desc_en?: string
  image_url?: string
  updated_at?: string
}

const allProducts = ref<Product[]>([])   // เก็บดิบทั้งหมดไว้ที่นี่
const products     = ref<Product[]>([])
const categories   = ref<Category[]>([])

const loading = ref(false)
const search = ref('')
const categoryFilter = ref<Category | null>(null)

const page = ref(1)
const perPage = ref(10)
const hasMore = ref(false)

const showForm = ref(false)
const editing = ref<Product | null>(null)

const categoryItems = computed(() => [{ id: '', name_th: 'ทุกหมวดหมู่' } as Category, ...categories.value])

// const openForm = (p: Product | null = null) => { editing.value = p; showForm.value = true }
// openForm: ส่ง clone
const openForm = (p: any = null) => {
  editing.value = p ? JSON.parse(JSON.stringify(p)) : null
  showForm.value = true
}

const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString() : '-'
const categoryName = (id: string) => categories.value.find(c => c.id === id)?.name_th || '-'

const fetchCategories = async () => {
  categories.value = await fetch('/mock/categories.json').then(r => r.json())
}

// โหลดสินค้าครั้งเดียว แล้วค่อย filter ในเมมโมรี่
const fetchAllProducts = async () => {
  loading.value = true
  try {
    allProducts.value = await fetch('/mock/products.json').then(r => r.json())
  } finally {
    loading.value = false
  }
}

// helper ป้องกัน undefined
const low = (v?: string) => (v || '').toLowerCase()

// ทำ filter + paginate
const recompute = () => {
  let list = allProducts.value.slice()

  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(p =>
      [
        p.name, p.name_th, p.name_en,
        p.short_desc_th, p.short_desc_en
      ].some(v => low(v).includes(q))
    )
  }

  if (categoryFilter.value?.id) {
    list = list.filter(p => p.category_id === categoryFilter.value!.id)
  }

  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  hasMore.value = end < list.length
  products.value = list.slice(start, end)
}

const refresh = () => { showForm.value = false; fetchAllProducts().then(recompute) }
const remove = async (_p: Product) => { await fetchAllProducts(); recompute() }

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchAllProducts()])
  recompute()
})

// รีคอมพิวต์เมื่อค้นหา/กรอง/เปลี่ยนหน้า
watch([search, categoryFilter], () => { page.value = 1; recompute() })
watch(page, recompute)
</script>
