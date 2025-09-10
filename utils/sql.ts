import type { RowDataPacket, ResultSetHeader } from 'mysql2'

export type Rows<T> = (T & RowDataPacket)[]
export type ExecResult = ResultSetHeader

export function camelKeys<T extends object>(rows: any[]): T[] {
  // ถ้าชื่อตาราง/คอลัมน์เป็น snake_case แล้วอยากแปลงก็ทำในนี้ได้
  return rows as T[]
}