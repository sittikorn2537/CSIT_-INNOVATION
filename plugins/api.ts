// plugins/api.ts
export default defineNuxtPlugin(() => {
  // Keep token in a cookie so both client & server can read it
  const tokenCookie = useCookie<string | null>('app-access-token', {
    path: '/',
    sameSite: 'lax',
  })

  const config = useRuntimeConfig()

  const apiBase = config.public.apiBase || 'http://localhost:3000'

  const api = $fetch.create({
    baseURL: apiBase,


    // Attach headers before every request
    onRequest({ options }) {
      // Normalize any incoming headers (Headers | string[][] | Record<string,string>)
      const hdrs = new Headers(options.headers as HeadersInit)

      // Default JSON headers when suitable
      if (!hdrs.has('Accept')) hdrs.set('Accept', 'application/json')

      const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
      if (!hdrs.has('Content-Type') && options.body && typeof options.body === 'object' && !isFormData) {
        hdrs.set('Content-Type', 'application/json')
      }

      // Attach Bearer token if present
      if (tokenCookie.value && !hdrs.has('Authorization')) {
        hdrs.set('Authorization', `Bearer ${tokenCookie.value}`)
      }

      // Assign back as HeadersInit
      options.headers = hdrs
    },

    // Read token from response headers (server must expose it via CORS)
    onResponse({ response }) {
      const hdr =
        response.headers.get('app-access-token') ||
        response.headers.get('App-Access-Token')

      if (hdr) {
        tokenCookie.value = hdr
      }
    },

    // Optional: surface nicer error messages
    onResponseError({ response }) {
      // You can tailor this to your API shape
      const msg =
        (response?._data && (response._data.message || response._data.error)) ||
        response?.statusText ||
        'Request failed'
      // Throw a normalized error object
      throw createError({ statusCode: response?.status || 500, statusMessage: msg, data: response?._data })
    },
  })

  return { provide: { api } }
})