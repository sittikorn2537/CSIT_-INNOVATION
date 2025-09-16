<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type ApiWork = {
  id: number | string
  categories_id?: number | string
  categories_th?: string
  categories_en?: string
  title_th?: string
  title_en?: string
  image_url?: string
  description?: string
  updated_at?: string
}

type Item = {
  id: number
  src: string
  category: string
}

const { $api } = useNuxtApp()
const { locale } = useI18n()

/* -------- state -------- */
const raw = ref<ApiWork[]>([])
const items = computed<Item[]>(() =>
  raw.value.map(w => ({
    id: Number(w.id),
    src: normalizeUrl(w.image_url),
    category: locale.value === 'th'
      ? (w.categories_th || tAll.value)
      : (w.categories_en || tAll.value)
  }))
)

const tAll = computed(() => (locale.value === 'th' ? 'ทั้งหมด' : 'All'))
const activeCat = ref<string>(tAll.value)

const categories = computed(() => {
  const set = new Set<string>()
  set.add(tAll.value)
  items.value.forEach(i => set.add(i.category || tAll.value))
  return Array.from(set)
})

const filtered = computed(() => {
  if (activeCat.value === tAll.value) {
    // ถ้าเลือก "ทั้งหมด" → return ทั้งหมด
    return items.value
  }
  return items.value.filter(i => i.category === activeCat.value)
})

/* -------- helpers -------- */
const normalizeUrl = (u?: string) => (u ? (u.startsWith('//') ? 'https:' + u : u) : '')

/* -------- load API -------- */
const loadWorks = async () => {
  try {
    const res = await $api<any>('/settings/works')
    raw.value = Array.isArray(res) ? res : (res?.data || [])
    // รีเซ็ต activeCat ให้สอดคล้องภาษา
    if (!categories.value.includes(activeCat.value)) activeCat.value = tAll.value
    // refresh observer หลังข้อมูลมา
    await nextTick()
    makeObserver()
    observeCards()
  } catch (e) {
    console.error('Load /settings/works failed:', e)
    raw.value = []
  }
}

/* -------- IntersectionObserver -------- */
const gridEl = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

const makeObserver = () => {
  io?.disconnect()
  io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        (e.target as HTMLElement).classList.add('show')
        io?.unobserve(e.target)
      }
    })
  }, { threshold: 0.15 })
}

const observeCards = async () => {
  await nextTick()
  if (!gridEl.value) return
  const cards = gridEl.value.querySelectorAll<HTMLElement>('.js-card')
  cards.forEach((el, idx) => {
    el.classList.remove('show')
    el.style.setProperty('--delay', `${idx * 60}ms`)
    io?.observe(el)
  })
}

/* -------- lifecycle & watchers -------- */
onMounted(async () => {
  makeObserver()
  await loadWorks()
})

watch(() => filtered.value.map(i => i.id).join(','), () => {
  makeObserver()
  observeCards()
}, { flush: 'post' })

watch(locale, loadWorks)

onBeforeUnmount(() => { io?.disconnect(); io = null })
</script>

<template>
  <main v-if="items.length > 0">
    <section class="py-12 md:py-16">
      <div class="max-w-6xl mx-auto px-4 lg:px-6 text-center">
        <!-- หัวข้อ -->
        <h2 class="our-work text-3xl md:text-4xl font-extrabold text-slate-800">
          {{ $t('nav.works') }}
        </h2>
        <!-- <div class="text-1xl my-5 max-w-4xl ma-auto">{{ $t('work.description') }}</div> -->

        <!-- เมนูหมวด -->
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <button
            v-for="c in categories"
            :key="c"
            class="px-4 py-2 rounded-full text-sm font-semibold transition ring-1"
            :class="activeCat === c
              ? 'bg-white text-slate-900 ring-slate-300 shadow-sm'
              : 'bg-slate-100/70 text-slate-500 ring-slate-200 hover:text-slate-800 hover:bg-white'"
            @click="activeCat = c"
          >
            {{ c }}
          </button>
        </div>

        <!-- กริดรูป (คงสไตล์เดิม) -->
        <div ref="gridEl" class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <figure
            v-for="it in filtered"
            :key="it.id"
            class="js-card card fade-up overflow-hidden rounded-lg bg-white shadow-sm"
          >
            <img :src="it.src" :alt="it.category" class="w-full h-56 md:h-60 object-cover" />
          </figure>
        </div>

        <!-- ปุ่มทั้งหมด -->
        <NuxtLink
          to="/our-work"
          class="our-work mt-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 transition"
        >
          {{ $t('work.all') }}
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.card.fade-up { opacity: 0; transform: translateY(16px); }
.card.fade-up.show {
  animation: kfFadeUp .6s cubic-bezier(.22,.61,.36,1) both;
  animation-delay: var(--delay, 0ms);
}
@keyframes kfFadeUp {
  from { opacity: 0; transform: translateY(16px) scale(.995); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>