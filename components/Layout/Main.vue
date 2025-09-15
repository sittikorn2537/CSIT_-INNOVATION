<script setup lang="ts">
import { ref, shallowRef } from "vue";
import sidebarItems from "@/components/Layout/Full/vertical-sidebar/sidebarItem";
// Icon Imports
import { Menu2Icon, BellRingingIcon } from "vue-tabler-icons";
const sidebarMenu = shallowRef(sidebarItems);
const sDrawer = ref(true);
</script>


<template>
  <v-navigation-drawer left v-model="sDrawer" app class="leftSidebar bg-containerBg ms-lg-5 mt-sm-5 bg-containerBg "
    elevation="10" width="270">
    <div class="pa-5 pl-4">
      <LayoutFullLogoDark />
    </div>
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <!-- ตัวอย่าง -->

    <perfect-scrollbar class="scrollnavbar bg-containerBg overflow-y-hidden">
      <v-list class="py-4 px-4 bg-containerBg">

        <!---Menu Loop -->
        <template v-for="(item, i) in sidebarMenu">
          <!---Item Sub Header -->
          <LayoutFullVerticalSidebarNavGroup :item="item" v-if="item.header" :key="item.title" />
          <!---If Has Child -->
          <LayoutFullVerticalSidebarNavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
          <!---Single Item-->
          <LayoutFullVerticalSidebarNavItem :item="item" v-else class="leftPadding" />
          <!---End Single Item-->
        </template>
        <!-- <Moreoption/> -->
      </v-list>

    </perfect-scrollbar>
  </v-navigation-drawer>
  
</template>
<style lang="sass">
</style>