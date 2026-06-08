import { verifySession } from '@/lib/dal'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { UsersTable } from './users-table'
import { CreateUserDialog } from './create-user-dialog'

export default async function UsersPage() {
  const session = await verifySession()

  if (session.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, enabled: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <CreateUserDialog />
      </div>
      <UsersTable users={users} />
    </div>
  )
}
