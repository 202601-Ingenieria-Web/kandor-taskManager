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
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">Administra los usuarios del sistema</p>
        </div>
        <CreateUserDialog />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <UsersTable users={users} />
      </div>
    </div>
  )
}
