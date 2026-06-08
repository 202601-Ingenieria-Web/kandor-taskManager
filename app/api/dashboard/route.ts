import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.role as string;

  // -- Base task filter (exclude deleted) --
  const baseWhere = { deleted: false } as any;

  // -- Role-based task filtering --
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

  // -- Fetch tasks --
  const tasks = await prisma.task.findMany({
    where: taskWhere,
    include: {
      assignments: { include: { user: { select: { id: true, name: true } } } },
      project: { select: { id: true, name: true, color: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // -- Current counts by status --
  const statusCounts = await prisma.task.groupBy({
    by: ['status'],
    where: taskWhere,
    _count: true,
  });
  const totalTasks = statusCounts.reduce((sum, t) => sum + t._count, 0);

  // -- User info --
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  // -- Daily metrics from audit logs (last 30 days, filtered by visible tasks) --
  const visibleTaskIds = tasks.map((t) => t.id);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

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

  const dailyMetrics: { date: string; completed: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    dailyMetrics.push({
      date: dateKey,
      completed: completionsByDate[dateKey] || 0,
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
