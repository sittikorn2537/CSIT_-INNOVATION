// utils/toFormData.ts
export function toFormData(payload: Record<string, any>) {
  const fd = new FormData()
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (v instanceof File) fd.append(k, v)
    else fd.append(k, String(v))
  })
  return fd
}