import type { ContactInfo, ApiResponse } from '~/types/contact-info'

/**
 * ใช้งาน:
 * const { info, loading, error, refresh, setInfo } = useContactInfo()
 */
export const useContactInfo = () => {
  const info    = useState<ContactInfo | null>('contact-info', () => null)
  const loading = useState<boolean>('contact-info-loading', () => false)
  const error   = useState<string | null>('contact-info-error', () => null)

  const fetchOnce = async () => {
    if (info.value || loading.value) return
    await refresh()
  }

  const refresh = async () => {
    const { $api } = useNuxtApp()
    loading.value = true
    error.value = null
    try {
      const res = await $api<ApiResponse<ContactInfo>>('/settings/contacts/1')
      // บาง backend จะคืน {data:{...}} หรือ {...} ตรง ๆ
      info.value = res?.data ?? (res as any) ?? null
    } catch (e: any) {
      error.value = e?.message || 'Failed to load contact info'
    } finally {
      loading.value = false
    }
  }

  const setInfo = (next: ContactInfo | null) => { info.value = next }

  return { info, loading, error, fetchOnce, refresh, setInfo }
}