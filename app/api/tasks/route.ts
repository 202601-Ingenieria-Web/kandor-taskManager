import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';
import { recordAuditLog } from '@/lib/audit-log';

const taskInclude = {
  assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
  project: { select: { id: true, name: true, color: true } },
  items: { orderBy: { createdAt: 'asc' as const } },
};

export async function GET() {
  const tasks = await prisma.task.findMany({
    where: { deleted: false },
    include: taskInclude,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, status, priority, dueDate, estimatedHours, projectId, assigneeIds } = await request.json();

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  if (projectId && session.role !== 'ADMIN' && session.role !== 'TEAM_LEADER') {
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: session.userId, projectId } },
    });
    if (!membership || membership.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'You are not a member of this project' }, { status: 403 });
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      projectId: projectId || null,
      assignments: assigneeIds?.length
        ? { create: assigneeIds.map((userId: string) => ({ userId })) }
        : undefined,
    },
    include: taskInclude,
  });

  await recordAuditLog({
    action: 'CREATED', entity: 'Tarea', entityId: task.id,
    detail: `${title}`,
    userId: session.userId, projectId,
  });

  return NextResponse.json({ task }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, title, description, status, priority, dueDate, estimatedHours, projectId, assigneeIds } = await request.json();

  if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.deleted) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours ? parseFloat(estimatedHours) : null;
  if (projectId !== undefined) updateData.projectId = projectId || null;

  await prisma.task.update({ where: { id }, data: updateData });

  const changes: string[] = [];
  if (status !== undefined && status !== existing.status) changes.push(`movida de ${existing.status} a ${status}`);
  if (title !== undefined && title !== existing.title) changes.push(`título a "${title}"`);
  if (priority !== undefined && priority !== existing.priority) changes.push(`prioridad a ${priority}`);
  if (description !== undefined && description !== (existing.description ?? '')) changes.push('descripción actualizada');
  if (dueDate !== undefined && (dueDate ? new Date(dueDate).toISOString() : null) !== (existing.dueDate?.toISOString() ?? null)) changes.push('fecha vencimiento actualizada');
  if (estimatedHours !== undefined && (estimatedHours ? parseFloat(estimatedHours) : null) !== existing.estimatedHours) changes.push('horas estimadas actualizadas');

  if (changes.length > 0) {
    await recordAuditLog({
      action: changes[0].startsWith('movida') ? 'MOVED' : 'UPDATED',
      entity: 'Tarea', entityId: id,
      detail: `"${existing.title}": ${changes.join(', ')}`,
      userId: session.userId, projectId: existing.projectId,
    });
  }

  if (assigneeIds !== undefined) {
    const oldAssignments = await prisma.taskAssignment.findMany({ where: { taskId: id }, select: { userId: true } });
    const oldIds = oldAssignments.map((a) => a.userId).sort();
    const newIds = [...(assigneeIds as string[])].sort();
    const changed = oldIds.length !== newIds.length || oldIds.some((id, i) => id !== newIds[i]);

    await prisma.taskAssignment.deleteMany({ where: { taskId: id } });
    if (assigneeIds.length > 0) {
      await prisma.taskAssignment.createMany({
        data: assigneeIds.map((userId: string) => ({ taskId: id, userId })),
      });
    }
    if (changed) {
      await recordAuditLog({
        action: 'UPDATED', entity: 'Tarea', entityId: id,
        detail: `"${existing.title}": asignación actualizada`,
        userId: session.userId, projectId: existing.projectId,
      });
    }
  }

  const updated = await prisma.task.findUnique({ where: { id }, include: taskInclude });
  return NextResponse.json({ task: updated });
}

export async function DELETE(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

  const existing = await prisma.task.findUnique({ where: { id } });

  if (session.role !== 'ADMIN') {
    const membership = existing?.projectId
      ? await prisma.projectMember.findUnique({
          where: { userId_projectId: { userId: session.userId, projectId: existing.projectId } },
        })
      : null;
    const isLeader = membership?.role === 'LEADER' && membership?.status === 'ACTIVE';
    if (!isLeader) return NextResponse.json({ error: 'Only ADMIN and TEAM_LEADER can delete tasks' }, { status: 403 });
  }

  await prisma.task.update({ where: { id }, data: { deleted: true } });
  await recordAuditLog({
    action: 'DELETED', entity: 'Tarea', entityId: id,
    detail: existing?.title || '',
    userId: session.userId, projectId: existing?.projectId,
  });
  return NextResponse.json({ message: 'Task deleted' });
}
