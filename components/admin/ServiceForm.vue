<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { ServiceItem } from '~/types/service';

// type ให้ตรง schema API
type IconKind = 'emoji' | 'iconify' | 'none'



const props = defineProps<{
  open: boolean
  modelValue: { service: ServiceItem | null; index: number | null } | null
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'saved', data: ServiceItem, index: number | null): void
}>()

/* ---------- form state ---------- */
const iconType = ref<IconKind>('none')


const form = reactive<ServiceItem>({
  id: '',
  title_th: '',
  title_en: '',
  description_th: '',
  description_en: '',
  icon: '🧩',
  icon_kind: 'emoji',
  updated_at: ''
})

watch(
  () => props.modelValue,
  (v) => {
    const s = v?.service
    if (s) {
      Object.assign(form, s)
      iconType.value = s.icon_kind || 'emoji'
    } else {
      form.id = ''
      form.title_th = ''
      form.title_en = ''
      form.description_th = ''
      form.description_en = ''
      form.icon = '🛠️'
      form.icon_kind = 'emoji'
      form.updated_at = ''
      iconType.value = 'emoji'
    }
  },
  { immediate: true }
)

const close = () => emit('update:open', false)
const save = () => {
  if (!form.title_th.trim()) return
  if (!form.icon) return

  const now = new Date().toISOString()
  const data: ServiceItem = {
    ...form,
    id: form.id ,
    icon_kind: iconType.value,
    updated_at: now,
  }
  emit('saved', data, props.modelValue?.index ?? null)
}

/* ---------- Emoji Picker ---------- */
const EMOJI_PRESET = [
  '🛠️','⚙️','🔧','🔩','🧰','🧪','🔬','⚡','🔌','💡','🔋','📡','🛰️','📶','🖥️','💻','🖱️','⌨️','📱','📲','☎️','🔈','🔊','🎛️',
  '📦','🚚','🏷️','🧾','📄','🗂️','📊','📈','📉',
  '🧭','🗺️','📍','📌','🧷',
  '🏠','🏢','🏭','🏗️','🏬','🏫','🏥',
  '👨‍💻','👩‍💻','👷‍♂️','👷‍♀️','🧑‍🔧','🧑‍🏭',
  '✅','☑️','✔️','🔒','🛡️','♻️','⭐','🔥','🚀',
  '💬','📣','✉️','📧','💼','📝','🗒️','📅','⏱️',
  '🔍','🧠','💡','🧩','📎','🔗','🧯','🧹','🪛','🪫','🔭'
]
const pickEmoji = (e: string) => {
  form.icon = e
  iconType.value = 'emoji'
  form.icon_kind = 'emoji'
}

/* ---------- Iconify Picker ---------- */
const ICONIFY_PRESET = [
  'mdi:web','mdi:web-box','mdi:domain','mdi:office-building','mdi:home-city','mdi:office-building-outline',
  'mdi:application-brackets','mdi:application-cog','mdi:cog','mdi:cogs','mdi:tools','mdi:wrench','mdi:screwdriver',
  'mdi:hammer-wrench','mdi:robot','mdi:chip','mdi:cpu-64-bit','mdi:server','mdi:database','mdi:cloud-outline',
  'mdi:cloud-check-outline','mdi:cloud-sync-outline','mdi:shield-check','mdi:shield-outline','mdi:lock-check','mdi:key',
  'mdi:lightning-bolt','mdi:flash','mdi:solar-power','mdi:power-plug','mdi:car-electric','mdi:battery','mdi:led-on',
  'mdi:chart-line','mdi:chart-bar','mdi:finance','mdi:clipboard-text','mdi:clipboard-list','mdi:file-document',
  'mdi:file-multiple','mdi:note-text','mdi:calendar','mdi:timeline','mdi:history','mdi:clock-outline',
  'mdi:magnify','mdi:binoculars','mdi:compass','mdi:radar','mdi:wifi','mdi:lan-connect','mdi:lan-pending','mdi:router-wireless',
  'mdi:rss','mdi:access-point','mdi:antenna','mdi:access-point-network','mdi:google-ads','mdi:google-analytics',
  'mdi:google-cloud','mdi:microsoft-azure','mdi:aws','mdi:firebase','mdi:github','mdi:git','mdi:gitlab',
  'mdi:headset','mdi:message','mdi:chat','mdi:chat-processing','mdi:phone','mdi:email','mdi:forum','mdi:phone-in-talk',
  'mdi:account','mdi:account-group','mdi:account-cog','mdi:account-tie','mdi:account-star','mdi:account-badge',
  'mdi:bag-checked','mdi:truck','mdi:package-variant-closed','mdi:barcode','mdi:qrcode-scan','mdi:tag','mdi:cash',
  'mdi:cart','mdi:store','mdi:storefront','mdi:warehouse','mdi:home','mdi:office-building-cog','mdi:factory',
  'mdi:home-lightbulb','mdi:home-lightbulb-outline','mdi:home-battery','mdi:home-battery-outline',
  'mdi:shield-sun','mdi:weather-sunny','mdi:lightbulb-on','mdi:lightbulb-group','mdi:star','mdi:star-check',
  'mdi:rocket','mdi:rocket-launch','mdi:airplane-takeoff','mdi:target','mdi:flag-checkered','mdi:trophy',
  'mdi:check-decagram','mdi:checkbox-marked-circle','mdi:check-circle','mdi:check-all','mdi:thumb-up','mdi:hand-okay',
  'mdi:human-greeting','mdi:handshake','mdi:head-lightbulb','mdi:brain','mdi:bulb','mdi:map-marker','mdi:map-search-outline'
]

const pickIconify = (name: string) => {
  form.icon = name
  iconType.value = 'iconify'
  form.icon_kind = 'iconify'
}
</script>

<template>
  <v-dialog :model-value="open" max-width="920" @update:model-value="emit('update:open', $event)">
    <v-card rounded="xl">
      <v-card-title class="py-4 px-6">
        {{ form.id ? 'แก้ไขบริการ' : 'เพิ่มบริการ' }}
      </v-card-title>
      <v-divider />

      <v-card-text class="px-6 py-5">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.title_th" label="ชื่อบริการ (ไทย)" variant="outlined" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.title_en" label="ชื่อบริการ (อังกฤษ)" variant="outlined" />
          </v-col>

          <v-col cols="12" md="6">
            <v-textarea v-model="form.description_th" label="รายละเอียด (ไทย)" variant="outlined" auto-grow />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea v-model="form.description_en" label="รายละเอียด (อังกฤษ)" variant="outlined" auto-grow />
          </v-col>
        </v-row>

        <!-- ICON PICKER -->
        <v-card variant="tonal" class="pa-4 mt-4">
          <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-3">
            <div class="text-subtitle-1">เลือกไอคอน</div>

            <!-- ✅ Preview ชัด ไม่ซ้อน และไม่หด -->
            <div class="preview d-flex align-center ga-2">
              <span class="preview-label">Preview</span>
              <div class="preview-box">
                <template v-if="iconType === 'emoji'">
                  <div class="emoji">{{ form.icon }}</div>
                </template>
                <template v-else>
                  <Icon v-if="form.icon" :icon="form.icon" width="26" height="26" />
                </template>
              </div>
            </div>
          </div>

          <v-btn-toggle v-model="iconType" mandatory rounded="xl" density="comfortable" class="mb-4">
            <v-btn value="emoji">Emoji</v-btn>
            <v-btn value="iconify">Iconify</v-btn>
          </v-btn-toggle>

          <div v-if="iconType === 'emoji'" class="d-flex flex-wrap" style="gap:10px">
            <button v-for="e in EMOJI_PRESET" :key="e" @click="pickEmoji(e)" type="button" class="e-btn">
              {{ e }}
            </button>
          </div>

          <div v-else class="d-flex flex-wrap" style="gap:10px">
            <button v-for="name in ICONIFY_PRESET" :key="name" @click="pickIconify(name)" type="button" class="i-btn">
              <Icon :icon="name" width="20" height="20" /> 
            </button>
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn variant="text" @click="close">ยกเลิก</v-btn>
        <v-btn color="primary" @click="save">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.e-btn,
.i-btn {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  background: white;
  transition: .15s;
}

.e-btn:hover,
.i-btn:hover {
  background: #f5f5f5;
}
</style>