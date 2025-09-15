export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('app-access-token').value

  if (!token && to.path.startsWith('/admin')) {
    return navigateTo('/admin')
  }
})