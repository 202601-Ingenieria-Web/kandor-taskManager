import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const existing = await prisma.project.count()
  if (existing > 0) {
    console.log(`✓ ${existing} proyectos ya existen`)
    return
  }

  await prisma.project.createMany({
    data: [
      { name: 'Proyecto Alpha', description: 'Proyecto de prueba', color: '#3b82f6' },
      { name: 'Proyecto Beta', description: 'Segundo proyecto de prueba', color: '#10b981' },
      { name: 'Proyecto Gamma', description: 'Tercer proyecto de prueba', color: '#f59e0b' },
    ],
  })
  console.log('✓ 3 proyectos de demo creados')
}

main().catch(console.error).finally(() => prisma.$disconnect())
