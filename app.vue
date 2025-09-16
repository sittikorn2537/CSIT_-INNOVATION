<script setup lang="ts">
import { useHead } from '#imports'
import { useContactInfo } from '~/composables/useContactInfo'

const { info } = useContactInfo()

const { t } = useI18n()


watch(
  () => info.value?.logo_url,
  (logo) => {
    if (!logo) return
    useHead({
      title: t('meta.title'),
      meta: [
        { name: 'description', content: t('meta.description') },
        { property: 'og:title', content: t('meta.ogTitle') },
        { property: 'og:description', content: t('meta.ogDescription') },
        { property: 'og:image', content: t('meta.ogImage') }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: logo },
        { rel: 'apple-touch-icon', href: logo }
      ]
    })
  },
  { immediate: true }
)
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
