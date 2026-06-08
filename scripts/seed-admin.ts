import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'admin@admin.com'
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { name: 'userADMIN', password: await bcrypt.hash('rootadmin', 10), role: 'ADMIN', enabled: true },
    })
    console.log('✓ userADMIN actualizado a ADMIN')
  } else {
    await prisma.user.create({
      data: { name: 'userADMIN', email, password: await bcrypt.hash('rootadmin', 10), role: 'ADMIN' },
    })
    console.log('✓ userADMIN creado como ADMIN')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
