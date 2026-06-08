import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const count = await prisma.project.count()
  if (count === 0) {
    await prisma.project.createMany({
      data: [
        { name: 'Proyecto Alpha', description: 'Proyecto de prueba', color: '#3b82f6', status: 'ACTIVE' },
        { name: 'Proyecto Beta', description: 'Segundo proyecto de prueba', color: '#10b981', status: 'ACTIVE' },
        { name: 'Proyecto Gamma', description: 'Tercer proyecto de prueba', color: '#f59e0b', status: 'ACTIVE' },
      ],
    })
    console.log('✓ 3 proyectos activos creados')
  } else {
    await prisma.project.updateMany({ data: { status: 'ACTIVE' } })
    console.log(`✓ ${count} proyectos actualizados a ACTIVE`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
