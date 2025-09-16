<script setup lang="ts">
import { ref, shallowRef, watch } from "vue"
import { useDisplay } from "vuetify"
import sidebarItems from "@/components/Layout/Full/vertical-sidebar/sidebarItem"

// Icon Imports
import { Menu2Icon } from "vue-tabler-icons"

const sidebarMenu = shallowRef(sidebarItems)
const sDrawer = ref(true)

const { lgAndUp } = useDisplay()

// ปรับค่าเริ่มต้นตามขนาดจอ
watch(
  () => lgAndUp.value,
  (isDesktop) => {
    sDrawer.value = isDesktop // desktop = true, mobile = false
  },
  { immediate: true }
)
</script>

<template>
  <v-navigation-drawer
    v-model="sDrawer"
    app
    class="leftSidebar bg-containerBg"
    elevation="10"
    width="270"
    :class="{
      'mt-lg-5 ms-lg-5': lgAndUp,  // desktop → margin
      'mt-0': !lgAndUp             // mobile toggle → margin-top 0
    }"
    :permanent="lgAndUp"
    :scrim="!lgAndUp"
    touchless
  >
    <div class="pa-5 pl-4">
      <LayoutFullLogoDark />
    </div>

    <perfect-scrollbar class="scrollnavbar bg-containerBg overflow-y-hidden">
      <v-list class="py-4 px-4 bg-containerBg">
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <LayoutFullVerticalSidebarNavGroup v-if="item.header" :item="item" />
          <LayoutFullVerticalSidebarNavCollapse
            v-else-if="item.children"
            class="leftPadding"
            :item="item"
            :level="0"
          />
          <LayoutFullVerticalSidebarNavItem v-else class="leftPadding" :item="item" />
        </template>
      </v-list>
    </perfect-scrollbar>
  </v-navigation-drawer>

  <!-- AppBar -->
  <div class="verticalLayout">
    <div class="maxWidth px-xl-0 px-sm-5 px-0">
      <v-app-bar elevation="0" height="70" class="top-header">
        <div class="d-flex align-center justify-space-between w-100">
          <div>
            <!-- ปุ่ม toggle เฉพาะ mobile -->
            <v-btn
              class="hidden-lg-and-up text-muted"
              @click="sDrawer = !sDrawer"
              icon
              variant="flat"
              size="small"
            >
              <Menu2Icon size="20" stroke-width="1.5" />
            </v-btn>
            <!-- <LayoutFullVerticalHeaderNotificationDD /> -->
          </div>
          <div>
            <LayoutFullVerticalHeaderProfileDD />
          </div>
        </div>
      </v-app-bar>
    </div>
  </div>
</template>