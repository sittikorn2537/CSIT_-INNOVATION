import { defineEventHandler, getQuery, type H3Event } from 'h3'
import type { RowDataPacket } from 'mysql2'
import { useDB } from '../../../utils/db'
import { camelKeys } from '../../../utils/sql'

type User = {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export default defineEventHandler(async (event: H3Event) => {
  const db = useDB()
  const q = getQuery(event)
  const page = Number(q.page ?? 1)
  const perPage = Math.min(Math.max(Number(q.perPage ?? 10), 1), 100)
  const search = (q.search ?? '').toString().trim()

  const where: string[] = []
  const params: any[] = []

  if (search) {
    where.push('(name LIKE ? OR email LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const [[{ total }]] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM users ${whereSQL}`,
    params
  ) as any

  const offset = (page - 1) * perPage
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, name, email, created_at, updated_at
     FROM users
     ${whereSQL}
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  )

  const data = camelKeys<User>(rows as any)

  return {
    data,
    page: {
      current: page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    }
  }
})