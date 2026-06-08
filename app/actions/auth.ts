'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { LoginFormSchema, SignupFormSchema } from '@/lib/definitions'
import { createSession, deleteSession } from '@/lib/session'

export async function login(state: unknown, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { email, password } = validatedFields.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.enabled) {
    return { message: 'Invalid credentials.' }
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return { message: 'Invalid credentials.' }
  }

  await createSession(user.id, user.role)
  redirect('/dashboard')
}

export async function signup(state: unknown, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { name, email, password } = validatedFields.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { message: 'An account with this email already exists.' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  })

  await createSession(user.id, user.role)
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
