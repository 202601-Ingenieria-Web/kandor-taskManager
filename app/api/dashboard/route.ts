import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.role as string;
  const baseWhere = { deleted: false } as any;

  let taskWhere: any = { ...baseWhere };
  let title = 'Todas las Tareas';

  if (role === 'MEMBER') {
    taskWhere = {
      ...baseWhere,
      assignments: { some: { userId: session.userId } },
    };
  } else if (role === 'TEAM_LEADER') {
    const ledProjects = await prisma.projectMember.findMany({
      where: { userId: session.userId, role: 'LEADER', status: 'ACTIVE' },
      select: { projectId: true },
    });
    const projectIds = ledProjects.map((m) => m.projectId);
    taskWhere = {
      ...baseWhere,
      OR: [
        { projectId: { in: projectIds.length > 0 ? projectIds : [''] } },
        { assignments: { some: { userId: session.userId } } },
      ],
    };
  }

  const tasks = await prisma.task.findMany({
    where: taskWhere,
    include: {
      assignments: { include: { user: { select: { id: true, name: true } } } },
      project: { select: { id: true, name: true, color: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const statusCounts = await prisma.task.groupBy({
    by: ['status'],
    where: taskWhere,
    _count: true,
  });
  const totalTasks = statusCounts.reduce((sum, t) => sum + t._count, 0);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  // ---- Chart data: last 30 days ----
  const visibleTaskIds = tasks.map((t) => t.id);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

  // Tasks created by date
  const createdBeforeDate: Record<string, number> = {};
  for (const t of tasks) {
    const key = t.createdAt.toISOString().slice(0, 10);
    createdBeforeDate[key] = (createdBeforeDate[key] || 0) + 1;
  }

  // Completion events from audit logs
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      createdAt: { gte: startDate },
      entity: 'Tarea',
      entityId: { in: visibleTaskIds.length > 0 ? visibleTaskIds : [''] },
    },
    orderBy: { createdAt: 'asc' },
    select: { action: true, detail: true, createdAt: true },
  });

  const completionsByDate: Record<string, number> = {};
  for (const log of auditLogs) {
    if (log.detail?.includes('a DONE')) {
      const dateKey = log.createdAt.toISOString().slice(0, 10);
      completionsByDate[dateKey] = (completionsByDate[dateKey] || 0) + 1;
    }
  }

  // Count tasks created BEFORE the start date (baseline)
  let baselineCreated = 0;
  for (const t of tasks) {
    if (t.createdAt < startDate) baselineCreated++;
  }

  // Build daily metrics with cumulative created, completed, and remaining
  let cumCreated = baselineCreated;
  let cumCompleted = 0;
  const dailyMetrics: {
    date: string;
    completed: number;
    created: number;
    remaining: number;
    burnup: number;
  }[] = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);

    const createdThatDay = createdBeforeDate[dateKey] || 0;
    const completedThatDay = completionsByDate[dateKey] || 0;

    cumCreated += createdThatDay;
    cumCompleted += completedThatDay;

    dailyMetrics.push({
      date: dateKey,
      completed: completedThatDay,
      created: createdThatDay,
      remaining: Math.max(0, cumCreated - cumCompleted),
      burnup: cumCompleted,
    });
  }

  return NextResponse.json({
    user,
    totalTasks,
    statusCounts,
    tasks,
    dailyMetrics,
    title: role === 'MEMBER' ? `Trabajo asignado a ${user?.name}` : role === 'TEAM_LEADER' ? 'Trabajo de mi equipo' : 'Todas las Tareas',
  });
}
