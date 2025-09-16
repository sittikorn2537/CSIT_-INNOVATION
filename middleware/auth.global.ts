export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('app-access-token').value

  // ไม่มี token → อนุญาตให้อยู่ที่ /admin (หน้า login) ได้เท่านั้น
  if (!token) {
    // พยายามเข้าโซน /admin อื่นๆ → เด้งกลับหน้า login (/admin)
    if (to.path.startsWith('/admin') && to.path !== '/admin') {
      return navigateTo('/admin')
    }
    return // หน้าที่ไม่ใช่ /admin/* ปล่อยผ่าน
  }

  // มี token แล้ว → ถ้าอยู่หน้า /admin (ซึ่งเป็นหน้า login) ให้เด้งเข้าหน้าหลังบ้านจริง
  if (token && to.path === '/admin') {
    // เปลี่ยนปลายทางตามหน้าที่ต้องการ (เช่น /admin/slide หรือ /admin/dashboard)
    return navigateTo('/admin/slide')
  }

  // อย่างอื่นปล่อยผ่าน
})