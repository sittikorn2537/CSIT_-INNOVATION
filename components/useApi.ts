// composables/useApi.ts
export const useApi = async (url: string, options: any = {}) => {
  const config = useRuntimeConfig()
  const token = useCookie('app-access-token').value

  return $fetch(url, {
    baseURL: config.public.apiBase,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
    ...options,
  })
}