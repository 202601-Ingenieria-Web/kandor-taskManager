import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { name, email, password, role } = await request.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: role || 'MEMBER' },
  })

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}
