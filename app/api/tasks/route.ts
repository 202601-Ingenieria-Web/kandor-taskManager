import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET() {
  const tasks = await prisma.task.findMany({
    where: { deleted: false },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, status, priority, dueDate, estimatedHours, assigneeIds } = await request.json();

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      assignments: assigneeIds?.length
        ? { create: assigneeIds.map((userId: string) => ({ userId })) }
        : undefined,
    },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, title, description, status, priority, dueDate, estimatedHours, assigneeIds } = await request.json();

  if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.deleted) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
    },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (assigneeIds) {
    await prisma.taskAssignment.deleteMany({ where: { taskId: id } });
    if (assigneeIds.length > 0) {
      await prisma.taskAssignment.createMany({
        data: assigneeIds.map((userId: string) => ({ taskId: id, userId })),
      });
    }
  }

  const updated = await prisma.task.findUnique({
    where: { id },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  return NextResponse.json({ task: updated });
}

export async function DELETE(request: NextRequest) {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

  await prisma.task.update({ where: { id }, data: { deleted: true } });
  return NextResponse.json({ message: 'Task deleted' });
}
