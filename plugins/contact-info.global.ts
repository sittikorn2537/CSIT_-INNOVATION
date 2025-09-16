
// ทำงานทั้ง server + client
export default defineNuxtPlugin(async () => {
  const { info, fetchOnce } = useContactInfo()
  // ถ้ามีข้อมูลแล้ว (เช่นจาก SSR) จะไม่ยิงซ้ำ
  await fetchOnce()
  // ทำให้ available บน nuxtApp.provide ด้วย (เผื่ออยาก inject ภายนอก)
  return {
    provide: {
      contactInfo: info
    }
  }
})