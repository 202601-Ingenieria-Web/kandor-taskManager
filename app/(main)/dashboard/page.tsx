import { verifySession, getUser } from '@/lib/dal'
import prisma from '@/lib/prisma'

const statusLabels: Record<string, string> = {
  BACKLOG: 'Backlog', TODO: 'Por Hacer', IN_PROGRESS: 'En Progreso',
  REVIEW: 'Revisión', DONE: 'Completado',
}

const statusColors: Record<string, string> = {
  BACKLOG: 'bg-gray-100 text-gray-700',
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  REVIEW: 'bg-purple-100 text-purple-700',
  DONE: 'bg-green-100 text-green-700',
}

const statusIcons: Record<string, string> = {
  BACKLOG: '📋',
  TODO: '📝',
  IN_PROGRESS: '⚡',
  REVIEW: '🔍',
  DONE: '✅',
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
          Bienvenido, <span className="text-teal-600">{user?.name}</span>
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
            <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center">
              <span className="text-xl">{totalTasks > 0 ? '📊' : '📭'}</span>
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
                <span className="text-xl">{statusIcons[t.status] || '📋'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
