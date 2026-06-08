import { verifySession, getUser } from '@/lib/dal'
import prisma from '@/lib/prisma'

const statusLabels: Record<string, string> = {
  BACKLOG: 'Backlog', TODO: 'Por Hacer', IN_PROGRESS: 'En Progreso',
  REVIEW: 'Revisión', DONE: 'Completado',
}

const statusColors: Record<string, string> = {
  BACKLOG: 'bg-gray-100 text-gray-700',
  TODO: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  REVIEW: 'bg-purple-100 text-purple-700',
  DONE: 'bg-green-100 text-green-700',
}

export default async function DashboardPage() {
  const session = await verifySession()
  const user = await getUser()

  const taskCounts = await prisma.task.groupBy({
    by: ['status'],
    where: { deleted: false },
    _count: true,
  })

  const totalTasks = taskCounts.reduce((sum, t) => sum + t._count, 0)

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, <span className="text-blue-600">{user?.name}</span>
        </h1>
        <p className="text-gray-500 mt-1">Rol: {session.role}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tareas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {taskCounts.map((t) => (
          <div key={t.status} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{statusLabels[t.status] || t.status}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{t._count}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColors[t.status] || 'bg-gray-100'}`}>
                <span className="text-lg font-semibold">{t._count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
