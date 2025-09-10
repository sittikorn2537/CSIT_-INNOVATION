import { z } from 'zod'

export const userCreateSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('invalid email'),
})

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
})