import { verifySession, getUser } from '@/lib/dal'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Bienvenido, {user?.name}</h1>
      <p className="text-muted-foreground">Rol: {session.role}</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Tareas</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalTasks}</p></CardContent>
        </Card>
        {taskCounts.map((t) => (
          <Card key={t.status}>
            <CardHeader><CardTitle>{t.status}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{t._count}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
